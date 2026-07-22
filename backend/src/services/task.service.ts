import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { TaskStatus, TaskPriority, UserRole } from '@prisma/client';
import { createNotification } from './notification.service';
import { createActivity } from './activity.service';

const userSelect = { id: true, name: true, avatar: true, role: true };

// ── Role → default assignee filter ───────────────────────────────────────────
// Non-admin roles only see tasks assigned to them by default
const MANAGER_ROLES: UserRole[] = ['admin', 'product_manager'];

export async function getTasks(query: any, requestingUserId?: string, requestingUserRole?: UserRole) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};

  if (query.status) where.status = query.status as TaskStatus;
  if (query.priority) where.priority = query.priority as TaskPriority;
  if (query.projectId) where.projectId = query.projectId;
  if (query.sprintId) where.sprintId = query.sprintId;
  if (query.assigneeId) where.assigneeId = query.assigneeId;
  if (query.reporterId) where.reporterId = query.reporterId;
  if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
  if (query.isOverdue === 'true') where.isOverdue = true;

  // Due today
  if (query.dueToday === 'true') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    where.dueDate = { gte: start, lte: end };
  }

  // Role-based: non-managers only see their own tasks unless explicitly overridden
  if (requestingUserId && requestingUserRole && !MANAGER_ROLES.includes(requestingUserRole)) {
    if (!query.assigneeId && !query.reporterId) {
      where.OR = [{ assigneeId: requestingUserId }, { reporterId: requestingUserId }];
    }
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where, skip, take: limit,
      include: {
        assignee: { select: userSelect },
        reporter: { select: userSelect },
        project: { select: { id: true, name: true, color: true } },
        extensionRequests: { where: { status: 'pending' }, select: { id: true, status: true, requestedDueDate: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.task.count({ where }),
  ]);

  // Compute overdue flag on the fly for response
  const now = new Date();
  const enriched = tasks.map((t: any) => ({
    ...t,
    isOverdue: t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
    daysRemaining: t.dueDate ? Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / 86400000) : null,
  }));

  return paginatedResponse(enriched, total, { page, limit, skip });
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: userSelect },
      reporter: { select: userSelect },
      project: true,
      sprint: true,
      extensionRequests: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!task) throw new AppError('Task not found', 404);
  return task;
}

export async function createTask(data: any, reporterId: string) {
  if (!data.title) throw new AppError('Title is required', 400);
  if (!data.projectId) throw new AppError('Project is required', 400);
  if (!data.assigneeId) throw new AppError('Assignee is required', 400);
  if (!data.dueDate) throw new AppError('Due date is required', 400);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status ?? 'todo',
      priority: data.priority ?? 'medium',
      assigneeId: data.assigneeId,
      reporterId,
      assignedById: reporterId,
      assignedDate: new Date(),
      projectId: data.projectId,
      sprintId: data.sprintId,
      labels: data.labels ?? [],
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : undefined,
      notes: data.notes,
    },
    include: { assignee: { select: userSelect }, reporter: { select: userSelect }, project: { select: { id: true, name: true, color: true } } },
  });

  // Notify assignee
  if (task.assigneeId && task.assigneeId !== reporterId) {
    await createNotification({
      userId: task.assigneeId,
      title: 'New Task Assigned',
      message: `You have been assigned: "${task.title}" — Due ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`,
      type: 'info',
      link: '/tasks',
    });
  }

  await createActivity({ userId: reporterId, action: 'created task', target: task.title, type: 'task' });

  // Auto-update project progress
  await recalcProjectProgress(task.projectId);

  return task;
}

