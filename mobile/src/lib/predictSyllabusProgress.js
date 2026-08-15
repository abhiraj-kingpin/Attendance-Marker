const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SEMESTER_WEEKS = 16;

function weeksBetween(fromISO, toISO) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return Math.max(0, (to.getTime() - from.getTime()) / MS_PER_WEEK);
}

/**
 * Estimates which syllabus block classes should currently be on, given a
 * commencement date and how many blocks the syllabus has. This is a linear
 * pace model — real classes don't move at a perfectly even rate, so this is
 * a rough guide, not a claim about what actually happened in the room. The
 * `userReportedIndex` correction (0-based, matches `blocks` order) always
 * overrides the estimate once the user has told us the real progress.
 */
export function predictSyllabusProgress({
  blocks,
  commencementDate,
  today = new Date().toISOString().slice(0, 10),
  semesterWeeks = DEFAULT_SEMESTER_WEEKS,
  completedCount = null,
  userReportedIndex = null,
}) {
  if (!blocks || blocks.length === 0) {
    return { expectedIndex: null, expectedLabel: null, status: 'no-data', confidence: 0 };
  }
  if (!commencementDate) {
    return { expectedIndex: null, expectedLabel: null, status: 'no-data', confidence: 0 };
  }

  const weeksElapsed = weeksBetween(commencementDate, today);
  const paceRatio = Math.min(1, weeksElapsed / semesterWeeks);
  const expectedIndex = Math.min(blocks.length - 1, Math.max(0, Math.ceil(paceRatio * blocks.length) - 1));
  const expectedLabel = blocks[expectedIndex]?.name ?? null;

  const actualIndex = userReportedIndex ?? (completedCount != null ? Math.max(0, completedCount - 1) : null);

  let status = 'unknown';
  let aheadBy = 0;
  if (actualIndex != null) {
    aheadBy = actualIndex - expectedIndex;
    if (aheadBy > 0) status = 'ahead';
    else if (aheadBy < 0) status = 'behind';
    else status = 'on-track';
  }

  // Confidence in the estimate itself (not the correction) decays the
  // further into the semester we are without a user correction, since
  // real class pacing drifts from a straight line over time.
  const confidence = actualIndex != null ? 100 : Math.round(Math.max(30, 90 - weeksElapsed * 2));

  return { expectedIndex, expectedLabel, actualIndex, status, aheadBy, weeksElapsed: Math.round(weeksElapsed * 10) / 10, confidence };
}
