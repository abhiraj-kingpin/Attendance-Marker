import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { getAnalytics, getAttendanceLog, getGeofences, getOcrStats, getUsers } from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get('/analytics', getAnalytics);
adminRouter.get('/attendance-log', getAttendanceLog);
adminRouter.get('/geofences', getGeofences);
adminRouter.get('/ocr-stats', getOcrStats);
adminRouter.get('/users', getUsers);
