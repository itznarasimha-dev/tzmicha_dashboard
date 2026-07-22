import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { CampaignStatus, CampaignChannel } from '@prisma/client';

export async function getCampaigns(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.status) where.status = query.status as CampaignStatus;
  if (query.channel) where.channel = query.channel as CampaignChannel;
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.campaign.count({ where }),
  ]);
  return paginatedResponse(campaigns, total, { page, limit, skip });
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) throw new AppError('Campaign not found', 404);
  return campaign;
}

export async function createCampaign(data: any) {
  const { name, channel, budget, startDate, endDate, status } = data;
  return prisma.campaign.create({
    data: {
      name,
      channel: channel as CampaignChannel,
      budget: parseFloat(budget) || 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: (status as CampaignStatus) || 'draft',
    },
  });
}

export async function updateCampaign(id: string, data: any) {
  await getCampaignById(id);
  const allowed = ['name', 'status', 'channel', 'budget', 'spent', 'startDate', 'endDate',
    'impressions', 'clicks', 'conversions', 'roi'];
  const update: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (['startDate', 'endDate'].includes(key)) update[key] = data[key] ? new Date(data[key]) : null;
      else if (['budget', 'spent', 'roi'].includes(key)) update[key] = parseFloat(data[key]);
      else if (['impressions', 'clicks', 'conversions'].includes(key)) update[key] = parseInt(data[key]);
      else update[key] = data[key];
    }
  }
  return prisma.campaign.update({ where: { id }, data: update });
}

export async function updateCampaignMetrics(id: string, metrics: {
  impressions?: number; clicks?: number; conversions?: number; spent?: number; roi?: number;
}) {
  await getCampaignById(id);
  return prisma.campaign.update({ where: { id }, data: metrics });
}

export async function deleteCampaign(id: string) {
  await getCampaignById(id);
  await prisma.campaign.delete({ where: { id } });
}

export async function getCampaignStats() {
  const campaigns = await prisma.campaign.findMany();
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgRoi = campaigns.length ? campaigns.reduce((s, c) => s + c.roi, 0) / campaigns.length : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const byStatus = campaigns.reduce((acc: any, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const byChannel = campaigns.reduce((acc: any, c) => {
    if (!acc[c.channel]) acc[c.channel] = { count: 0, budget: 0, conversions: 0 };
    acc[c.channel].count++;
    acc[c.channel].budget += c.budget;
    acc[c.channel].conversions += c.conversions;
    return acc;
  }, {});

  return {
    totalBudget, totalSpent, totalImpressions, totalClicks,
    totalConversions, avgRoi, ctr, convRate, byStatus, byChannel,
    activeCampaigns: byStatus['active'] || 0,
  };
}
