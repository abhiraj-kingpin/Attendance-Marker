import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from './auth';

/** Must run after requireAuth — depends on req.userId already being set. */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
}
