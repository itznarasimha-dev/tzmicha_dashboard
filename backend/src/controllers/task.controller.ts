import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as taskService from '../services/task.service';
import { TaskStatus } from '@prisma/client';

export const getTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await taskService.getTasks(req.query, req.user!.id, req.user!.role);
  res.json({ success: true, ...result });
});

export const getTaskById = catchAsync(async (req: AuthRequest, res: Response) => {
  const task = await taskService.getTaskById(req.params.id as string);
  res.json({ success: true, data: task });
});

export const createTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!.id);
  res.status(201).json({ success: true, data: task });
});

export const updateTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const task = await taskService.updateTask(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: task });
});

const ADMIN_ONLY_STATUSES: TaskStatus[] = ['done', 'overdue'];

export const updateTaskStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const newStatus = req.body.status as TaskStatus;
  const isAdmin = req.user!.role === 'admin';

  // Only admin can set done or overdue
  if (ADMIN_ONLY_STATUSES.includes(newStatus) && !isAdmin) {
    res.status(403).json({ success: false, message: 'Only admin can set this status.' });
    return;
  }

  // Once in_review, only admin can move it out (back or forward)
  if (!isAdmin) {
    const current = await taskService.getTaskById(req.params.id as string);
    if (current.status === 'in_review') {
      res.status(403).json({ success: false, message: 'Task is under review. Only admin can change its status.' });
      return;
    }
  }

  const task = await taskService.updateTaskStatus(req.params.id as string, newStatus, req.user!.id);
  res.json({ success: true, data: task });
});

export const approveTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const task = await taskService.approveTask(req.params.id as string, req.user!.id);
  res.json({ success: true, data: task });
});

export const deleteTask = catchAsync(async (req: AuthRequest, res: Response) => {
  await taskService.deleteTask(req.params.id as string);
  res.status(204).send();
});

// ── Deadline Extension ────────────────────────────────────────────────────────

export const requestExtension = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await taskService.requestDeadlineExtension(req.params.id as string, req.user!.id, req.body);
  res.status(201).json({ success: true, data: result });
});

export const reviewExtension = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await taskService.reviewDeadlineExtension(req.params.id as string, req.user!.id, req.body.action);
  res.json({ success: true, data: result });
});

export const getExtensionRequests = catchAsync(async (req: AuthRequest, res: Response) => {
  const isManager = ['admin', 'product_manager'].includes(req.user!.role);
  // Managers see requests for tasks they reported; employees see their own requests
  const result = await taskService.getExtensionRequests(
    req.query,
    isManager ? req.user!.id : undefined,
    isManager ? undefined : req.user!.id,
  );
  res.json({ success: true, ...result });
});

// ── Overdue / Deadline check (admin-triggered or cron) ───────────────────────

export const runOverdueCheck = catchAsync(async (req: AuthRequest, res: Response) => {
  const [overdue, upcoming] = await Promise.all([
    taskService.markOverdueTasks(),
    taskService.notifyUpcomingDeadlines(),
  ]);
  res.json({ success: true, data: { markedOverdue: overdue, upcomingNotified: upcoming } });
});
