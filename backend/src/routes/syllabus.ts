import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { uploadSyllabus, confirmBlocks, listBlocksForSubject } from '../controllers/syllabusController';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const syllabusRouter = Router();

syllabusRouter.use(requireAuth);
syllabusRouter.post('/upload', upload.single('pdf_file'), uploadSyllabus);
syllabusRouter.post('/confirm-blocks', confirmBlocks);
syllabusRouter.get('/:subjectId', listBlocksForSubject);
