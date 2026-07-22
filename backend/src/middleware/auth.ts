import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole; email: string };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('No token provided', 401, 'UNAUTHORIZED');

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401, 'TOKEN_INVALID');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
    if (!roles.includes(req.user.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    next();
  };
}
