import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';
import { autoMarkAttendance } from '../services/attendanceService';

const markSchema = z.object({
  subjectId: z.string(),
  date: z.string(), // YYYY-MM-DD
  status: z.enum(['present', 'absent', 'leave']),
  method: z.enum(['manual', 'automatic']).default('manual'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracyM: z.number().optional(),
  notes: z.string().optional(),
});

export async function markAttendance(req: AuthedRequest, res: Response) {
  const parsed = markSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const subject = await prisma.subject.findFirst({ where: { id: data.subjectId, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const existing = await prisma.attendance.findFirst({
    where: { userId: req.userId!, subjectId: data.subjectId, date: data.date },
  });

  const record = existing
    ? await prisma.attendance.update({ where: { id: existing.id }, data })
    : await prisma.attendance.create({ data: { ...data, userId: req.userId! } });

  res.status(existing ? 200 : 201).json(record);
}

export async function listAttendance(req: AuthedRequest, res: Response) {
  const { subjectId } = req.query;
  const records = await prisma.attendance.findMany({
    where: { userId: req.userId!, ...(subjectId ? { subjectId: String(subjectId) } : {}) },
    orderBy: { date: 'desc' },
  });
  res.json(records);
}

export async function attendanceStats(req: AuthedRequest, res: Response) {
  const records = await prisma.attendance.findMany({ where: { userId: req.userId! } });
  const bySubject: Record<string, { present: number; total: number }> = {};

  for (const r of records) {
    bySubject[r.subjectId] ??= { present: 0, total: 0 };
    if (r.status !== 'leave') {
      bySubject[r.subjectId].total += 1;
      if (r.status === 'present') bySubject[r.subjectId].present += 1;
    }
  }

  const stats = Object.fromEntries(
    Object.entries(bySubject).map(([subjectId, { present, total }]) => [
      subjectId,
      { present, total, percentage: total === 0 ? null : Math.round((present / total) * 1000) / 10 },
    ])
  );

  res.json(stats);
}

const autoMarkSchema = z.object({
  user_latitude: z.number(),
  user_longitude: z.number(),
  gps_accuracy_meters: z.number().optional(),
});

export async function autoMark(req: AuthedRequest, res: Response) {
  const parsed = autoMarkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { user_latitude, user_longitude, gps_accuracy_meters } = parsed.data;

  const marked = await autoMarkAttendance(req.userId!, user_latitude, user_longitude, gps_accuracy_meters ?? null);

  res.json({
    marked_subjects: marked,
    timestamp: new Date().toISOString(),
    location_accuracy: gps_accuracy_meters ?? null,
  });
}