export async function updateTask(id: string, data: any, updaterId?: string) {
  const prev = await prisma.task.findUnique({ where: { id }, select: { assigneeId: true, title: true, projectId: true, status: true, reporterId: true } });

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
      ...(data.sprintId !== undefined && { sprintId: data.sprintId }),
      ...(data.labels !== undefined && { labels: data.labels }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null }),
      ...(data.loggedHours !== undefined && { loggedHours: data.loggedHours ? parseFloat(data.loggedHours) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { assignee: { select: userSelect }, reporter: { select: userSelect }, project: { select: { id: true, name: true, color: true } } },
  });

  // Notify new assignee if changed
  if (data.assigneeId && data.assigneeId !== prev?.assigneeId) {
    await createNotification({
      userId: data.assigneeId,
      title: 'Task Assigned to You',
      message: `You have been assigned: "${task.title}"`,
      type: 'info',
      link: '/tasks',
    });
    if (updaterId) await createActivity({ userId: updaterId, action: 'reassigned task', target: task.title, type: 'task' });
  }

  // If status changed via full update, delegate to the same notification logic
  if (data.status && data.status !== prev?.status && updaterId) {
    await updateTaskStatus(id, data.status as TaskStatus, updaterId);
  } else if (updaterId) {
    await createActivity({ userId: updaterId, action: 'updated task', target: task.title, type: 'task' });
  }

  await recalcProjectProgress(task.projectId);
  return task;
}

// Helper: notify all superiors (admin + product_manager) except the updater
async function notifySuperiors(excludeId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', link: string) {
  const superiors = await prisma.user.findMany({
    where: { role: { in: ['admin', 'product_manager', 'hr'] }, id: { not: excludeId } },
    select: { id: true },
  });
  await Promise.all(superiors.map(s => createNotification({ userId: s.id, title, message, type, link })));
}

export async function updateTaskStatus(id: string, status: TaskStatus, updaterId?: string) {
  const prev = await prisma.task.findUnique({ where: { id }, select: { status: true } });
  const task = await prisma.task.update({
    where: { id },
    data: { status, ...(status === 'done' && { isOverdue: false }) },
    include: { assignee: { select: userSelect }, reporter: { select: userSelect }, project: { select: { id: true, name: true, color: true } } },
  });

  if (updaterId && prev?.status !== status) {
    const statusLabel = status.replace(/_/g, ' ');
    const updaterName = task.assignee?.id === updaterId ? task.assignee.name : task.reporter?.name ?? 'Someone';
    await createActivity({ userId: updaterId, action: `moved task to ${statusLabel}`, target: task.title, type: 'task' });

    if (status === 'done') {
      // Notify reporter (if not the one who completed it)
      if (task.reporterId !== updaterId) {
        await createNotification({ userId: task.reporterId, title: 'Task Completed', message: `"${task.title}" has been marked as done by ${updaterName}`, type: 'success', link: '/tasks' });
      }
      // Notify superiors
      await notifySuperiors(updaterId, 'Task Completed', `"${task.title}" was completed by ${updaterName}`, 'success', '/tasks');
    } else if (status === 'in_review') {
      // Notify reporter that task is ready for review
      if (task.reporterId !== updaterId) {
        await createNotification({ userId: task.reporterId, title: 'Task Ready for Review', message: `"${task.title}" has been moved to In Review by ${updaterName}`, type: 'info', link: '/tasks' });
      }
      await notifySuperiors(updaterId, 'Task Ready for Review', `"${task.title}" is ready for review (submitted by ${updaterName})`, 'info', '/tasks');
    } else if (status === 'blocked') {
      // Notify reporter + superiors about blocker
      if (task.reporterId !== updaterId) {
        await createNotification({ userId: task.reporterId, title: 'Task Blocked', message: `"${task.title}" has been marked as blocked by ${updaterName}`, type: 'warning', link: '/tasks' });
      }
      await notifySuperiors(updaterId, 'Task Blocked', `"${task.title}" is blocked — assigned to ${task.assignee?.name ?? 'someone'}`, 'warning', '/tasks');
    } else if (status === 'in_progress') {
      // Notify reporter that work has started
      if (task.reporterId !== updaterId) {
        await createNotification({ userId: task.reporterId, title: 'Task In Progress', message: `"${task.title}" has been started by ${updaterName}`, type: 'info', link: '/tasks' });
      }
    }
  }

  await recalcProjectProgress(task.projectId);
  return task;
}

