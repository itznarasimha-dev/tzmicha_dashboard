import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as settingService from '../services/setting.service';

export const getAllSettings = catchAsync(async (req: AuthRequest, res: Response) => {
  const settings = await settingService.getAllSettings();
  res.json({ success: true, data: settings });
});

export const upsertSetting = catchAsync(async (req: AuthRequest, res: Response) => {
  const { key, value } = req.body;
  const setting = await settingService.upsertSetting(key, value);
  res.json({ success: true, data: setting });
});

export const upsertManySettings = catchAsync(async (req: AuthRequest, res: Response) => {
  const settings = await settingService.upsertManySettings(req.body);
  res.json({ success: true, data: settings });
});
