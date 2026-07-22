import { Router } from 'express';
import { getAllSettings, upsertSetting, upsertManySettings } from '../controllers/setting.controller';
import { authenticate, authorize } from '../middleware/auth';

export const settingRouter = Router();

settingRouter.use(authenticate);

settingRouter.get('/', getAllSettings);
settingRouter.post('/', authorize('admin'), upsertSetting);
settingRouter.put('/', authorize('admin'), upsertManySettings);
