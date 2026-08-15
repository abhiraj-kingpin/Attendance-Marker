import { Router } from 'express';
import { signup, login, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, me);
