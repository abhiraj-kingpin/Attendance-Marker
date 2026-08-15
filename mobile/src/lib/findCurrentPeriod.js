import { dayKeyFromISO, todayISO, isDateExcluded } from './dates';

function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Returns the period currently in session right now, if any — only
 * considers periods with both a start and end time set (see
 * TimetableSection's optional per-period time editor). Returns null if
 * today is excluded, nothing's scheduled, or no period has times set.
 */
export function findCurrentPeriod({ timetable, excludedRanges = [], now = new Date() }) {
  const today = todayISO();
  if (isDateExcluded(today, excludedRanges)) return null;

  const dayKey = dayKeyFromISO(today);
  const periods = timetable[dayKey] || [];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const period of periods) {
    const start = toMinutes(period.startTime);
    const end = toMinutes(period.endTime);
    if (start == null || end == null) continue;
    if (nowMinutes >= start && nowMinutes < end) return period;
  }
  return null;
}
