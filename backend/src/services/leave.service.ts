import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { LeaveStatus } from '@prisma/client';
import { createNotification } from './notification.service';
import { createActivity } from './activity.service';

export async function getLeaveRequests(query: any, userId?: string, isAdmin = false) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (!isAdmin && userId) where.userId = userId;
  if (query.status) where.status = query.status as LeaveStatus;
  if (query.userId && isAdmin) where.userId = query.userId;

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where, skip, take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true, department: true } },
        approver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.leaveRequest.count({ where }),
  ]);
  return paginatedResponse(requests, total, { page, limit, skip });
}

export async function createLeaveRequest(data: any, userId: string) {
  const request = await prisma.leaveRequest.create({
    data: { ...data, userId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  // Notify all admins and HR users (superiors)
  const superiors = await prisma.user.findMany({
    where: { role: { in: ['admin', 'hr'] } },
    select: { id: true },
  });
  await Promise.all(
    superiors
      .filter(s => s.id !== userId) // don't notify yourself
      .map(s => createNotification({
        userId: s.id,
        title: 'New Leave Request',
        message: `${request.user.name} requested ${data.days} day(s) of ${data.type} leave`,
        type: 'info',
        link: '/leave',
      }))
  );
  await createActivity({ userId, action: 'requested leave', target: `${data.days} day(s) ${data.type} leave`, type: 'leave' });
  return request;
}

export async function updateLeaveStatus(id: string, status: LeaveStatus, approverId: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!request) throw new AppError('Leave request not found', 404);

  // HR cannot approve/reject their own leave
  if (request.userId === approverId) {
    throw new AppError('You cannot approve or reject your own leave request', 403);
  }

  const approver = await prisma.user.findUnique({ where: { id: approverId }, select: { name: true, role: true } });

  const updated = await prisma.leaveRequest.update({ where: { id }, data: { status, approverId } });

  if (status === 'approved') {
    const field = request.type === 'annual' ? 'annualUsed' : request.type === 'sick' ? 'sickUsed' : 'casualUsed';
    await prisma.leaveBalance.upsert({
      where: { userId: request.userId },
      update: { [field]: { increment: request.days } },
      create: { userId: request.userId, [field]: request.days },
    });
  }

  // Notify the employee with who actioned it
  await createNotification({
    userId: request.userId,
    title: status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected',
    message: `Your ${request.type} leave request (${request.days} day(s)) has been ${status} by ${approver?.name ?? 'a manager'}`,
    type: status === 'approved' ? 'success' : 'error',
    link: '/leave',
  });

  // Log activity for approver
  await createActivity({
    userId: approverId,
    action: `${status} leave request`,
    target: `${request.user.name} — ${request.days} day(s) ${request.type} leave`,
    type: 'leave',
  });

  return { ...updated, approver };
}

export async function getLeaveBalance(userId: string) {
  return prisma.leaveBalance.findUnique({ where: { userId } });
}
