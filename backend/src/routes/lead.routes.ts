import { Router } from 'express';
import { getLeads, getLeadById, createLead, updateLead, deleteLead, getLeadStats } from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth';

export const leadRouter = Router();

leadRouter.use(authenticate);

leadRouter.get('/stats', getLeadStats);
leadRouter.get('/', getLeads);
leadRouter.get('/:id', getLeadById);
leadRouter.post('/', authorize('admin', 'marketing', 'sales'), createLead);
leadRouter.patch('/:id', authorize('admin', 'marketing', 'sales'), updateLead);
leadRouter.delete('/:id', authorize('admin', 'marketing'), deleteLead);
