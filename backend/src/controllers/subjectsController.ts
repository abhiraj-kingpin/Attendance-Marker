import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';

const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  teacher: z.string().optional(),
  credits: z.number().int().optional(),
  courseType: z.enum(['theory', 'lab', 'practical']).optional(),
  roomNumber: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function listSubjects(req: AuthedRequest, res: Response) {
  const subjects = await prisma.subject.findMany({ where: { userId: req.userId! } });
  res.json(subjects.map(toApi));
}

export async function createSubject(req: AuthedRequest, res: Response) {
  const parsed = subjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { tags, ...rest } = parsed.data;
  const subject = await prisma.subject.create({
    data: { ...rest, userId: req.userId!, tags: tags ? JSON.stringify(tags) : null },
  });
  res.status(201).json(toApi(subject));
}

export async function updateSubject(req: AuthedRequest, res: Response) {
  const parsed = subjectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { tags, ...rest } = parsed.data;

  const existing = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!existing) return res.status(404).json({ error: 'Subject not found' });

  const subject = await prisma.subject.update({
    where: { id: req.params.id },
    data: { ...rest, ...(tags ? { tags: JSON.stringify(tags) } : {}) },
  });
  res.json(toApi(subject));
}

export async function deleteSubject(req: AuthedRequest, res: Response) {
  const existing = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!existing) return res.status(404).json({ error: 'Subject not found' });
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

function toApi(subject: { tags: string | null; [key: string]: unknown }) {
  return { ...subject, tags: subject.tags ? JSON.parse(subject.tags) : [] };
}
