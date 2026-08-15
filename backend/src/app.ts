import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { subjectsRouter } from './routes/subjects';
import { attendanceRouter } from './routes/attendance';
import { geofencesRouter, locationRouter } from './routes/geofences';
import { scheduleRouter } from './routes/schedule';
import { ocrRouter } from './routes/ocr';
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

app.use(errorHandler);
