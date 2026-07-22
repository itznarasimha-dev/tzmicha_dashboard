import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as leaveService from '../services/leave.service';
import { LeaveStatus } from '@prisma/client';

const canApprove = (role: string) => role === 'admin' || role === 'hr';

export const getLeaveRequests = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = canApprove(req.user!.role);
  const result = await leaveService.getLeaveRequests(req.query, req.user!.id, admin);
  res.json({ success: true, ...result });
});

export const createLeaveRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const request = await leaveService.createLeaveRequest(req.body, req.user!.id);
  res.status(201).json({ success: true, data: request });
});

export const updateLeaveStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!canApprove(req.user!.role)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update leave status' });
  }
  const request = await leaveService.updateLeaveStatus(req.params.id as string, req.body.status as LeaveStatus, req.user!.id);
  res.json({ success: true, data: request });
});

export const getLeaveBalance = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = (req.params.userId as string) || req.user!.id;
  const balance = await leaveService.getLeaveBalance(userId);
  res.json({ success: true, data: balance });
});
