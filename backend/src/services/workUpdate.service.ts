import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { createNotification } from './notification.service';
import { createActivity } from './activity.service';

export async function getWorkUpdates(query: any, userId?: string, isAdmin = false) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (!isAdmin && userId) where.userId = userId;
  if (query.userId && isAdmin) where.userId = query.userId;
  if (query.date) where.date = { gte: new Date(query.date), lt: new Date(new Date(query.date).getTime() + 86400000) };

  const [updates, total] = await Promise.all([
    prisma.workUpdate.findMany({
      where, skip, take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        tasks: true,
      },
      orderBy: { date: 'desc' },
    }),
    prisma.workUpdate.count({ where }),
  ]);
  return paginatedResponse(updates, total, { page, limit, skip });
}

export async function getWorkUpdateById(id: string) {
  const update = await prisma.workUpdate.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, avatar: true, role: true } }, tasks: true },
  });
  if (!update) throw new AppError('Work update not found', 404);
  return update;
}

export async function createWorkUpdate(data: any, userId: string) {
  const { tasks, ...rest } = data;
  const update = await prisma.workUpdate.create({
    data: {
      ...rest,
      userId,
      submittedAt: new Date(),
      tasks: tasks ? { create: tasks } : undefined,
    },
    include: { tasks: true, user: { select: { id: true, name: true, role: true } } },
  });

  // Sync completed/blocked task statuses back to actual Task records
  if (tasks?.length) {
    for (const t of tasks) {
      if (!t.ticketRef) continue;
      // ticketRef stores the full task id
      const task = await prisma.task.findFirst({
        where: { id: t.ticketRef, assigneeId: userId },
      });
      if (!task) continue;
      if (t.status === 'completed' && task.status !== 'done') {
        await prisma.task.update({ where: { id: task.id }, data: { status: 'done', loggedHours: (task.loggedHours ?? 0) + (t.hours ?? 0) } });
      } else if (t.status === 'in_progress' && task.status === 'todo') {
        await prisma.task.update({ where: { id: task.id }, data: { status: 'in_progress', loggedHours: (task.loggedHours ?? 0) + (t.hours ?? 0) } });
      } else if (t.status === 'blocked' && task.status !== 'blocked') {
        await prisma.task.update({ where: { id: task.id }, data: { status: 'blocked', loggedHours: (task.loggedHours ?? 0) + (t.hours ?? 0) } });
      } else if (t.hours) {
        await prisma.task.update({ where: { id: task.id }, data: { loggedHours: (task.loggedHours ?? 0) + (t.hours ?? 0) } });
      }
    }
  }

  // Determine which roles receive this notification based on submitter's role
  const devQaRoles = ['frontend_dev', 'backend_dev', 'qa'];
  const notifyRoles = devQaRoles.includes(update.user.role)
    ? ['admin', 'product_manager']
    : ['admin'];

  const recipients = await prisma.user.findMany({
    where: { role: { in: notifyRoles as any }, id: { not: userId } },
    select: { id: true },
  });

  const roleLabel = update.user.role.replace(/_/g, ' ');
  await Promise.all(recipients.map(r => createNotification({
    userId: r.id,
    title: 'Work Update Submitted',
    message: `${update.user.name} (${roleLabel}) logged ${tasks?.length ?? 0} task(s) — ${update.user.name.split(' ')[0]}'s daily update is ready to review`,
    type: 'info',
    link: '/work-updates',
  })));

  // Log activity
  await createActivity({
    userId,
    action: 'submitted work update',
    target: `${tasks?.length ?? 0} task(s) · ${update.totalHours}h logged`,
    type: 'task',
  });

  return update;
}

export async function updateWorkUpdate(id: string, data: any) {
  const { tasks, ...rest } = data;
  if (tasks) {
    await prisma.workUpdateTask.deleteMany({ where: { workUpdateId: id } });
    await prisma.workUpdateTask.createMany({ data: tasks.map((t: any) => ({ ...t, workUpdateId: id })) });
  }
  return prisma.workUpdate.update({ where: { id }, data: rest, include: { tasks: true } });
}

export async function deleteWorkUpdate(id: string) {
  await prisma.workUpdate.delete({ where: { id } });
}
