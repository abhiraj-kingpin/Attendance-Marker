import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const createSchema = z.object({
  subject_id: z.string(),
  day_of_week: z.enum(DAY_KEYS),
  start_time: z.string().regex(/^\d{1,2}:\d{2}$/),
  end_time: z.string().regex(/^\d{1,2}:\d{2}$/),
});

function toApi(s: { id: string; subjectId: string; dayOfWeek: string; startTime: string; endTime: string }) {
  return { id: s.id, subject_id: s.subjectId, day_of_week: s.dayOfWeek, start_time: s.startTime, end_time: s.endTime };
}

export async function createSchedule(req: AuthedRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const subject = await prisma.subject.findFirst({ where: { id: data.subject_id, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const schedule = await prisma.classSchedule.create({
    data: {
      subjectId: data.subject_id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
    },
  });
  res.status(201).json(toApi(schedule));
}

export async function listScheduleForSubject(req: AuthedRequest, res: Response) {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.subjectId, userId: req.userId! } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const schedules = await prisma.classSchedule.findMany({ where: { subjectId: req.params.subjectId } });
  res.json(schedules.map(toApi));
}
