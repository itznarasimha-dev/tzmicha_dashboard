import { Response } from 'express';
import { catchAsync } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import * as leadService from '../services/lead.service';

export const getLeads = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await leadService.getLeads(req.query);
  res.json({ success: true, ...result });
});

export const getLeadById = catchAsync(async (req: AuthRequest, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id as string);
  res.json({ success: true, data: lead });
});

export const createLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const lead = await leadService.createLead(req.body, req.user!.id);
  res.status(201).json({ success: true, data: lead });
});

export const updateLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const lead = await leadService.updateLead(req.params.id as string, req.body);
  res.json({ success: true, data: lead });
});

export const deleteLead = catchAsync(async (req: AuthRequest, res: Response) => {
  await leadService.deleteLead(req.params.id as string);
  res.status(204).send();
});

export const getLeadStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await leadService.getLeadStats();
  res.json({ success: true, data: stats });
});
