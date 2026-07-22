import { Response } from 'express';
import { catchAsync, AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/user.service';
import { supabase, AVATAR_BUCKET } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await userService.getUsers(req.query);
  res.json({ success: true, ...result });
});

export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  res.json({ success: true, data: user });
});

export const createUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
  res.json({ success: true, data: user });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const { newPassword } = req.body;
  await userService.changePassword(req.params.id as string, newPassword);
  res.json({ success: true, message: 'Password updated' });
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id as string);
  res.status(204).send();
});

export const uploadAvatar = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id as string;
  if (!req.file) throw new AppError('No file uploaded', 400);

  const ext = req.file.mimetype.split('/')[1];
  const path = `${userId}/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

  if (error) throw new AppError(error.message, 500);

  const { data: { publicUrl } } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const user = await userService.updateUser(userId, { avatar: publicUrl });
  // Sync into any cached auth store
  res.json({ success: true, data: { avatar: publicUrl, user } });
});
