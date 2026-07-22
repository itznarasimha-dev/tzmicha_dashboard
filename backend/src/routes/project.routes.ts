import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth';

export const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/', createProject);
projectRouter.patch('/:id', updateProject);
projectRouter.delete('/:id', authorize('admin'), deleteProject);
