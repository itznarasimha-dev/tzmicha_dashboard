import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import * as ctrl from '../controllers/recruitment.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public route — no auth required
export const publicRecruitmentRouter = Router();
publicRecruitmentRouter.post('/apply', upload.single('resume'), ctrl.applyForJob);

export const recruitmentRouter = Router();

recruitmentRouter.use(authenticate, authorize('admin', 'hr'));

// Stats
recruitmentRouter.get('/stats', ctrl.getStats);

// Job Openings
recruitmentRouter.get('/jobs', ctrl.getJobs);
recruitmentRouter.get('/jobs/:id', ctrl.getJob);
recruitmentRouter.post('/jobs', ctrl.createJob);
recruitmentRouter.patch('/jobs/:id', ctrl.updateJob);
recruitmentRouter.delete('/jobs/:id', ctrl.deleteJob);

// Candidates
recruitmentRouter.get('/candidates', ctrl.getCandidates);
recruitmentRouter.get('/candidates/:id', ctrl.getCandidate);
recruitmentRouter.post('/candidates', ctrl.createCandidate);
recruitmentRouter.patch('/candidates/:id', ctrl.updateCandidate);
recruitmentRouter.patch('/candidates/:id/status', ctrl.updateCandidateStatus);
recruitmentRouter.delete('/candidates/:id', ctrl.deleteCandidate);
recruitmentRouter.post('/candidates/:id/convert', ctrl.convertToEmployee);

// Interviews
recruitmentRouter.get('/interviews', ctrl.getInterviews);
recruitmentRouter.post('/interviews', ctrl.createInterview);
recruitmentRouter.patch('/interviews/:id', ctrl.updateInterview);
recruitmentRouter.delete('/interviews/:id', ctrl.deleteInterview);
