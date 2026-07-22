import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listEvents, createEvent, updateEvent, deleteEvent,
  listHolidays, createHoliday, updateHoliday, deleteHoliday,
  getTodayHoliday, seedHolidays,
} from '../controllers/calendar.controller';

export const calendarRouter = Router();
calendarRouter.use(authenticate);

// Events
calendarRouter.get('/events',          listEvents);
calendarRouter.post('/events',         createEvent);
calendarRouter.patch('/events/:id',    updateEvent);
calendarRouter.delete('/events/:id',   deleteEvent);

// Holidays
calendarRouter.get('/holidays',        listHolidays);
calendarRouter.get('/holidays/today',  getTodayHoliday);
calendarRouter.post('/holidays',       createHoliday);
calendarRouter.patch('/holidays/:id',  updateHoliday);
calendarRouter.delete('/holidays/:id', deleteHoliday);
calendarRouter.post('/holidays/seed',  seedHolidays);

// Legacy
calendarRouter.post('/', createEvent);
