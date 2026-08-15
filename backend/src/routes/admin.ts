import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import {
  getAnalytics,
  getAttendanceLog,
  getGeofences,
  getOcrStats,
  getUsers,
  getSettings,
  updateSettings,
  getErrorLogs,
} from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get('/analytics', getAnalytics);
adminRouter.get('/attendance-log', getAttendanceLog);
adminRouter.get('/geofences', getGeofences);
adminRouter.get('/ocr-stats', getOcrStats);
adminRouter.get('/users', getUsers);
adminRouter.get('/settings', getSettings);
adminRouter.put('/settings', updateSettings);
adminRouter.get('/errors', getErrorLogs);