export async function approveTask(id: string, adminId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignee: { select: userSelect }, reporter: { select: userSelect } },
  });
  if (!task) throw new AppError('Task not found', 404);
  if (task.status !== 'in_review') throw new AppError('Task must be in \'In Review\' status before it can be approved', 400);

  const updated = await prisma.task.update({
    where: { id },
    data: { status: 'done', isOverdue: false },
    include: { assignee: { select: userSelect }, reporter: { select: userSelect }, project: { select: { id: true, name: true, color: true } } },
  });

  // Notify assignee
  if (updated.assigneeId) {
    await createNotification({
      userId: updated.assigneeId,
      title: 'Task Approved ✅',
      message: `Your task "${updated.title}" has been reviewed and approved by admin.`,
      type: 'success',
      link: '/tasks',
    });
  }
  // Notify reporter if different from admin
  if (updated.reporterId !== adminId) {
    await createNotification({
      userId: updated.reporterId,
      title: 'Task Approved',
      message: `"${updated.title}" has been approved and marked as done.`,
      type: 'success',
      link: '/tasks',
    });
  }

  await createActivity({ userId: adminId, action: 'approved task', target: updated.title, type: 'task' });
  await recalcProjectProgress(updated.projectId);
  return updated;
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, select: { projectId: true } });
  await prisma.task.delete({ where: { id } });
  if (task) await recalcProjectProgress(task.projectId);
}

// ── Deadline Extension Requests ───────────────────────────────────────────────

export async function requestDeadlineExtension(taskId: string, requestedById: string, data: { reason: string; requestedDueDate: string; comments?: string }) {
  if (!data.reason) throw new AppError('Reason is required', 400);
  if (!data.requestedDueDate) throw new AppError('Requested due date is required', 400);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { reporter: { select: { id: true, name: true } } },
  });
  if (!task) throw new AppError('Task not found', 404);

  const req = await prisma.deadlineExtensionRequest.create({
    data: {
      taskId,
      requestedById,
      reason: data.reason,
      requestedDueDate: new Date(data.requestedDueDate),
      comments: data.comments,
    },
  });

  // Notify the reporter (manager who assigned)
  await createNotification({
    userId: task.reporterId,
    title: 'Deadline Extension Requested',
    message: `Extension requested for "${task.title}" — New date: ${new Date(data.requestedDueDate).toLocaleDateString()}`,
    type: 'warning',
    link: '/tasks',
  });

  await createActivity({ userId: requestedById, action: 'requested deadline extension', target: task.title, type: 'task' });

  return req;
}

export async function reviewDeadlineExtension(requestId: string, reviewerId: string, action: 'approved' | 'rejected') {
  const req = await prisma.deadlineExtensionRequest.findUnique({
    where: { id: requestId },
    include: { task: { select: { id: true, title: true, assigneeId: true } } },
  });
  if (!req) throw new AppError('Extension request not found', 404);

  const updated = await prisma.deadlineExtensionRequest.update({
    where: { id: requestId },
    data: { status: action, reviewedById: reviewerId, reviewedAt: new Date() },
  });

  if (action === 'approved') {
    // Update task due date and clear overdue
    await prisma.task.update({
      where: { id: req.taskId },
      data: { dueDate: req.requestedDueDate, isOverdue: false, status: 'in_progress' },
    });
    // Notify assignee
    if (req.task.assigneeId) {
      await createNotification({
        userId: req.task.assigneeId,
        title: 'Deadline Extension Approved',
        message: `Your extension for "${req.task.title}" was approved. New due date: ${new Date(req.requestedDueDate).toLocaleDateString()}`,
        type: 'success',
        link: '/tasks',
      });
    }
    await createActivity({ userId: reviewerId, action: 'approved deadline extension', target: req.task.title, type: 'task' });
  } else {
    if (req.task.assigneeId) {
      await createNotification({
        userId: req.task.assigneeId,
        title: 'Deadline Extension Rejected',
        message: `Your extension request for "${req.task.title}" was rejected.`,
        type: 'error',
        link: '/tasks',
      });
    }
    await createActivity({ userId: reviewerId, action: 'rejected deadline extension', target: req.task.title, type: 'task' });
  }

  return updated;
}

