import { Response } from 'express';
import { catchAsync, AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { createNotification } from '../services/notification.service';
import { UserRole } from '@prisma/client';

const CAN_MANAGE: UserRole[] = [UserRole.admin, UserRole.hr];

const DEFAULT_HOLIDAYS = [
  // 2026
  { name: "New Year's Day",           date: new Date('2026-01-01'), description: 'New Year celebration',                                          holidayType: 'national', isDefault: true },
  { name: 'Makar Sankranti / Pongal', date: new Date('2026-01-14'), description: 'Harvest festival',                                              holidayType: 'national', isDefault: true },
  { name: 'Republic Day',             date: new Date('2026-01-26'), description: 'Indian Republic Day',                                           holidayType: 'national', isDefault: true },
  { name: 'Ugadi',                    date: new Date('2026-03-19'), description: 'Telugu & Kannada New Year',                                     holidayType: 'national', isDefault: true },
  { name: 'Ramzan (Eid-ul-Fitr)',     date: new Date('2026-03-20'), description: 'End of Ramadan — date subject to moon sighting',                holidayType: 'national', isDefault: true },
  { name: 'Good Friday',              date: new Date('2026-04-03'), description: 'Crucifixion of Jesus Christ — date may vary per govt notice',   holidayType: 'national', isDefault: true },
  { name: 'Independence Day',         date: new Date('2026-08-15'), description: 'Indian Independence Day',                                       holidayType: 'national', isDefault: true },
  { name: 'Ganesh Chaturthi',         date: new Date('2026-08-27'), description: 'Festival of Lord Ganesha',                                      holidayType: 'national', isDefault: true },
  { name: 'Gandhi Jayanti',           date: new Date('2026-10-02'), description: 'Birthday of Mahatma Gandhi',                                    holidayType: 'national', isDefault: true },
  { name: 'Dussehra (Vijayadashami)', date: new Date('2026-10-20'), description: 'Victory of good over evil',                                     holidayType: 'national', isDefault: true },
  { name: 'Diwali',                   date: new Date('2026-11-09'), description: 'Festival of Lights',                                            holidayType: 'national', isDefault: true },
  { name: 'Christmas',                date: new Date('2026-12-25'), description: 'Christmas Day',                                                  holidayType: 'national', isDefault: true },
  // 2027
  { name: "New Year's Day",           date: new Date('2027-01-01'), description: 'New Year celebration',                                          holidayType: 'national', isDefault: true },
  { name: 'Makar Sankranti / Pongal', date: new Date('2027-01-15'), description: 'Harvest festival',                                              holidayType: 'national', isDefault: true },
  { name: 'Republic Day',             date: new Date('2027-01-26'), description: 'Indian Republic Day',                                           holidayType: 'national', isDefault: true },
  { name: 'Good Friday',              date: new Date('2027-03-26'), description: 'Crucifixion of Jesus Christ — date may vary per govt notice',   holidayType: 'national', isDefault: true },
  { name: 'Ugadi',                    date: new Date('2027-04-09'), description: 'Telugu & Kannada New Year',                                     holidayType: 'national', isDefault: true },
  { name: 'Ramzan (Eid-ul-Fitr)',     date: new Date('2027-04-10'), description: 'End of Ramadan — date subject to moon sighting',                holidayType: 'national', isDefault: true },
  { name: 'Independence Day',         date: new Date('2027-08-15'), description: 'Indian Independence Day',                                       holidayType: 'national', isDefault: true },
  { name: 'Ganesh Chaturthi',         date: new Date('2027-09-09'), description: 'Festival of Lord Ganesha',                                      holidayType: 'national', isDefault: true },
  { name: 'Gandhi Jayanti',           date: new Date('2027-10-02'), description: 'Birthday of Mahatma Gandhi',                                    holidayType: 'national', isDefault: true },
  { name: 'Dussehra (Vijayadashami)', date: new Date('2027-10-10'), description: 'Victory of good over evil',                                     holidayType: 'national', isDefault: true },
  { name: 'Diwali',                   date: new Date('2027-10-29'), description: 'Festival of Lights',                                            holidayType: 'national', isDefault: true },
  { name: 'Christmas',                date: new Date('2027-12-25'), description: 'Christmas Day',                                                  holidayType: 'national', isDefault: true },
];

async function notifyAll(creatorId: string, title: string, message: string) {
  const users = await prisma.user.findMany({ where: { id: { not: creatorId } }, select: { id: true } });
  await Promise.all(users.map(u => createNotification({ userId: u.id, title, message, type: 'info' })));
}

// ── Seed holidays ─────────────────────────────────────────────────────────────
export const seedHolidays = catchAsync(async (_req: AuthRequest, res: Response) => {
  const count = await prisma.publicHoliday.count();
  if (count === 0) {
    await prisma.publicHoliday.createMany({ data: DEFAULT_HOLIDAYS });
  }
  res.json({ success: true, message: 'Holidays seeded' });
});

// ── Calendar Events ───────────────────────────────────────────────────────────
export const listEvents = catchAsync(async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query as Record<string, string>;
  const where: any = {};
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end   = new Date(Number(year), Number(month), 0, 23, 59, 59);
    where.eventDate = { gte: start, lte: end };
  }
  const events = await prisma.calendarEvent.findMany({ where, orderBy: { eventDate: 'asc' } });
  res.json({ success: true, data: events });
});

