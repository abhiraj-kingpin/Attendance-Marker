import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { scanTimetable, confirmTimetable } from '../controllers/ocrController';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const ocrRouter = Router();

ocrRouter.use(requireAuth);
ocrRouter.post('/scan-timetable', upload.single('image_file'), scanTimetable);
ocrRouter.post('/confirm-timetable', confirmTimetable);
