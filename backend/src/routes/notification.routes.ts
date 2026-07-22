import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', getNotifications);
notificationRouter.get('/unread-count', getUnreadCount);
notificationRouter.patch('/read-all', markAllAsRead);
notificationRouter.patch('/:id/read', markAsRead);
notificationRouter.delete('/:id', deleteNotification);
