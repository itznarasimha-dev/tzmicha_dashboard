import { Router } from 'express';
import { getDeals, getDealById, createDeal, updateDeal, deleteDeal, getPipelineStats } from '../controllers/deal.controller';
import { authenticate, authorize } from '../middleware/auth';

export const dealRouter = Router();

dealRouter.use(authenticate);

dealRouter.get('/stats', getPipelineStats);
dealRouter.get('/', getDeals);
dealRouter.get('/:id', getDealById);
dealRouter.post('/', authorize('admin', 'sales'), createDeal);
dealRouter.patch('/:id', authorize('admin', 'sales'), updateDeal);
dealRouter.delete('/:id', authorize('admin', 'sales'), deleteDeal);
