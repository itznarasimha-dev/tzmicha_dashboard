import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { exec } from 'child_process';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { projectRouter } from './routes/project.routes';
import { taskRouter } from './routes/task.routes';
import { sprintRouter } from './routes/sprint.routes';
import { workUpdateRouter } from './routes/workUpdate.routes';
import { leaveRouter } from './routes/leave.routes';
import { attendanceRouter } from './routes/attendance.routes';
import { campaignRouter } from './routes/campaign.routes';
import { dealRouter } from './routes/deal.routes';
import { roadmapRouter } from './routes/roadmap.routes';
import { notificationRouter } from './routes/notification.routes';
import { activityRouter } from './routes/activity.routes';
import { settingRouter } from './routes/setting.routes';
import { calendarRouter } from './routes/calendar.routes';
import { recruitmentRouter, publicRecruitmentRouter } from './routes/recruitment.routes';
import { chatRouter } from './routes/chat.routes';
import { leadRouter } from './routes/lead.routes';
import { financeRouter } from './routes/finance.routes';
import { prisma } from './config/prisma';
import { markOverdueTasks, notifyUpcomingDeadlines } from './services/task.service';

// Keep DB connection alive — ping every 4 minutes to prevent Supabase idle disconnect
setInterval(async () => {
  try { await prisma.$queryRaw`SELECT 1`; } catch {}
}, 4 * 60 * 1000);

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

async function seedHolidaysOnStartup() {
  try {
    const count = await prisma.publicHoliday.count();
    if (count < DEFAULT_HOLIDAYS.length) {
      await prisma.publicHoliday.deleteMany();
      await prisma.publicHoliday.createMany({ data: DEFAULT_HOLIDAYS });
      console.log(`🎉 Public holidays seeded (${DEFAULT_HOLIDAYS.length} holidays for 2026–2027)`);
    }
  } catch (e) {
    console.error('Holiday seed failed:', e);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'TZMicha API Docs',
  customCss: '.swagger-ui .topbar { background-color: #e11d48; }',
  swaggerOptions: { persistAuthorization: true },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/users',        userRouter);
app.use('/api/projects',     projectRouter);
app.use('/api/tasks',        taskRouter);
app.use('/api/sprints',      sprintRouter);
app.use('/api/work-updates', workUpdateRouter);
app.use('/api/leave',        leaveRouter);
app.use('/api/attendance',   attendanceRouter);
app.use('/api/campaigns',    campaignRouter);
app.use('/api/deals',        dealRouter);
app.use('/api/roadmap',      roadmapRouter);
app.use('/api/notifications',notificationRouter);
app.use('/api/activity',     activityRouter);
app.use('/api/settings',     settingRouter);
app.use('/api/calendar-events', calendarRouter);
app.use('/api/recruitment',    publicRecruitmentRouter);
app.use('/api/recruitment',    recruitmentRouter);
app.use('/api/chat',           chatRouter);
app.use('/api/leads',          leadRouter);
app.use('/api/finance',        financeRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(PORT, async () => {
  await seedHolidaysOnStartup();

  // Run overdue check on startup and every hour
  const runChecks = async () => {
    try {
      const overdue = await markOverdueTasks();
      const upcoming = await notifyUpcomingDeadlines();
      if (overdue > 0 || upcoming > 0)
        console.log(`⏰ Overdue check: ${overdue} marked overdue, ${upcoming} deadline reminders sent`);
    } catch (e) { console.error('Overdue check failed:', e); }
  };
  await runChecks();
  setInterval(runChecks, 60 * 60 * 1000); // every hour
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 Server running at ${url}`);
  console.log(`📚 Swagger docs  → ${url}/api/docs`);
  console.log(`❤️  Health check  → ${url}/api/health\n`);

  // Auto-open Swagger in browser
  const openCmd = process.platform === 'win32' ? `start ${url}/api/docs`
    : process.platform === 'darwin' ? `open ${url}/api/docs`
    : `xdg-open ${url}/api/docs`;
  exec(openCmd);
});

export default app;