export async function getExtensionRequests(query: any, reviewerId?: string, requestedById?: string) {
  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.taskId) where.taskId = query.taskId;
  if (reviewerId) where.task = { is: { reporterId: reviewerId } }; // manager sees tasks they own
  if (requestedById) where.requestedById = requestedById;  // employee sees their own
  const data = await prisma.deadlineExtensionRequest.findMany({
    where,
    include: {
      task: { select: { id: true, title: true, dueDate: true, assignee: { select: userSelect } } },
      requestedBy: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return { data };
}

// ── Overdue detection (called on every getTasks + scheduled) ──────────────────
export async function markOverdueTasks() {
  const now = new Date();
  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: { lt: now },
      status: { notIn: ['done', 'overdue'] },
      isOverdue: false,
    },
    include: { assignee: { select: userSelect } },
  });

  for (const task of overdueTasks) {
    await prisma.task.update({ where: { id: task.id }, data: { status: 'overdue', isOverdue: true } });
    if (task.assigneeId) {
      await createNotification({
        userId: task.assigneeId,
        title: 'Task Overdue',
        message: `"${task.title}" is now overdue. Please request a deadline extension if needed.`,
        type: 'error',
        link: '/tasks',
      });
    }
      // Notify reporter
    await createNotification({
      userId: task.reporterId,
      title: 'Task Overdue',
      message: `"${task.title}" assigned to ${task.assignee?.name ?? 'someone'} is now overdue.`,
      type: 'error',
      link: '/tasks',
    });
    // Notify superiors (admin + product_manager) excluding reporter to avoid duplicates
    const superiors = await prisma.user.findMany({
      where: { role: { in: ['admin', 'product_manager', 'hr'] }, id: { not: task.reporterId } },
      select: { id: true },
    });
    await Promise.all(superiors.map(s => createNotification({
      userId: s.id,
      title: 'Task Overdue',
      message: `"${task.title}" assigned to ${task.assignee?.name ?? 'someone'} is now overdue.`,
      type: 'error',
      link: '/tasks',
    })));
  }

  return overdueTasks.length;
}

// ── Deadline approaching (1 day before) ──────────────────────────────────────
export async function notifyUpcomingDeadlines() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow); start.setHours(0, 0, 0, 0);
  const end = new Date(tomorrow); end.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: { dueDate: { gte: start, lte: end }, status: { notIn: ['done', 'overdue'] } },
    include: { assignee: { select: userSelect } },
  });

  for (const task of tasks) {
    if (task.assigneeId) {
      await createNotification({
        userId: task.assigneeId,
        title: 'Deadline Tomorrow',
        message: `"${task.title}" is due tomorrow. Make sure to complete it on time.`,
        type: 'warning',
        link: '/tasks',
      });
    }
    // Also notify reporter so they can follow up
    if (task.reporterId !== task.assigneeId) {
      await createNotification({
        userId: task.reporterId,
        title: 'Task Due Tomorrow',
        message: `"${task.title}" assigned to ${task.assignee?.name ?? 'someone'} is due tomorrow.`,
        type: 'warning',
        link: '/tasks',
      });
    }
  }
  return tasks.length;
}

// ── Project progress recalculation ───────────────────────────────────────────
async function recalcProjectProgress(projectId: string) {
  const tasks = await prisma.task.findMany({ where: { projectId }, select: { status: true } });
  if (!tasks.length) return;
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);
  await prisma.project.update({ where: { id: projectId }, data: { progress } });
}
