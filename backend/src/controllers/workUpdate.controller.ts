import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as workUpdateService from '../services/workUpdate.service';

const isAdmin = (role: string) => role === 'admin' || role === 'hr' || role === 'product_manager';

export const getWorkUpdates = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = isAdmin(req.user!.role);
  const result = await workUpdateService.getWorkUpdates(req.query, req.user!.id, admin);
  res.json({ success: true, ...result });
});

export const getWorkUpdateById = catchAsync(async (req: AuthRequest, res: Response) => {
  const update = await workUpdateService.getWorkUpdateById(req.params.id as string);
  res.json({ success: true, data: update });
});

export const createWorkUpdate = catchAsync(async (req: AuthRequest, res: Response) => {
  const update = await workUpdateService.createWorkUpdate(req.body, req.user!.id);
  res.status(201).json({ success: true, data: update });
});

export const updateWorkUpdate = catchAsync(async (req: AuthRequest, res: Response) => {
  const update = await workUpdateService.updateWorkUpdate(req.params.id as string, req.body);
  res.json({ success: true, data: update });
});

export const deleteWorkUpdate = catchAsync(async (req: AuthRequest, res: Response) => {
  await workUpdateService.deleteWorkUpdate(req.params.id as string);
  res.status(204).send();
});
