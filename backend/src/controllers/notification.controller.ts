import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as notificationService from '../services/notification.service';

export const getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await notificationService.getNotifications(req.user!.id, req.query);
  res.json({ success: true, ...result });
});

export const getUnreadCount = catchAsync(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  res.json({ success: true, data: { count } });
});

export const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
  res.json({ success: true, data: notification });
});

export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  await notificationService.markAllAsRead(req.user!.id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const deleteNotification = catchAsync(async (req: AuthRequest, res: Response) => {
  await notificationService.deleteNotification(req.params.id as string);
  res.status(204).send();
});
