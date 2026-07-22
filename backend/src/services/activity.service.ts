import { prisma } from '../config/prisma';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { ActivityType } from '@prisma/client';

export async function getActivities(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.userId) where.userId = query.userId;
  if (query.type) where.type = query.type as ActivityType;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where, skip, take: limit,
      include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activity.count({ where }),
  ]);
  return paginatedResponse(activities, total, { page, limit, skip });
}

export async function createActivity(data: { userId: string; action: string; target: string; type?: ActivityType }) {
  return prisma.activity.create({ data });
}
