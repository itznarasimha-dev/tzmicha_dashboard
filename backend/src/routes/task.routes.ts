import { Router } from 'express';
import {
  getTasks, getTaskById, createTask, updateTask,
  updateTaskStatus, approveTask, deleteTask,
  requestExtension, reviewExtension, getExtensionRequests,
  runOverdueCheck,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get('/',                                                    getTasks);
taskRouter.get('/extensions',                                          getExtensionRequests);
taskRouter.post('/overdue-check', authorize('admin', 'product_manager'), runOverdueCheck);
taskRouter.get('/:id',                                                 getTaskById);
taskRouter.post('/',    authorize('admin', 'product_manager', 'hr'),    createTask);
taskRouter.patch('/:id', authorize('admin', 'product_manager', 'hr'),  updateTask);
taskRouter.patch('/:id/status',                                        updateTaskStatus);
taskRouter.patch('/:id/approve', authorize('admin'),                    approveTask);
taskRouter.post('/:id/request-extension',                              requestExtension);
taskRouter.patch('/extensions/:id/review', authorize('admin', 'product_manager'), reviewExtension);
taskRouter.delete('/:id', authorize('admin', 'product_manager'),       deleteTask);
