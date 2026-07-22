import { Router } from 'express';
import { getAttendance, upsertAttendance } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

attendanceRouter.get('/', getAttendance);
attendanceRouter.post('/', authorize('admin', 'hr'), upsertAttendance);
