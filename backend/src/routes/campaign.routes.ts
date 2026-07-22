import { Router } from 'express';
import {
  getCampaigns, getCampaignById, createCampaign, updateCampaign,
  updateCampaignMetrics, deleteCampaign, getCampaignStats,
} from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middleware/auth';

export const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.get('/stats', getCampaignStats);
campaignRouter.get('/', getCampaigns);
campaignRouter.get('/:id', getCampaignById);
campaignRouter.post('/', authorize('admin', 'marketing'), createCampaign);
campaignRouter.patch('/:id', authorize('admin', 'marketing'), updateCampaign);
campaignRouter.patch('/:id/metrics', authorize('admin', 'marketing'), updateCampaignMetrics);
campaignRouter.delete('/:id', authorize('admin', 'marketing'), deleteCampaign);
