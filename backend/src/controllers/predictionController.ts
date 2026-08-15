import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { predictClassProgress, recordCorrection } from '../services/predictionService';

export async function checkPrediction(req: AuthedRequest, res: Response) {
  const result = await predictClassProgress(req.userId!, req.params.subjectId);
  if (!result) return res.status(404).json({ error: 'Subject not found' });
  res.json(result);
}

const correctSchema = z.object({
  actual_block_id: z.string(),
  reason: z.string().optional(),
});

export async function correctPrediction(req: AuthedRequest, res: Response) {
  const parsed = correctSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const before = await predictClassProgress(req.userId!, req.params.subjectId);
  if (!before) return res.status(404).json({ error: 'Subject not found' });

  const { correction, updatedPrediction } = await recordCorrection(
    req.userId!,
    req.params.subjectId,
    parsed.data.actual_block_id,
    parsed.data.reason ?? null
  );

  // Treat "no accuracy data yet" as a baseline of 0 rather than excluding
  // the comparison entirely — otherwise the very first correction ever
  // reads as "not improved" simply because there was nothing to compare
  // against, which is misleading when accuracy clearly went from unknown
  // to a real number.
  const accuracyImproved =
    (updatedPrediction?.accuracy_percent ?? 0) >= (before.accuracy_percent ?? 0);

  res.json({ correction, updated_prediction: updatedPrediction, accuracy_improved: accuracyImproved });
}
