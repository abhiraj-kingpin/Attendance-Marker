import express from 'express';
// Express 4 does not catch rejected promises from async route handlers —
// an unhandled error in any of them crashes the whole process instead of
// reaching errorHandler below (confirmed directly: a bare `throw` inside
// an async handler took the entire server down, not just the one
// request). This patches Express's router to forward those rejections to
// the error middleware like Express 5 does natively. Must be required
// before any routes are registered.
import 'express-async-errors';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { subjectsRouter } from './routes/subjects';
import { attendanceRouter } from './routes/attendance';
import { geofencesRouter, locationRouter } from './routes/geofences';
import { scheduleRouter } from './routes/schedule';
import { ocrRouter } from './routes/ocr';
import { syllabusRouter } from './routes/syllabus';
import { predictionsRouter } from './routes/predictions';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/geofences', geofencesRouter);
app.use('/api/location', locationRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/syllabus', syllabusRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);
