import { Router } from 'express';
import { getWorkUpdates, getWorkUpdateById, createWorkUpdate, updateWorkUpdate, deleteWorkUpdate } from '../controllers/workUpdate.controller';
import { authenticate } from '../middleware/auth';

export const workUpdateRouter = Router();

workUpdateRouter.use(authenticate);

workUpdateRouter.get('/', getWorkUpdates);
workUpdateRouter.get('/:id', getWorkUpdateById);
workUpdateRouter.post('/', createWorkUpdate);
workUpdateRouter.patch('/:id', updateWorkUpdate);
workUpdateRouter.delete('/:id', deleteWorkUpdate);
