import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { ProjectStatus, UserRole } from '@prisma/client';
import { createActivity } from './activity.service';
import { createNotification } from './notification.service';

const MANAGER_ROLES: UserRole[] = ['admin', 'product_manager'];

export async function getProjects(query: any, requestingUserId?: string, requestingUserRole?: UserRole) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.status) where.status = query.status as ProjectStatus;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

  // Non-managers only see projects they own or have tasks assigned to them
  if (requestingUserId && requestingUserRole && !MANAGER_ROLES.includes(requestingUserRole)) {
    if (!query.ownerId) {
      where.OR = [
        { ownerId: requestingUserId },
        { tasks: { some: { assigneeId: requestingUserId } } },
      ];
    }
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, skip, take: limit,
      include: { owner: { select: { id: true, name: true, avatar: true } }, _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);
  return paginatedResponse(projects, total, { page, limit, skip });
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, avatar: true } }, sprints: true, _count: { select: { tasks: true } } },
  });
  if (!project) throw new AppError('Project not found', 404);
  return project;
}

export async function createProject(data: any, ownerId: string) {
  const project = await prisma.project.create({
    data: { ...data, ownerId },
    include: { owner: { select: { id: true, name: true, avatar: true } } },
  });
  await createActivity({ userId: ownerId, action: 'created project', target: project.name, type: 'general' });
  return project;
}

export async function updateProject(id: string, data: any, updaterId?: string) {
  const prev = await prisma.project.findUnique({ where: { id }, select: { status: true, name: true } });
  const project = await prisma.project.update({ where: { id }, data });

  if (updaterId) {
    await createActivity({ userId: updaterId, action: 'updated project', target: project.name, type: 'general' });

    // Notify on status change
    if (data.status && data.status !== prev?.status) {
      const statusLabel = (data.status as string).replace(/_/g, ' ');
      // Notify all assignees on this project
      const assignees = await prisma.task.findMany({
        where: { projectId: id, assigneeId: { not: null } },
        select: { assigneeId: true },
        distinct: ['assigneeId'],
      });
      const recipientIds = [...new Set(assignees.map(a => a.assigneeId!).filter(uid => uid !== updaterId))];
      // Also notify admins/product_managers
      const superiors = await prisma.user.findMany({
        where: { role: { in: ['admin', 'product_manager'] }, id: { not: updaterId } },
        select: { id: true },
      });
      const allIds = [...new Set([...recipientIds, ...superiors.map(s => s.id)])];
      await Promise.all(allIds.map(uid => createNotification({
        userId: uid,
        title: `Project ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`,
        message: `Project "${project.name}" status changed to ${statusLabel}`,
        type: data.status === 'completed' ? 'success' : data.status === 'on_hold' ? 'warning' : 'info',
        link: '/projects',
      })));
    }
  }
  return project;
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
}
