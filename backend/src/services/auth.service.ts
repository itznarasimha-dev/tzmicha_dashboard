import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, withRetry } from '../config/prisma';
import { AppError } from '../utils/AppError';

function signAccess(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any);
}

function signRefresh(payload: object) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any);
}

export async function login(email: string, password: string) {
  const user = await withRetry(() =>
    prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  );
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  if (user.status === 'inactive') throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');

  const payload = { id: user.id, role: user.role, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await withRetry(() =>
    prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })
  );

  const { password: _, ...safeUser } = user;
  return { accessToken, refreshToken, user: safeUser };
}

export async function refresh(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) throw new AppError('Invalid refresh token', 401, 'TOKEN_INVALID');

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    const accessToken = signAccess({ id: payload.id, role: payload.role, email: payload.email });
    return { accessToken };
  } catch {
    throw new AppError('Invalid refresh token', 401, 'TOKEN_INVALID');
  }
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function getMe(userId: string) {
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, department: true, title: true, avatar: true, status: true, phone: true, location: true, bio: true, skills: true, startDate: true },
    })
  );
  if (!user) throw new AppError('User not found', 404);
  return user;
}
