import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { prisma } from '../config/prisma';

export const loginController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

export const refreshController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  const result = await authService.refresh(refreshToken);
  res.json({ success: true, data: result });
});

export const logoutController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.json({ success: true, message: 'Logged out' });
});

export const resetPasswordController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ success: false, message: 'No account found with that email' });
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  res.json({ success: true, message: 'Password updated' });
});

export const getMeController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  res.json({ success: true, data: user });
});
