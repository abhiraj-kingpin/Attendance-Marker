import { prisma } from '../lib/prisma';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function weeksBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return Math.max(0, (to.getTime() - from.getTime()) / MS_PER_WEEK);
}

export interface PredictionResult {
  subject_id: string;
  expected_block: { id: string; title: string; content: string | null } | null;
  expected_progress_percent: number | null;
  weeks_elapsed: number | null;
  confidence: number;
  accuracy_percent: number | null;
}

/**
 * Same linear-pace model as mobile/src/lib/predictSyllabusProgress.js:
 * weeks_elapsed / semester_weeks gives a rough completion ratio, mapped
 * onto the ordered block list. A straight-line model of real class
 * pacing, not a claim about what actually happened in the room — that's
 * exactly why /api/predictions/correct exists.
 */
export async function predictClassProgress(userId: string, subjectId: string, today: string = new Date().toISOString().slice(0, 10)): Promise<PredictionResult | null> {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
  if (!subject) return null;

  const blocks = await prisma.syllabusBlock.findMany({ where: { subjectId }, orderBy: { blockOrder: 'asc' } });

  if (blocks.length === 0 || !subject.commencementDate) {
    return {
      subject_id: subjectId,
      expected_block: null,
      expected_progress_percent: null,
      weeks_elapsed: null,
      confidence: 0,
      accuracy_percent: await computeAccuracy(userId, subjectId),
    };
  }

  const weeksElapsed = weeksBetween(subject.commencementDate, today);
  const semesterWeeks = subject.semesterWeeks || 16;
  const paceRatio = Math.min(1, weeksElapsed / semesterWeeks);
  const expectedIndex = Math.min(blocks.length - 1, Math.max(0, Math.ceil(paceRatio * blocks.length) - 1));
  const expectedBlock = blocks[expectedIndex];

  const confidence = Math.round(Math.max(30, 90 - weeksElapsed * 2));

  return {
    subject_id: subjectId,
    expected_block: { id: expectedBlock.id, title: expectedBlock.title, content: expectedBlock.content },
    expected_progress_percent: Math.round(paceRatio * 1000) / 10,
    weeks_elapsed: Math.round(weeksElapsed * 10) / 10,
    confidence,
    accuracy_percent: await computeAccuracy(userId, subjectId),
  };
}

/**
 * Accuracy: of past corrections for this subject, what fraction landed
 * within one block of the prediction (accuracyImpact >= 0). Returns null
 * until there's at least one correction to measure against.
 */
async function computeAccuracy(userId: string, subjectId: string): Promise<number | null> {
  const corrections = await prisma.predictionCorrection.findMany({ where: { userId, subjectId } });
  if (corrections.length === 0) return null;
  const onTarget = corrections.filter((c) => (c.accuracyImpact ?? 0) >= 0).length;
  return Math.round((onTarget / corrections.length) * 1000) / 10;
}

export async function recordCorrection(
  userId: string,
  subjectId: string,
  actualBlockId: string,
  reason: string | null
) {
  const blocks = await prisma.syllabusBlock.findMany({ where: { subjectId }, orderBy: { blockOrder: 'asc' } });
  const actualIndex = blocks.findIndex((b) => b.id === actualBlockId);

  const prediction = await predictClassProgress(userId, subjectId);
  const expectedBlockId = prediction?.expected_block?.id ?? null;
  const expectedIndex = expectedBlockId ? blocks.findIndex((b) => b.id === expectedBlockId) : -1;

  // How far off was the prediction, in block positions — 0 is exact,
  // negative the further off it was. Clamped so one wildly-off correction
  // doesn't dominate the accuracy average.
  const distance = expectedIndex >= 0 && actualIndex >= 0 ? Math.abs(actualIndex - expectedIndex) : null;
  const accuracyImpact = distance == null ? null : Math.max(-1, 1 - distance * 0.5);

  const correction = await prisma.predictionCorrection.create({
    data: {
      userId,
      subjectId,
      expectedBlockId,
      actualBlockId,
      reason,
      accuracyImpact,
    },
  });

  const updatedPrediction = await predictClassProgress(userId, subjectId);
  return { correction, updatedPrediction };
}
