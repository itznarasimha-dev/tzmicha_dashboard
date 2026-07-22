import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { DealStage } from '@prisma/client';

// Marketing uses the Deal model as their lead pipeline
export async function getLeads(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.stage) where.stage = query.stage as DealStage;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.search) where.OR = [
    { title: { contains: query.search, mode: 'insensitive' } },
    { company: { contains: query.search, mode: 'insensitive' } },
  ];

  const [leads, total] = await Promise.all([
    prisma.deal.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.deal.count({ where }),
  ]);
  return paginatedResponse(leads, total, { page, limit, skip });
}

export async function getLeadById(id: string) {
  const lead = await prisma.deal.findUnique({ where: { id } });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

export async function createLead(data: any, userId: string) {
  return prisma.deal.create({
    data: {
      title: data.title,
      company: data.company || '',
      value: parseFloat(data.value) || 0,
      stage: (data.stage as DealStage) || 'lead',
      probability: data.probability ?? 10,
      ownerId: data.ownerId || userId,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      notes: data.notes,
    },
  });
}

export async function updateLead(id: string, data: any) {
  await getLeadById(id);
  const allowed = ['title', 'company', 'value', 'stage', 'probability', 'ownerId', 'closeDate', 'notes'];
  const update: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === 'closeDate') update[key] = data[key] ? new Date(data[key]) : null;
      else if (key === 'value') update[key] = parseFloat(data[key]);
      else if (key === 'probability') update[key] = parseInt(data[key]);
      else update[key] = data[key];
    }
  }
  return prisma.deal.update({ where: { id }, data: update });
}

export async function deleteLead(id: string) {
  await getLeadById(id);
  await prisma.deal.delete({ where: { id } });
}

export async function getLeadStats() {
  const leads = await prisma.deal.findMany();

  const byStage = leads.reduce((acc: Record<string, number>, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {});

  const totalLeads = leads.length;
  const totalValue = leads.reduce((s, d) => s + d.value, 0);
  const wonValue = leads.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0);
  const weightedValue = leads
    .filter(d => d.stage !== 'closed_lost')
    .reduce((s, d) => s + d.value * (d.probability / 100), 0);

  const closedTotal = leads.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost').length;
  const winRate = closedTotal > 0
    ? Math.round((leads.filter(d => d.stage === 'closed_won').length / closedTotal) * 100)
    : 0;

  const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;

  return { totalLeads, totalValue, wonValue, weightedValue, winRate, avgDealSize, byStage };
}
