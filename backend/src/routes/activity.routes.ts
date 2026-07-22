import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

export const activityRouter = Router();

activityRouter.use(authenticate);
activityRouter.get('/', getActivities);
