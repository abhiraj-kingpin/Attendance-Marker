import { isDateExcluded } from './dates';

export const SAFE_THRESHOLD = 0.75;
const EPS = 1e-9;

/**
 * Compute held/attended/percentage for one subject from the flat attendance
 * record map, ignoring "No Class" marks and anything inside an excluded
 * date range.
 */
export function computeSubjectStats(subjectId, attendanceMap, excludedRanges) {
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
    ...liveAdvice(held, attended),
  };
}

/**
 * The "75% rule" live calculator.
 * - If below threshold: how many classes in a row must be attended to
 *   climb back to >= 75%.
 * - If at/above threshold: how many classes can safely be missed in a row
 *   and stay >= 75%.
 */
export function liveAdvice(held, attended) {
  if (held === 0) {
    return { status: 'none', canMiss: 0, mustAttend: 0 };
  }

  const ratio = attended / held;

  if (ratio + EPS >= SAFE_THRESHOLD) {
    const canMiss = Math.max(0, Math.floor(attended / SAFE_THRESHOLD + EPS) - held);
    return { status: 'safe', canMiss, mustAttend: 0 };
  }

  const mustAttend = Math.max(0, Math.ceil(3 * held - 4 * attended - EPS));
  return { status: 'risk', canMiss: 0, mustAttend };
}

export function computeAllSubjectStats(subjects, attendanceMap, excludedRanges) {
  const stats = {};
  for (const subject of subjects) {
    stats[subject.id] = computeSubjectStats(subject.id, attendanceMap, excludedRanges);
  }
  return stats;
}

export function computeOverallStats(subjectStatsById) {
  let held = 0;
  let attended = 0;
  for (const s of Object.values(subjectStatsById)) {
    held += s.held;
    attended += s.attended;
  }
  const percentage = held === 0 ? null : (attended / held) * 100;
  return { held, attended, missed: held - attended, percentage, ...liveAdvice(held, attended) };
}

export function attendanceKey(date, periodId) {
  return `${date}__${periodId}`;
}
