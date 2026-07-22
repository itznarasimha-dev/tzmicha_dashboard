import { prisma } from '../config/prisma';
import { getPagination, paginatedResponse } from '../utils/pagination';
import { createNotification } from './notification.service';

export async function getAttendance(query: any) {
  const { page, limit, skip } = getPagination(query);
  const where: any = {};
  if (query.userId) where.userId = query.userId;
  if (query.date) where.date = new Date(query.date);
  if (query.startDate && query.endDate) where.date = { gte: new Date(query.startDate), lte: new Date(query.endDate) };

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where, skip, take: limit,
      include: { user: { select: { id: true, name: true, avatar: true, department: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);
  return paginatedResponse(records, total, { page, limit, skip });
}

export async function upsertAttendance(userId: string, date: string, data: any) {
  const d = new Date(date);
  const record = await prisma.attendance.upsert({
    where: { userId_date: { userId, date: d } },
    update: data,
    create: { userId, date: d, ...data },
    include: { user: { select: { id: true, name: true } } },
  });

  if (data.status === 'absent' || data.status === 'late') {
    const hrAdmins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'hr'] }, id: { not: userId } },
      select: { id: true },
    });
    const dateStr = d.toLocaleDateString();
    const label = data.status === 'absent' ? 'Absent' : 'Late';
    await Promise.all(hrAdmins.map(u => createNotification({
      userId: u.id,
      title: `Employee ${label}`,
      message: `${record.user.name} is marked as ${data.status} on ${dateStr}`,
      type: data.status === 'absent' ? 'warning' : 'info',
      link: '/attendance',
    })));
  }

  return record;
}
