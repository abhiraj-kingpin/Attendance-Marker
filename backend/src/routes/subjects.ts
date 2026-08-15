import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subjectsController';

export const subjectsRouter = Router();

subjectsRouter.use(requireAuth);
subjectsRouter.get('/', listSubjects);
subjectsRouter.post('/', createSubject);
subjectsRouter.put('/:id', updateSubject);
subjectsRouter.delete('/:id', deleteSubject);
