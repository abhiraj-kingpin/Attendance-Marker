import { isDateExcluded, addDaysISO, dayKeyFromISO } from './dates';

export const DEFAULT_TARGET = 0.75;
const EPS = 1e-9;

export function computeSubjectStats(subjectId, attendanceMap, excludedRanges, target = DEFAULT_TARGET) {
  let held = 0;
  let attended = 0;

  for (const record of Object.values(attendanceMap)) {
    if (record.subjectId !== subjectId) continue;
    if (record.status === 'noclass') continue;
    if (isDateExcluded(record.date, excludedRanges)) continue;
    if (record.status === 'present' || record.status === 'absent') {
      held += 1;
      if (record.status === 'present') attended += 1;
    }
  }

  const percentage = held === 0 ? null : (attended / held) * 100;

  return {
    held,
    attended,
    missed: held - attended,
    percentage,
    ...liveAdvice(held, attended, target),
  };
}

export function liveAdvice(held, attended, target = DEFAULT_TARGET) {
  if (held === 0) {
    return { status: 'none', canMiss: 0, mustAttend: 0 };
  }

  const ratio = attended / held;

  if (ratio + EPS >= target) {
    const canMiss = Math.max(0, Math.floor(attended / target + EPS) - held);
    return { status: 'safe', canMiss, mustAttend: 0 };
  }

  const mustAttend = Math.max(0, Math.ceil((target * held - attended) / (1 - target) - EPS));
  return { status: 'risk', canMiss: 0, mustAttend };
}

export function simulateAdditionalMisses(stats, extraMisses, target = DEFAULT_TARGET) {
  const held = stats.held + Math.max(0, extraMisses);
  const attended = stats.attended;
  const percentage = held === 0 ? null : (attended / held) * 100;
  return { held, attended, missed: held - attended, percentage, ...liveAdvice(held, attended, target) };
}

export function computeAllSubjectStats(subjects, attendanceMap, excludedRanges, target = DEFAULT_TARGET) {
  const stats = {};
  for (const subject of subjects) {
    stats[subject.id] = computeSubjectStats(subject.id, attendanceMap, excludedRanges, target);
  }
  return stats;
}

export function computeOverallStats(subjectStatsById, target = DEFAULT_TARGET) {
  let held = 0;
  let attended = 0;
  for (const s of Object.values(subjectStatsById)) {
    held += s.held;
    attended += s.attended;
  }
  const percentage = held === 0 ? null : (attended / held) * 100;
  return { held, attended, missed: held - attended, percentage, ...liveAdvice(held, attended, target) };
}

export function attendanceKey(date, periodId) {
  return `${date}__${periodId}`;
}

export function dayStatus(date, periods, attendanceMap, excludedRanges) {
  if (isDateExcluded(date, excludedRanges)) return 'excluded';
  if (!periods || periods.length === 0) return null;

  let sawPresent = false;
  let sawAbsent = false;
  let sawAny = false;

  for (const period of periods) {
    const record = attendanceMap[attendanceKey(date, period.id)];
    if (!record || record.status === 'noclass') continue;
    sawAny = true;
    if (record.status === 'present') sawPresent = true;
    if (record.status === 'absent') sawAbsent = true;
  }

  if (!sawAny) return null;
  if (sawPresent && sawAbsent) return 'mixed';
  if (sawAbsent) return 'absent';
  return 'present';
}

export function rankUpcomingClasses({
  subjects,
  timetable,
  attendance,
  excludedRanges,
  target = DEFAULT_TARGET,
  fromDate,
  daysAhead = 7,
  excludePeriodId = null,
}) {
  const statsBySubject = computeAllSubjectStats(subjects, attendance, excludedRanges, target);
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  function urgency(stats) {
    if (stats.status === 'risk') return 1000 + stats.mustAttend;
    if (stats.status === 'safe') return -stats.canMiss;
    return 0;
  }

  const results = [];
  for (let i = 0; i < daysAhead; i++) {
    const iso = addDaysISO(fromDate, i);
    if (isDateExcluded(iso, excludedRanges)) continue;
    const periods = timetable[dayKeyFromISO(iso)] || [];
    for (const period of periods) {
      if (period.id === excludePeriodId) continue;
      if (attendance[attendanceKey(iso, period.id)]) continue;
      const subject = subjectById[period.subjectId];
      if (!subject) continue;
      const stats = statsBySubject[subject.id];
      results.push({ date: iso, period, subject, stats, score: urgency(stats) });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
