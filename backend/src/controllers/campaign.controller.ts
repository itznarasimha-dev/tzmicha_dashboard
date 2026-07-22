import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as campaignService from '../services/campaign.service';

export const getCampaigns = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await campaignService.getCampaigns(req.query);
  res.json({ success: true, ...result });
});

export const getCampaignById = catchAsync(async (req: AuthRequest, res: Response) => {
  const campaign = await campaignService.getCampaignById(req.params.id as string);
  res.json({ success: true, data: campaign });
});

export const createCampaign = catchAsync(async (req: AuthRequest, res: Response) => {
  const campaign = await campaignService.createCampaign(req.body);
  res.status(201).json({ success: true, data: campaign });
});

export const updateCampaign = catchAsync(async (req: AuthRequest, res: Response) => {
  const campaign = await campaignService.updateCampaign(req.params.id as string, req.body);
  res.json({ success: true, data: campaign });
});

export const updateCampaignMetrics = catchAsync(async (req: AuthRequest, res: Response) => {
  const campaign = await campaignService.updateCampaignMetrics(req.params.id as string, req.body);
  res.json({ success: true, data: campaign });
});

export const deleteCampaign = catchAsync(async (req: AuthRequest, res: Response) => {
  await campaignService.deleteCampaign(req.params.id as string);
  res.status(204).send();
});

export const getCampaignStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await campaignService.getCampaignStats();
  res.json({ success: true, data: stats });
});
