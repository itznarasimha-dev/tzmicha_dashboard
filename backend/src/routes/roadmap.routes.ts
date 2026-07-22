import { Router } from 'express';
import { getRoadmapItems, getRoadmapItemById, createRoadmapItem, updateRoadmapItem, deleteRoadmapItem } from '../controllers/roadmap.controller';
import { authenticate, authorize } from '../middleware/auth';

export const roadmapRouter = Router();

roadmapRouter.use(authenticate);

roadmapRouter.get('/', getRoadmapItems);
roadmapRouter.get('/:id', getRoadmapItemById);
roadmapRouter.post('/', authorize('admin', 'product_manager'), createRoadmapItem);
roadmapRouter.patch('/:id', authorize('admin', 'product_manager'), updateRoadmapItem);
roadmapRouter.delete('/:id', authorize('admin'), deleteRoadmapItem);
