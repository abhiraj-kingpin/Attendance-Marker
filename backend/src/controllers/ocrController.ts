import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { extractTimetableFromImage, classifyText } from '../services/ocrService';

export async function scanTimetable(req: AuthedRequest & { file?: Express.Multer.File }, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'No image_file uploaded' });

  let rawText: string;
  try {
    rawText = await extractTimetableFromImage(req.file.buffer);
  } catch {
    return res.status(422).json({ error: 'Could not read text from that image — try a clearer, well-lit photo.' });
  }

  const { classified, requiresConfirmation } = classifyText(rawText);

  res.json({
    raw_extracted: rawText,
    classified,
    requires_confirmation: requiresConfirmation,
  });
}

const correctionSchema = z.object({
  original_text: z.string(),
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
