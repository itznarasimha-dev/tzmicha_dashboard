import { Router } from 'express';
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus, getLeaveBalance } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth';

export const leaveRouter = Router();

leaveRouter.use(authenticate);

leaveRouter.get('/', getLeaveRequests);
leaveRouter.post('/', createLeaveRequest);
leaveRouter.patch('/:id/status', authorize('admin', 'hr'), updateLeaveStatus);
leaveRouter.get('/balance/me', getLeaveBalance);
leaveRouter.get('/balance/:userId', authorize('admin', 'hr'), getLeaveBalance);
