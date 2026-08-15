import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const stack = err instanceof Error ? err.stack ?? null : null;

  // Best-effort — never let logging the error be the reason the response fails.
  prisma.errorLog.create({ data: { message, stack, path: req.path } }).catch(() => {});

  res.status(500).json({ error: message });
}
