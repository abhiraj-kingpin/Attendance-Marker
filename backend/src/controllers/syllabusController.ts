import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { extractTextFromPDF, detectSyllabusContent, parseIntoBlocks } from '../services/syllabusService';

export async function uploadSyllabus(req: AuthedRequest & { file?: Express.Multer.File }, res: Response) {
  const subjectId = req.body.subject_id;
  if (!subjectId) return res.status(400).json({ error: 'subject_id is required' });
  if (!req.file) return res.status(400).json({ error: 'No pdf_file uploaded' });

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const { text, pageCount, partial } = extractTextFromPDF(req.file.buffer);
  if (!text.trim()) {
    return res.status(422).json({ error: 'Could not find readable text in that PDF — it may be scanned/image-only.' });
  }

  const { syllabusText, found } = detectSyllabusContent(text);
  const blocks = parseIntoBlocks(syllabusText);

  res.json({
    subject_id: subjectId,
    extracted_blocks: blocks.map((b, i) => ({ id: `draft-${i}`, ...b })),
    requires_review: !found || partial || blocks.some((b) => b.confidence < 70),
    total_pages_analyzed: pageCount,
  });
}

const confirmSchema = z.object({
  subject_id: z.string(),
  blocks: z.array(
    z.object({
      title: z.string().min(1),
      content: z.string().optional(),
      order: z.number().int(),
      estimated_hours: z.number().nullable().optional(),
    })
  ),
});

export async function confirmBlocks(req: AuthedRequest, res: Response) {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { subject_id, blocks } = parsed.data;

  const subject = await prisma.subject.findFirst({ where: { id: subject_id, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const saved = [];
  for (const b of blocks) {
    const block = await prisma.syllabusBlock.create({
      data: {
        subjectId: subject_id,
        title: b.title,
        content: b.content ?? null,
        blockOrder: b.order,
        estimatedHours: b.estimated_hours ?? null,
      },
    });
    await prisma.studySchedule.create({ data: { blockId: block.id, status: 'not_started' } });
    saved.push(block);
  }

  res.json({ saved_blocks: saved, total_blocks: saved.length });
}

export async function listBlocksForSubject(req: AuthedRequest, res: Response) {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.subjectId, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const blocks = await prisma.syllabusBlock.findMany({
    where: { subjectId: req.params.subjectId },
    orderBy: { blockOrder: 'asc' },
    include: { studySchedule: true },
  });
  res.json(blocks);
}
