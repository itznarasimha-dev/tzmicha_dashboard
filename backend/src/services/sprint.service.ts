import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function getSprints(projectId?: string) {
  return prisma.sprint.findMany({
    where: projectId ? { projectId } : undefined,
    include: { _count: { select: { tasks: true } } },
    orderBy: { startDate: 'desc' },
  });
}

export async function getSprintById(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, avatar: true } },
          reporter: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!sprint) throw new AppError('Sprint not found', 404);
  return sprint;
}

export async function createSprint(data: any) {
  return prisma.sprint.create({ data });
}

export async function updateSprint(id: string, data: any) {
  return prisma.sprint.update({ where: { id }, data });
}

export async function deleteSprint(id: string) {
  await prisma.sprint.delete({ where: { id } });
}
