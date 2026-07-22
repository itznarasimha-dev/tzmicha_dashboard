import { Router } from 'express';
import { getSprints, getSprintById, createSprint, updateSprint, deleteSprint } from '../controllers/sprint.controller';
import { authenticate, authorize } from '../middleware/auth';

export const sprintRouter = Router();

sprintRouter.use(authenticate);

sprintRouter.get('/', getSprints);
sprintRouter.get('/:id', getSprintById);
sprintRouter.post('/', authorize('admin', 'product_manager'), createSprint);
sprintRouter.patch('/:id', authorize('admin', 'product_manager'), updateSprint);
sprintRouter.delete('/:id', authorize('admin'), deleteSprint);
