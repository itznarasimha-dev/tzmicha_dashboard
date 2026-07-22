import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { DealStage } from '@prisma/client';

export async function getDeals(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.stage) where.stage = query.stage as DealStage;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.search) where.OR = [
    { title: { contains: query.search, mode: 'insensitive' } },
    { company: { contains: query.search, mode: 'insensitive' } },
  ];

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.deal.count({ where }),
  ]);
  return paginatedResponse(deals, total, { page, limit, skip });
}

export async function getDealById(id: string) {
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) throw new AppError('Deal not found', 404);
  return deal;
}

export async function createDeal(data: any) {
  return prisma.deal.create({ data });
}

export async function updateDeal(id: string, data: any) {
  return prisma.deal.update({ where: { id }, data });
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({ where: { id } });
}

export async function getPipelineStats() {
  const deals = await prisma.deal.findMany();
  const byStage = deals.reduce((acc: any, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {});
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0);
  return { byStage, totalValue, wonValue, totalDeals: deals.length };
}
