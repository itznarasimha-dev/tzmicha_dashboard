import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as sprintService from '../services/sprint.service';

export const getSprints = catchAsync(async (req: AuthRequest, res: Response) => {
  const sprints = await sprintService.getSprints(req.query.projectId as string);
  res.json({ success: true, data: sprints });
});

export const getSprintById = catchAsync(async (req: AuthRequest, res: Response) => {
  const sprint = await sprintService.getSprintById(req.params.id as string);
  res.json({ success: true, data: sprint });
});

export const createSprint = catchAsync(async (req: AuthRequest, res: Response) => {
  const sprint = await sprintService.createSprint(req.body);
  res.status(201).json({ success: true, data: sprint });
});

export const updateSprint = catchAsync(async (req: AuthRequest, res: Response) => {
  const sprint = await sprintService.updateSprint(req.params.id as string, req.body);
  res.json({ success: true, data: sprint });
});

export const deleteSprint = catchAsync(async (req: AuthRequest, res: Response) => {
  await sprintService.deleteSprint(req.params.id as string);
  res.status(204).send();
});
