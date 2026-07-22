import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as roadmapService from '../services/roadmap.service';

export const getRoadmapItems = catchAsync(async (req: AuthRequest, res: Response) => {
  const items = await roadmapService.getRoadmapItems(req.query);
  res.json({ success: true, data: items });
});

export const getRoadmapItemById = catchAsync(async (req: AuthRequest, res: Response) => {
  const item = await roadmapService.getRoadmapItemById(req.params.id as string);
  res.json({ success: true, data: item });
});

export const createRoadmapItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const item = await roadmapService.createRoadmapItem(req.body);
  res.status(201).json({ success: true, data: item });
});

export const updateRoadmapItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const item = await roadmapService.updateRoadmapItem(req.params.id as string, req.body);
  res.json({ success: true, data: item });
});

export const deleteRoadmapItem = catchAsync(async (req: AuthRequest, res: Response) => {
  await roadmapService.deleteRoadmapItem(req.params.id as string);
  res.status(204).send();
});
