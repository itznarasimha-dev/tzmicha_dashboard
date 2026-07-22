import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { RoadmapStatus, TaskPriority } from '@prisma/client';

export async function getRoadmapItems(query: any) {
  const where: any = {};
  if (query.status) where.status = query.status as RoadmapStatus;
  if (query.year) where.year = parseInt(query.year);
  if (query.quarter) where.quarter = query.quarter;
  if (query.team) where.team = { contains: query.team, mode: 'insensitive' };

  return prisma.roadmapItem.findMany({
    where,
    orderBy: [{ year: 'asc' }, { quarter: 'asc' }, { priority: 'asc' }],
  });
}

export async function getRoadmapItemById(id: string) {
  const item = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!item) throw new AppError('Roadmap item not found', 404);
  return item;
}

export async function createRoadmapItem(data: any) {
  return prisma.roadmapItem.create({ data });
}

export async function updateRoadmapItem(id: string, data: any) {
  return prisma.roadmapItem.update({ where: { id }, data });
}

export async function deleteRoadmapItem(id: string) {
  await prisma.roadmapItem.delete({ where: { id } });
}
