import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as projectService from '../services/project.service';

export const getProjects = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await projectService.getProjects(req.query, req.user!.id, req.user!.role);
  res.json({ success: true, ...result });
});

export const getProjectById = catchAsync(async (req: AuthRequest, res: Response) => {
  const project = await projectService.getProjectById(req.params.id as string);
  res.json({ success: true, data: project });
});

export const createProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const project = await projectService.createProject(req.body, req.user!.id);
  res.status(201).json({ success: true, data: project });
});

export const updateProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const project = await projectService.updateProject(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: project });
});

export const deleteProject = catchAsync(async (req: AuthRequest, res: Response) => {
  await projectService.deleteProject(req.params.id as string);
  res.status(204).send();
});
