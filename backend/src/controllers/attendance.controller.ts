import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as attendanceService from '../services/attendance.service';

export const getAttendance = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await attendanceService.getAttendance(req.query);
  res.json({ success: true, ...result });
});

export const upsertAttendance = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, date, ...data } = req.body;
  const record = await attendanceService.upsertAttendance(userId || req.user!.id, date, data);
  res.json({ success: true, data: record });
});
