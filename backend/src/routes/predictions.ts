import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { checkPrediction, correctPrediction } from '../controllers/predictionController';

export const predictionsRouter = Router();

predictionsRouter.use(requireAuth);
predictionsRouter.post('/check/:subjectId', checkPrediction);
predictionsRouter.post('/correct/:subjectId', correctPrediction);
