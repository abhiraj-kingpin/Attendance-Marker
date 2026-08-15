import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { markAttendance, listAttendance, attendanceStats, autoMark } from '../controllers/attendanceController';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.post('/', markAttendance);
attendanceRouter.get('/', listAttendance);
attendanceRouter.get('/stats', attendanceStats);
attendanceRouter.post('/auto-mark', autoMark);
