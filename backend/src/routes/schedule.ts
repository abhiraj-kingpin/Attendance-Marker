import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createSchedule, listScheduleForSubject } from '../controllers/scheduleController';

export const scheduleRouter = Router();

scheduleRouter.use(requireAuth);
scheduleRouter.post('/', createSchedule);
scheduleRouter.get('/:subjectId', listScheduleForSubject);
