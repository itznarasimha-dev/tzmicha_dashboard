import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as activityService from '../services/activity.service';

export const getActivities = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await activityService.getActivities(req.query);
  res.json({ success: true, ...result });
});
