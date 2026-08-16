import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { extractTimetableFromImage, classifyText, buildConfirmationList } from '../services/ocrService';
import { classifyTimetableWithLLM, isLlmAvailable } from '../services/llmService';

export async function scanTimetable(req: AuthedRequest & { file?: Express.Multer.File }, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'No image_file uploaded' });

  let rawText: string;
  try {
    rawText = await extractTimetableFromImage(req.file.buffer);
  } catch {
    await prisma.ocrScanLog.create({ data: { userId: req.userId!, success: false } });
    return res.status(422).json({ error: 'Could not read text from that image — try a clearer, well-lit photo.' });
  }

  // Gemini gets first pass if a key is configured — genuinely more capable
  // at judging ambiguous/noisy OCR text than fixed regex rules. Falls back
  // to the heuristic classifier on any failure (missing key, network
  // error, quota, malformed response) so a scan never breaks over this.
  let classified = await classifyTimetableWithLLM(rawText);
  let usedLlm = classified != null;
  let requiresConfirmation;
  if (classified) {
    requiresConfirmation = buildConfirmationList(classified);
  } else {
    ({ classified, requiresConfirmation } = classifyText(rawText));
  }

  await prisma.ocrScanLog.create({ data: { userId: req.userId!, success: true } });

  res.json({
    raw_extracted: rawText,
    classified,
    requires_confirmation: requiresConfirmation,
    classification_method: usedLlm ? 'gemini' : 'heuristic',
    llm_available: isLlmAvailable(),
  });
}

const correctionSchema = z.object({
  original_text: z.string(),
  original_type: z.enum(['subject', 'teacher', 'break', 'room', 'time']).optional(),
  corrected_type: z.enum(['subject', 'teacher', 'break', 'room', 'time']),
});

const confirmSchema = z.object({
  user_corrections: z.array(correctionSchema).default([]),
  subjects: z.array(z.object({ name: z.string().min(1), teacher: z.string().optional(), room: z.string().optional() })).default([]),
});

export async function confirmTimetable(req: AuthedRequest, res: Response) {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { user_corrections, subjects } = parsed.data;

  if (user_corrections.length > 0) {
    await prisma.ocrCorrection.createMany({
      data: user_corrections.map((c) => ({
        userId: req.userId!,
        originalText: c.original_text,
        originalType: c.original_type ?? null,
        correctedType: c.corrected_type,
      })),
    });
  }

  const saved = [];
  for (const s of subjects) {
    const subject = await prisma.subject.create({
      data: { userId: req.userId!, name: s.name.trim(), teacher: s.teacher ?? null, roomNumber: s.room ?? null },
    });
    saved.push(subject);
  }

  res.json({ saved_subjects: saved, timestamp: new Date().toISOString() });
}
