import { prisma } from '../lib/prisma';
import { isUserInGeofence } from './locationService';

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function currentDayKey(now: Date): string {
  return DAY_KEYS[now.getDay()];
}

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isScheduleActiveNow(schedule: { dayOfWeek: string; startTime: string; endTime: string }, now: Date): boolean {
  if (schedule.dayOfWeek !== currentDayKey(now)) return false;
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  if (start == null || end == null) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= start && nowMinutes < end;
}

function todayISO(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export interface MarkedSubject {
  subject_id: string;
  room_number: string | null;
  status: 'marked';
}

/**
 * Marks attendance for every subject whose geofence the caller is
 * currently inside AND that has a class scheduled right now AND hasn't
 * already been marked today. Never guesses a "current period" without an
 * explicit schedule entry, and never re-marks something already recorded
 * today — both checked in the database, not just in memory, so concurrent
 * calls can't double-mark.
 */
export async function autoMarkAttendance(
  userId: string,
  userLatitude: number,
  userLongitude: number,
  accuracyMeters: number | null = null,
  now: Date = new Date()
): Promise<MarkedSubject[]> {
  const geofences = await prisma.geofence.findMany({
    where: { userId, subjectId: { not: null } },
  });

  const insideWithSubject = geofences.filter(
    (g) => g.subjectId != null && isUserInGeofence(userLatitude, userLongitude, g.latitude, g.longitude, g.radiusM)
  );
  if (insideWithSubject.length === 0) return [];

  const date = todayISO(now);
  const marked: MarkedSubject[] = [];

  for (const geofence of insideWithSubject) {
    const subjectId = geofence.subjectId!;

    const schedules = await prisma.classSchedule.findMany({ where: { subjectId } });
    const classNow = schedules.some((s) => isScheduleActiveNow(s, now));
    if (!classNow) continue;

    const existing = await prisma.attendance.findFirst({ where: { userId, subjectId, date } });
    if (existing) continue;

    await prisma.attendance.create({
      data: {
        userId,
        subjectId,
        date,
        status: 'present',
        method: 'automatic',
        geofenceId: geofence.id,
        latitude: userLatitude,
        longitude: userLongitude,
        accuracyM: accuracyMeters,
      },
    });

    marked.push({ subject_id: subjectId, room_number: geofence.roomNumber, status: 'marked' });
  }

  return marked;
}
