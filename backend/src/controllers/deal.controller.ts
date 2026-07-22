import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as dealService from '../services/deal.service';

export const getDeals = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await dealService.getDeals(req.query);
  res.json({ success: true, ...result });
});

export const getDealById = catchAsync(async (req: AuthRequest, res: Response) => {
  const deal = await dealService.getDealById(req.params.id as string);
  res.json({ success: true, data: deal });
});

export const createDeal = catchAsync(async (req: AuthRequest, res: Response) => {
  const deal = await dealService.createDeal(req.body);
  res.status(201).json({ success: true, data: deal });
});

export const updateDeal = catchAsync(async (req: AuthRequest, res: Response) => {
  const deal = await dealService.updateDeal(req.params.id as string, req.body);
  res.json({ success: true, data: deal });
});

export const deleteDeal = catchAsync(async (req: AuthRequest, res: Response) => {
  await dealService.deleteDeal(req.params.id as string);
  res.status(204).send();
});

export const getPipelineStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await dealService.getPipelineStats();
  res.json({ success: true, data: stats });
});
