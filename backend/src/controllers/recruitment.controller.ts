import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as svc from '../services/recruitment.service';
import { CandidateStatus } from '@prisma/client';

// Stats
export const getStats = catchAsync(async (_req: AuthRequest, res: Response) => {
  const data = await svc.getRecruitmentStats();
  res.json({ success: true, data });
});

// Job Openings
export const getJobs = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await svc.getJobOpenings(req.query);
  res.json({ success: true, ...result });
});

export const getJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.getJobOpeningById(req.params.id as string);
  res.json({ success: true, data });
});

export const createJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.createJobOpening(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
});

export const updateJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.updateJobOpening(req.params.id as string, req.body);
  res.json({ success: true, data });
});

export const deleteJob = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteJobOpening(req.params.id as string);
  res.json({ success: true });
});

// Candidates
export const getCandidates = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await svc.getCandidates(req.query);
  res.json({ success: true, ...result });
});

export const getCandidate = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.getCandidateById(req.params.id as string);
  res.json({ success: true, data });
});

export const createCandidate = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.createCandidate(req.body);
  res.status(201).json({ success: true, data });
});

export const updateCandidate = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.updateCandidate(req.params.id as string, req.body);
  res.json({ success: true, data });
});

export const updateCandidateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.updateCandidateStatus(req.params.id as string, req.body.status as CandidateStatus, req.user!.id);
  res.json({ success: true, data });
});

export const deleteCandidate = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteCandidate(req.params.id as string);
  res.json({ success: true });
});

export const convertToEmployee = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.convertToEmployee(req.params.id as string, req.body, req.user!.id);
  res.status(201).json({ success: true, data });
});

export const applyForJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.applyForJob({
    ...req.body,
    experience: req.body.experience ? Number(req.body.experience) : undefined,
    skills: req.body.skills
      ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map((s: string) => s.trim()))
      : [],
    resumeFile: (req as any).file,
  });
  res.status(201).json({ success: true, data });
});

// Interviews
export const getInterviews = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await svc.getInterviews(req.query);
  res.json({ success: true, ...result });
});

export const createInterview = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.createInterview(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
});

export const updateInterview = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await svc.updateInterview(req.params.id as string, req.body);
  res.json({ success: true, data });
});

export const deleteInterview = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteInterview(req.params.id as string);
  res.json({ success: true });
});