export const createEvent = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const { title, description, eventType, eventDate, startTime, endTime, location } = req.body as Record<string, string>;
  const event = await prisma.calendarEvent.create({
    data: { title, description, eventType: eventType || 'company', eventDate: new Date(eventDate), startTime, endTime, location, createdById: req.user!.id },
  });
  const dateStr = new Date(eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  await notifyAll(req.user!.id, '📅 Company Event Added', `${title} — ${dateStr}${startTime ? ` at ${startTime}` : ''}${location ? ` · ${location}` : ''}`);
  res.status(201).json({ success: true, data: event });
});

export const updateEvent = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const { id } = req.params as Record<string, string>;
  const { title, description, eventType, eventDate, startTime, endTime, location } = req.body as Record<string, string>;
  const event = await prisma.calendarEvent.update({
    where: { id },
    data: { title, description, eventType, eventDate: eventDate ? new Date(eventDate) : undefined, startTime, endTime, location },
  });
  await notifyAll(req.user!.id, '📅 Event Updated', `"${event.title}" has been updated.`);
  res.json({ success: true, data: event });
});

export const deleteEvent = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const { id } = req.params as Record<string, string>;
  const event = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND');
  await prisma.calendarEvent.delete({ where: { id } });
  await notifyAll(req.user!.id, '📅 Event Cancelled', `"${event.title}" has been cancelled.`);
  res.json({ success: true });
});

// ── Public Holidays ───────────────────────────────────────────────────────────
export const listHolidays = catchAsync(async (_req: AuthRequest, res: Response) => {
  const holidays = await prisma.publicHoliday.findMany({ orderBy: { date: 'asc' } });
  res.json({ success: true, data: holidays });
});

export const createHoliday = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const { name, date, description, holidayType } = req.body as Record<string, string>;
  const holiday = await prisma.publicHoliday.create({ data: { name, date: new Date(date), description, holidayType: holidayType || 'national' } });
  res.status(201).json({ success: true, data: holiday });
});

export const updateHoliday = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const { id } = req.params as Record<string, string>;
  const existing = await prisma.publicHoliday.findUnique({ where: { id } });
  if (!existing) throw new AppError('Holiday not found', 404, 'NOT_FOUND');
  if (existing.isDefault) throw new AppError('Default holidays cannot be modified', 403, 'FORBIDDEN');
  const { name, date, description, holidayType } = req.body as Record<string, string>;
  const holiday = await prisma.publicHoliday.update({ where: { id }, data: { name, date: date ? new Date(date) : undefined, description, holidayType } });
  res.json({ success: true, data: holiday });
});

export const deleteHoliday = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!CAN_MANAGE.includes(req.user!.role)) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
  const existing = await prisma.publicHoliday.findUnique({ where: { id: req.params.id as string } });
  if (!existing) throw new AppError('Holiday not found', 404, 'NOT_FOUND');
  if (existing.isDefault) throw new AppError('Default holidays cannot be deleted', 403, 'FORBIDDEN');
  await prisma.publicHoliday.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export const getTodayHoliday = catchAsync(async (_req: AuthRequest, res: Response) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const holiday = await prisma.publicHoliday.findFirst({ where: { date: { gte: start, lte: end } } });
  res.json({ success: true, data: holiday });
});

// ── Legacy: keep old endpoint working ─────────────────────────────────────────
export const createCalendarEvent = createEvent;
