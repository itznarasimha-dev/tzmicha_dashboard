import { prisma } from '../config/prisma';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { NotificationType } from '@prisma/client';

export async function getNotifications(userId: string, query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = { userId };
  if (query.read !== undefined) where.read = query.read === 'true';

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ]);
  return paginatedResponse(notifications, total, { page, limit, skip });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function createNotification(data: { userId: string; title: string; message: string; type?: NotificationType; link?: string }) {
  return prisma.notification.create({ data });
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({ where: { id } });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
