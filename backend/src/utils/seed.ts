import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users: { name: string; email: string; password: string; role: UserRole; key: string; department: string; title: string; skills: string[] }[] = [
  { name: 'Suresh Kumar',   email: 'suresh@tzmicha.com',         password: 'admin123',      role: 'admin',           key: 'admin',           department: 'Operations',      title: 'Administrator',            skills: ['Leadership', 'Strategy'] },
  { name: 'Sarah Chen',     email: 'sarah.chen@tzmicha.com',     password: 'frontend123',   role: 'frontend_dev',    key: 'frontend_dev',    department: 'Engineering',     title: 'Frontend Engineer',        skills: ['React', 'TypeScript', 'Tailwind'] },
  { name: 'James Okafor',   email: 'james.okafor@tzmicha.com',   password: 'backend123',    role: 'backend_dev',     key: 'backend_dev',     department: 'Engineering',     title: 'Backend Engineer',         skills: ['Node.js', 'PostgreSQL', 'Prisma'] },
  { name: 'Priya Sharma',   email: 'priya.sharma@tzmicha.com',   password: 'qa123',         role: 'qa',              key: 'qa',              department: 'Engineering',     title: 'QA Lead',                  skills: ['Cypress', 'Jest', 'Test Planning'] },
  { name: 'Marcus Williams',email: 'marcus.williams@tzmicha.com',password: 'marketing123',  role: 'marketing',       key: 'marketing',       department: 'Marketing',       title: 'Marketing Manager',        skills: ['SEO', 'Google Ads', 'Content Strategy'] },
  { name: 'Elena Vasquez',  email: 'elena.vasquez@tzmicha.com',  password: 'hr123',         role: 'hr',              key: 'hr',              department: 'Human Resources', title: 'HR Manager',               skills: ['Recruitment', 'Payroll', 'Compliance'] },
  { name: 'David Kim',      email: 'david.kim@tzmicha.com',      password: 'product123',    role: 'product_manager', key: 'product_manager', department: 'Product',         title: 'Product Manager',          skills: ['Roadmapping', 'Agile', 'Figma'] },
  { name: 'Aisha Patel',    email: 'aisha.patel@tzmicha.com',    password: 'sales123',      role: 'sales',           key: 'sales',           department: 'Sales',           title: 'Sales Lead',               skills: ['CRM', 'Negotiation', 'Pipeline Management'] },
  { name: 'Riya Desai',     email: 'finance@tzmicha.com',        password: 'finance123',    role: 'finance',         key: 'finance',         department: 'Finance',         title: 'Finance Manager',          skills: ['Accounting', 'Budgeting', 'Financial Analysis'] },
];

async function main() {
  console.log('Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
        department: u.department,
        title: u.title,
        skills: u.skills,
        status: 'active',
        phone: '+1 (555) 000-0000',
        location: 'New York, NY',
        bio: 'Passionate professional dedicated to building great products.',
        startDate: new Date('2022-01-15'),
      },
    });
    createdUsers[u.key] = user.id;
    await prisma.leaveBalance.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, annualTotal: 20, annualUsed: 5, sickTotal: 10, sickUsed: 2, casualTotal: 5, casualUsed: 1 },
    });
    console.log(`  User: ${u.name} (${u.role})`);
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  const p1 = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      name: 'TZMicha Platform v2',
      description: 'Complete redesign and rebuild of the core platform',
      status: 'active',
      progress: 45,
      startDate: new Date('2024-01-01'),
      endDate: new Date(Date.now() + 60 * 86400000),
      color: '#6366f1',
      ownerId: createdUsers['product_manager'],
    },
  });

  const p2 = await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      name: 'Mobile App',
      description: 'React Native mobile application',
      status: 'active',
      progress: 34,
      startDate: new Date('2024-02-01'),
      endDate: new Date(Date.now() + 90 * 86400000),
      color: '#8b5cf6',
      ownerId: createdUsers['product_manager'],
    },
  });

  const p3 = await prisma.project.upsert({
    where: { id: 'seed-project-3' },
    update: {},
    create: {
      id: 'seed-project-3',
      name: 'Analytics Engine',
      description: 'Real-time analytics and reporting system',
      status: 'active',
      progress: 20,
      startDate: new Date('2024-03-01'),
      endDate: new Date(Date.now() + 120 * 86400000),
      color: '#10b981',
      ownerId: createdUsers['product_manager'],
    },
  });
  console.log('  Projects seeded');

  // ── Sprints ────────────────────────────────────────────────────────────────
  const now = new Date();
  const d = (days: number) => new Date(Date.now() + days * 86400000);

  const s1 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-1' },
    update: {},
    create: {
      id: 'seed-sprint-1',
      name: 'Sprint 12',
      projectId: p1.id,
      startDate: d(-7),
      endDate: d(7),
      status: 'active',
      goal: 'Complete dashboard redesign and fix critical bugs',
      velocity: 42,
    },
  });

  await prisma.sprint.upsert({
    where: { id: 'seed-sprint-2' },
    update: {},
    create: {
      id: 'seed-sprint-2',
      name: 'Sprint 11',
      projectId: p1.id,
      startDate: d(-21),
      endDate: d(-8),
      status: 'completed',
      velocity: 38,
    },
  });

  const s2 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-3' },
    update: {},
    create: {
      id: 'seed-sprint-3',
      name: 'Mobile Sprint 4',
      projectId: p2.id,
      startDate: d(-3),
      endDate: d(11),
      status: 'active',
      goal: 'Ship authentication screens and onboarding flow',
      velocity: 30,
    },
  });

  const s3 = await prisma.sprint.upsert({
    where: { id: 'seed-sprint-4' },
    update: {},
    create: {
      id: 'seed-sprint-4',
      name: 'Analytics Sprint 1',
      projectId: p3.id,
      startDate: d(-2),
      endDate: d(12),
      status: 'active',
      goal: 'Build data ingestion pipeline and first dashboard widgets',
      velocity: 20,
    },
  });
  console.log('  Sprints seeded');

  // ── Tasks (26 tasks across all roles) ─────────────────────────────────────
  const taskData = [
    // Frontend Dev — Sarah Chen
    { id: 'seed-task-1',  title: 'Implement role-based sidebar navigation',   status: 'done',        priority: 'high',     assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','navigation'],    est: 8,  logged: 7.5, due: d(-5),  desc: 'Build dynamic sidebar that shows/hides items based on user role.' },
    { id: 'seed-task-2',  title: 'Design KPI card components',                status: 'done',        priority: 'high',     assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','design-system'], est: 6,  logged: 5,   due: d(-3),  desc: 'Create reusable stat card components with trend indicators.' },
    { id: 'seed-task-6',  title: 'Implement dark mode toggle',                status: 'in_progress', priority: 'medium',   assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','ui'],            est: 4,  logged: 2,   due: d(3),   desc: 'Add theme switcher with system preference detection and localStorage persistence.' },
    { id: 'seed-task-9',  title: 'Build mobile auth screens',                 status: 'in_progress', priority: 'critical', assignee: 'frontend_dev', project: p2.id, sprint: s2.id, labels: ['mobile','auth'],            est: 12, logged: 5,   due: d(5),   desc: 'Login, register, forgot password screens for React Native app.' },
    { id: 'seed-task-10', title: 'Sprint board drag-and-drop UI',             status: 'todo',        priority: 'high',     assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','sprint'],        est: 10, logged: 0,   due: d(7),   desc: 'Implement DnD kanban board using @dnd-kit with column reordering.' },
    { id: 'seed-task-11', title: 'Notification bell with real-time updates',  status: 'todo',        priority: 'medium',   assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','notifications'], est: 6,  logged: 0,   due: d(10),  desc: 'Polling-based notification badge with dropdown panel.' },
    { id: 'seed-task-12', title: 'Fix chart tooltip overflow on mobile',      status: 'in_review',   priority: 'medium',   assignee: 'frontend_dev', project: p1.id, sprint: s1.id, labels: ['frontend','bug'],           est: 3,  logged: 2.5, due: d(2),   desc: 'Recharts tooltip clips outside viewport on small screens.' },

    // Backend Dev — James Okafor
    { id: 'seed-task-3',  title: 'Build REST API for employee management',    status: 'in_progress', priority: 'high',     assignee: 'backend_dev',  project: p1.id, sprint: s1.id, labels: ['backend','api'],            est: 16, logged: 10,  due: d(4),   desc: 'CRUD endpoints for users with role-based access control.' },
    { id: 'seed-task-5',  title: 'Optimize database query performance',       status: 'in_progress', priority: 'critical', assignee: 'backend_dev',  project: p1.id, sprint: s1.id, labels: ['backend','performance'],    est: 12, logged: 8,   due: d(2),   desc: 'Add indexes, optimize N+1 queries, implement query caching.', notes: 'Blocked on DBA approval for index creation on production.' },
    { id: 'seed-task-7',  title: 'Set up CI/CD pipeline',                    status: 'blocked',     priority: 'high',     assignee: 'backend_dev',  project: p1.id, sprint: s1.id, labels: ['devops','infrastructure'],  est: 8,  logged: 2,   due: d(6),   desc: 'GitHub Actions pipeline for test, build, and deploy to staging.', notes: 'Waiting for DevOps team to provision staging server credentials.' },
    { id: 'seed-task-13', title: 'Implement JWT refresh token rotation',      status: 'done',        priority: 'critical', assignee: 'backend_dev',  project: p1.id, sprint: s1.id, labels: ['backend','auth','security'], est: 8,  logged: 8,   due: d(-2),  desc: 'Secure token rotation with Redis blacklist for revoked tokens.' },
    { id: 'seed-task-14', title: 'Analytics data ingestion API',              status: 'todo',        priority: 'high',     assignee: 'backend_dev',  project: p3.id, sprint: s3.id, labels: ['backend','analytics'],      est: 14, logged: 0,   due: d(12),  desc: 'Batch ingestion endpoint for event tracking data.' },
    { id: 'seed-task-15', title: 'WebSocket server for real-time notifications', status: 'todo',     priority: 'medium',   assignee: 'backend_dev',  project: p1.id, sprint: s1.id, labels: ['backend','realtime'],       est: 10, logged: 0,   due: d(14),  desc: 'Socket.io server with room-based notification delivery.' },

    // QA — Priya Sharma
    { id: 'seed-task-4',  title: 'Write E2E tests for auth flow',             status: 'in_review',   priority: 'medium',   assignee: 'qa',           project: p1.id, sprint: s1.id, labels: ['qa','testing'],             est: 8,  logged: 6,   due: d(1),   desc: 'Cypress E2E tests covering login, logout, token refresh, and role redirect.' },
    { id: 'seed-task-16', title: 'Test sprint board drag-and-drop',           status: 'todo',        priority: 'high',     assignee: 'qa',           project: p1.id, sprint: s1.id, labels: ['qa','sprint'],              est: 6,  logged: 0,   due: d(8),   desc: 'Verify DnD works across all columns, status updates persist, and UI reflects changes.' },
    { id: 'seed-task-17', title: 'Performance regression testing',            status: 'in_progress', priority: 'high',     assignee: 'qa',           project: p1.id, sprint: s1.id, labels: ['qa','performance'],         est: 10, logged: 4,   due: d(5),   desc: 'Lighthouse CI checks on all dashboard pages, target score >90.' },
    { id: 'seed-task-18', title: 'Mobile app smoke tests',                    status: 'backlog',     priority: 'medium',   assignee: 'qa',           project: p2.id, sprint: s2.id, labels: ['qa','mobile'],              est: 8,  logged: 0,   due: d(15),  desc: 'Basic smoke test suite for React Native app on iOS and Android.' },
    { id: 'seed-task-19', title: 'API contract testing with Pact',            status: 'todo',        priority: 'medium',   assignee: 'qa',           project: p1.id, sprint: s1.id, labels: ['qa','api'],                 est: 8,  logged: 0,   due: d(11),  desc: 'Consumer-driven contract tests between frontend and backend.' },

    // Marketing — Marcus Williams
    { id: 'seed-task-8',  title: 'Create onboarding email sequence',          status: 'in_progress', priority: 'high',     assignee: 'marketing',    project: p1.id, sprint: s1.id, labels: ['marketing','email'],        est: 8,  logged: 3,   due: d(4),   desc: '5-email drip sequence for new user onboarding with HubSpot automation.' },
    { id: 'seed-task-20', title: 'Q2 campaign landing page copy',             status: 'todo',        priority: 'medium',   assignee: 'marketing',    project: p1.id, sprint: s1.id, labels: ['marketing','content'],      est: 6,  logged: 0,   due: d(9),   desc: 'Write and review landing page copy for Q2 product launch campaign.' },
    { id: 'seed-task-21', title: 'Set up Google Analytics 4 events',         status: 'in_review',   priority: 'high',     assignee: 'marketing',    project: p3.id, sprint: s3.id, labels: ['marketing','analytics'],    est: 5,  logged: 4,   due: d(2),   desc: 'Configure GA4 custom events for key user actions across the platform.' },
    { id: 'seed-task-22', title: 'Competitor analysis report',                status: 'done',        priority: 'low',      assignee: 'marketing',    project: p1.id, sprint: s1.id, labels: ['marketing','research'],     est: 6,  logged: 6,   due: d(-4),  desc: 'Detailed analysis of top 5 competitors — features, pricing, positioning.' },

    // Sales — Aisha Patel
    { id: 'seed-task-23', title: 'Update CRM pipeline for Q2 targets',       status: 'in_progress', priority: 'high',     assignee: 'sales',        project: p1.id, sprint: s1.id, labels: ['sales','crm'],              est: 4,  logged: 2,   due: d(3),   desc: 'Restructure deal stages and update probability weights for Q2 forecast.' },
    { id: 'seed-task-24', title: 'Prepare enterprise demo deck',             status: 'todo',        priority: 'critical', assignee: 'sales',        project: p1.id, sprint: s1.id, labels: ['sales','demo'],             est: 6,  logged: 0,   due: d(2),   desc: 'Custom demo environment and slide deck for Acme Corp enterprise pitch.' },
    { id: 'seed-task-25', title: 'Follow up on 15 warm leads',               status: 'todo',        priority: 'high',     assignee: 'sales',        project: p1.id, sprint: s1.id, labels: ['sales','outreach'],         est: 3,  logged: 0,   due: d(1),   desc: 'Personalised follow-up emails to leads from last week webinar.' },
    { id: 'seed-task-26', title: 'Draft Q2 sales playbook',                  status: 'backlog',     priority: 'medium',   assignee: 'sales',        project: p1.id, sprint: s1.id, labels: ['sales','strategy'],         est: 8,  logged: 0,   due: d(18),  desc: 'Document objection handling, discovery questions, and closing techniques.' },
  ];

  for (const t of taskData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        status: t.status as any,
        dueDate: t.due,
        loggedHours: t.logged ?? 0,
      },
      create: {
        id: t.id,
        title: t.title,
        description: (t as any).desc,
        notes: (t as any).notes,
        status: t.status as any,
        priority: t.priority as any,
        assigneeId: createdUsers[t.assignee],
        reporterId: createdUsers['product_manager'],
        projectId: t.project,
        sprintId: t.sprint,
        labels: t.labels,
        estimatedHours: t.est,
        loggedHours: t.logged ?? 0,
        dueDate: t.due,
        assignedDate: now,
      },
    });
  }
  console.log('  Tasks seeded — 26 tasks across all roles');

  // ── Leave Requests ─────────────────────────────────────────────────────────
  const leaveData = [
    { id: 'seed-leave-1', userId: createdUsers['frontend_dev'], type: 'annual',  startDate: '2025-02-12', endDate: '2025-02-16', days: 5, reason: 'Family vacation' },
    { id: 'seed-leave-2', userId: createdUsers['backend_dev'],  type: 'sick',    startDate: '2025-02-20', endDate: '2025-02-21', days: 2, reason: 'Medical appointment' },
    { id: 'seed-leave-3', userId: createdUsers['qa'],           type: 'casual',  startDate: '2025-03-01', endDate: '2025-03-01', days: 1, reason: 'Personal errand' },
    { id: 'seed-leave-4', userId: createdUsers['marketing'],    type: 'annual',  startDate: '2025-03-10', endDate: '2025-03-14', days: 5, reason: 'Spring break' },
    { id: 'seed-leave-5', userId: createdUsers['sales'],        type: 'sick',    startDate: '2025-02-25', endDate: '2025-02-25', days: 1, reason: 'Feeling unwell' },
    { id: 'seed-leave-6', userId: createdUsers['hr'],           type: 'annual',  startDate: '2025-03-05', endDate: '2025-03-07', days: 3, reason: 'Personal trip' },
  ];
  for (const l of leaveData) {
    await prisma.leaveRequest.upsert({
      where: { id: l.id },
      update: { status: 'pending', approverId: null },
      create: { id: l.id, userId: l.userId, type: l.type as any, startDate: new Date(l.startDate), endDate: new Date(l.endDate), days: l.days, reason: l.reason, status: 'pending' },
    });
  }
  console.log('  Leave requests seeded');

  // ── Campaigns ──────────────────────────────────────────────────────────────
  const campaignData = [
    { id: 'seed-campaign-1', name: 'Q1 Product Launch',     status: 'active',    channel: 'email',  budget: 15000, spent: 8200,  startDate: '2024-02-01', endDate: '2024-03-31', impressions: 124500, clicks: 8930,  conversions: 342, roi: 2.8 },
    { id: 'seed-campaign-2', name: 'Spring Social Campaign', status: 'active',   channel: 'social', budget: 8000,  spent: 3100,  startDate: '2024-02-15', endDate: '2024-04-15', impressions: 89200,  clicks: 4210,  conversions: 128, roi: 1.9 },
    { id: 'seed-campaign-3', name: 'Google Ads Brand',      status: 'active',    channel: 'paid',   budget: 20000, spent: 12400, startDate: '2024-01-01', endDate: '2024-03-31', impressions: 340000, clicks: 18200, conversions: 890, roi: 3.4 },
    { id: 'seed-campaign-4', name: 'SEO Content Push',      status: 'completed', channel: 'seo',    budget: 5000,  spent: 5000,  startDate: '2024-01-01', endDate: '2024-01-31', impressions: 56000,  clicks: 3400,  conversions: 89,  roi: 1.4 },
  ];
  for (const c of campaignData) {
    await prisma.campaign.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, status: c.status as any, channel: c.channel as any, budget: c.budget, spent: c.spent, startDate: new Date(c.startDate), endDate: new Date(c.endDate), impressions: c.impressions, clicks: c.clicks, conversions: c.conversions, roi: c.roi },
    });
  }
  console.log('  Campaigns seeded');

  // ── Deals ──────────────────────────────────────────────────────────────────
  const dealData = [
    { id: 'seed-deal-1', title: 'Enterprise SaaS License',  company: 'Acme Corp',        value: 48000, stage: 'proposal',    probability: 60,  closeDate: '2024-03-31' },
    { id: 'seed-deal-2', title: 'Annual Support Contract',  company: 'TechStart Inc',    value: 12000, stage: 'negotiation', probability: 80,  closeDate: '2024-02-28' },
    { id: 'seed-deal-3', title: 'Platform Integration',     company: 'GlobalRetail Ltd', value: 75000, stage: 'qualified',   probability: 40,  closeDate: '2024-04-30' },
    { id: 'seed-deal-4', title: 'Starter Plan Upgrade',     company: 'SmallBiz Co',      value: 3600,  stage: 'closed_won',  probability: 100, closeDate: '2024-02-15' },
    { id: 'seed-deal-5', title: 'Custom Development',       company: 'FinanceGroup',     value: 95000, stage: 'lead',        probability: 20,  closeDate: '2024-05-31' },
  ];
  for (const dd of dealData) {
    await prisma.deal.upsert({
      where: { id: dd.id },
      update: {},
      create: { id: dd.id, title: dd.title, company: dd.company, value: dd.value, stage: dd.stage as any, probability: dd.probability, ownerId: createdUsers['sales'], closeDate: new Date(dd.closeDate) },
    });
  }
  console.log('  Deals seeded');

  // ── Roadmap Items ──────────────────────────────────────────────────────────
  const roadmapData = [
    { id: 'seed-road-1', title: 'Auth & User Management',   status: 'completed',   quarter: 'Q1', year: 2024, progress: 100, team: 'Backend',  priority: 'critical' },
    { id: 'seed-road-2', title: 'Dashboard Redesign',       status: 'completed',   quarter: 'Q1', year: 2024, progress: 100, team: 'Frontend', priority: 'high' },
    { id: 'seed-road-3', title: 'Mobile App MVP',           status: 'in_progress', quarter: 'Q2', year: 2024, progress: 34,  team: 'Frontend', priority: 'high' },
    { id: 'seed-road-4', title: 'Analytics Engine',         status: 'planned',     quarter: 'Q3', year: 2024, progress: 0,   team: 'Backend',  priority: 'medium' },
    { id: 'seed-road-5', title: 'AI Assistant Integration', status: 'planned',     quarter: 'Q4', year: 2024, progress: 0,   team: 'Product',  priority: 'medium' },
    { id: 'seed-road-6', title: 'Enterprise SSO',           status: 'planned',     quarter: 'Q4', year: 2024, progress: 0,   team: 'Backend',  priority: 'high' },
  ];
  for (const r of roadmapData) {
    await prisma.roadmapItem.upsert({
      where: { id: r.id },
      update: {},
      create: { id: r.id, title: r.title, status: r.status as any, quarter: r.quarter, year: r.year, progress: r.progress, team: r.team, priority: r.priority as any },
    });
  }
  console.log('  Roadmap items seeded');

  // ── Notifications ──────────────────────────────────────────────────────────
  const notifData = [
    { userId: createdUsers['admin'],           title: 'PR Review Requested',    message: 'Sarah Chen requested your review on #148 — Design system button variants', type: 'info',    read: false, link: '/projects' },
    { userId: createdUsers['admin'],           title: 'Critical Bug Filed',     message: 'Login page crashes on Safari 16 — assigned to you',                        type: 'error',   read: false, link: '/tasks' },
    { userId: createdUsers['admin'],           title: 'Sprint 12 Ending Soon',  message: 'Sprint 12 ends in 7 days. 4 tasks still in progress.',                     type: 'warning', read: false, link: '/sprint' },
    { userId: createdUsers['frontend_dev'],    title: 'New Task Assigned',      message: 'You have been assigned: "Build mobile auth screens" — Due in 5 days',      type: 'info',    read: false, link: '/sprint' },
    { userId: createdUsers['backend_dev'],     title: 'Task Overdue Warning',   message: '"Optimize database query performance" is due in 2 days',                   type: 'warning', read: false, link: '/sprint' },
    { userId: createdUsers['qa'],              title: 'New Task Assigned',      message: 'You have been assigned: "Write E2E tests for auth flow"',                  type: 'info',    read: false, link: '/sprint' },
    { userId: createdUsers['product_manager'], title: 'Extension Requested',    message: 'James Okafor requested a deadline extension for "Set up CI/CD pipeline"', type: 'warning', read: false, link: '/sprint' },
  ];
  for (const n of notifData) {
    await prisma.notification.create({ data: n as any }).catch(() => {});
  }
  console.log('  Notifications seeded');

  // ── Activities ─────────────────────────────────────────────────────────────
  const activityData = [
    { userId: createdUsers['frontend_dev'],    action: 'merged PR',              target: '#142 — Dashboard KPI components',       type: 'commit' },
    { userId: createdUsers['qa'],              action: 'filed bug',              target: 'Login page crashes on Safari 16',        type: 'bug' },
    { userId: createdUsers['backend_dev'],     action: 'deployed to staging',    target: 'v2.4.1-beta',                            type: 'deploy' },
    { userId: createdUsers['hr'],              action: 'approved leave request', target: 'Sarah Chen — 5 days annual leave',       type: 'leave' },
    { userId: createdUsers['marketing'],       action: 'launched campaign',      target: 'Q1 Product Launch',                      type: 'campaign' },
    { userId: createdUsers['product_manager'], action: 'updated roadmap',        target: 'Q2 2024 — Analytics Engine',             type: 'task' },
    { userId: createdUsers['admin'],           action: 'added user',             target: 'Aisha Patel — Sales Lead',               type: 'general' },
  ];
  for (const a of activityData) {
    await prisma.activity.create({ data: a as any }).catch(() => {});
  }
  console.log('  Activities seeded');

  // ── Work Updates ───────────────────────────────────────────────────────────
  const wu = await prisma.workUpdate.create({
    data: {
      userId: createdUsers['frontend_dev'],
      date: new Date(),
      blockers: 'Waiting on Figma handoff for the new modal designs',
      planForTomorrow: 'Complete button variants, start on form components',
      totalHours: 6.5,
      submittedAt: new Date(),
      tasks: {
        create: [
          { title: 'Implement dashboard KPI cards', ticketRef: 'FE-142', status: 'completed',   hours: 3 },
          { title: 'Fix mobile nav regression',     ticketRef: 'FE-145', status: 'completed',   hours: 1.5 },
          { title: 'Design system button variants', ticketRef: 'FE-148', status: 'in_progress', hours: 2 },
        ],
      },
    },
  }).catch(() => null);
  if (wu) console.log('  Work updates seeded');

  // ── Job Openings ───────────────────────────────────────────────────────────
  const jobData = [
    { id: 'seed-job-1', title: 'Senior React Developer',       department: 'Engineering',     location: 'Bangalore, India', type: 'full_time', status: 'open',    description: 'Looking for an experienced React developer to join our frontend team.', requirements: '4+ years React, TypeScript, REST APIs' },
    { id: 'seed-job-2', title: 'Node.js Backend Engineer',     department: 'Engineering',     location: 'Hyderabad, India', type: 'full_time', status: 'open',    description: 'Backend engineer to build scalable APIs and microservices.',           requirements: '3+ years Node.js, PostgreSQL, Docker' },
    { id: 'seed-job-3', title: 'QA Automation Engineer',       department: 'Engineering',     location: 'Pune, India',      type: 'full_time', status: 'open',    description: 'Automate test suites and ensure product quality.',                     requirements: 'Cypress, Jest, Selenium, 2+ years QA' },
    { id: 'seed-job-4', title: 'Digital Marketing Specialist', department: 'Marketing',       location: 'Mumbai, India',    type: 'full_time', status: 'open',    description: 'Drive growth through digital campaigns and SEO.',                      requirements: 'Google Ads, SEO, Content Strategy, 3+ years' },
    { id: 'seed-job-5', title: 'HR Business Partner',          department: 'Human Resources', location: 'Delhi, India',     type: 'full_time', status: 'on_hold', description: 'Partner with business leaders on people strategy.',                    requirements: 'HR generalist, 4+ years, MBA preferred' },
    { id: 'seed-job-6', title: 'Product Manager',              department: 'Product',         location: 'Bangalore, India', type: 'full_time', status: 'open',    description: 'Own product roadmap and work with cross-functional teams.',            requirements: 'Agile, Figma, 3+ years PM experience' },
  ];
  for (const j of jobData) {
    await prisma.jobOpening.upsert({
      where: { id: j.id },
      update: {},
      create: { id: j.id, title: j.title, department: j.department, location: j.location, type: j.type, status: j.status as any, description: j.description, requirements: j.requirements, createdById: createdUsers['hr'] },
    });
  }
  console.log('  Job openings seeded');

  // ── Candidates ─────────────────────────────────────────────────────────────
  const candidateData = [
    { id: 'seed-cand-1',  name: 'Arjun Mehta',         email: 'arjun.mehta@gmail.com',    phone: '+91 98765 43210', experience: 5, skills: ['React','TypeScript','Redux','GraphQL'],           appliedPosition: 'Senior React Developer',       jobOpeningId: 'seed-job-1', status: 'technical_interview', notes: 'Strong portfolio, good communication' },
    { id: 'seed-cand-2',  name: 'Sneha Iyer',          email: 'sneha.iyer@gmail.com',     phone: '+91 91234 56789', experience: 4, skills: ['React','Next.js','Tailwind CSS','TypeScript'],     appliedPosition: 'Senior React Developer',       jobOpeningId: 'seed-job-1', status: 'hr_interview',        notes: 'Excellent technical round, culture fit pending' },
    { id: 'seed-cand-3',  name: 'Rahul Gupta',         email: 'rahul.gupta@outlook.com',  phone: '+91 99887 76655', experience: 3, skills: ['Node.js','Express','PostgreSQL','Docker'],         appliedPosition: 'Node.js Backend Engineer',     jobOpeningId: 'seed-job-2', status: 'screening',           notes: 'Good fundamentals, needs system design practice' },
    { id: 'seed-cand-4',  name: 'Kavya Nair',          email: 'kavya.nair@gmail.com',     phone: '+91 88776 65544', experience: 6, skills: ['Node.js','Microservices','Kafka','Redis'],         appliedPosition: 'Node.js Backend Engineer',     jobOpeningId: 'seed-job-2', status: 'selected',            notes: 'Exceptional candidate, strong system design' },
    { id: 'seed-cand-5',  name: 'Vikram Singh',        email: 'vikram.singh@yahoo.com',   phone: '+91 77665 54433', experience: 2, skills: ['Cypress','Jest','Selenium','Postman'],             appliedPosition: 'QA Automation Engineer',       jobOpeningId: 'seed-job-3', status: 'applied',             notes: 'Fresh but promising, good test mindset' },
    { id: 'seed-cand-6',  name: 'Pooja Reddy',         email: 'pooja.reddy@gmail.com',    phone: '+91 66554 43322', experience: 4, skills: ['Cypress','Playwright','API Testing','CI/CD'],      appliedPosition: 'QA Automation Engineer',       jobOpeningId: 'seed-job-3', status: 'technical_interview', notes: 'Strong automation skills' },
    { id: 'seed-cand-7',  name: 'Amit Sharma',         email: 'amit.sharma@gmail.com',    phone: '+91 55443 32211', experience: 5, skills: ['Google Ads','SEO','Content Marketing','HubSpot'],  appliedPosition: 'Digital Marketing Specialist', jobOpeningId: 'seed-job-4', status: 'hr_interview',        notes: 'Impressive campaign results at previous company' },
    { id: 'seed-cand-8',  name: 'Divya Krishnan',      email: 'divya.krishnan@gmail.com', phone: '+91 44332 21100', experience: 3, skills: ['SEO','Social Media','Analytics','Copywriting'],    appliedPosition: 'Digital Marketing Specialist', jobOpeningId: 'seed-job-4', status: 'screening',           notes: 'Good SEO knowledge, needs paid ads experience' },
    { id: 'seed-cand-9',  name: 'Rohan Joshi',         email: 'rohan.joshi@outlook.com',  phone: '+91 33221 10099', experience: 7, skills: ['Product Strategy','Agile','Figma','SQL'],          appliedPosition: 'Product Manager',              jobOpeningId: 'seed-job-6', status: 'selected',            notes: 'Excellent product sense, strong data background' },
    { id: 'seed-cand-10', name: 'Ananya Patel',        email: 'ananya.patel@gmail.com',   phone: '+91 22110 09988', experience: 4, skills: ['Agile','Jira','User Research','Roadmapping'],      appliedPosition: 'Product Manager',              jobOpeningId: 'seed-job-6', status: 'technical_interview', notes: 'Strong user research background' },
    { id: 'seed-cand-11', name: 'Karthik Subramanian', email: 'karthik.sub@gmail.com',    phone: '+91 11009 98877', experience: 2, skills: ['React','JavaScript','CSS','Git'],                  appliedPosition: 'Senior React Developer',       jobOpeningId: 'seed-job-1', status: 'rejected',            notes: 'Not enough experience for senior role' },
    { id: 'seed-cand-12', name: 'Meera Agarwal',       email: 'meera.agarwal@gmail.com',  phone: '+91 90909 80808', experience: 5, skills: ['HR Generalist','Recruitment','HRIS','Compliance'],  appliedPosition: 'HR Business Partner',          jobOpeningId: 'seed-job-5', status: 'applied',             notes: 'Applied while position is on hold' },
  ];
  for (const c of candidateData) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, email: c.email, phone: c.phone, experience: c.experience, skills: c.skills, appliedPosition: c.appliedPosition, jobOpeningId: c.jobOpeningId, status: c.status as any, notes: c.notes },
    });
  }
  console.log('  Candidates seeded');

  // ── Interviews ─────────────────────────────────────────────────────────────
  const interviewData = [
    { id: 'seed-iv-1',  candidateId: 'seed-cand-1',  scheduledAt: new Date('2025-02-10T10:00:00Z'), type: 'technical', interviewers: ['James Okafor','Sarah Chen'], status: 'completed', notes: 'Passed. Strong React knowledge.' },
    { id: 'seed-iv-2',  candidateId: 'seed-cand-2',  scheduledAt: new Date('2025-02-12T11:00:00Z'), type: 'technical', interviewers: ['Sarah Chen'],               status: 'completed', notes: 'Excellent. Recommended for HR round.' },
    { id: 'seed-iv-3',  candidateId: 'seed-cand-2',  scheduledAt: new Date('2025-02-18T14:00:00Z'), type: 'hr',        interviewers: ['Elena Vasquez'],            status: 'scheduled', notes: '' },
    { id: 'seed-iv-4',  candidateId: 'seed-cand-4',  scheduledAt: new Date('2025-02-08T09:00:00Z'), type: 'technical', interviewers: ['James Okafor'],             status: 'completed', notes: 'Outstanding. Kafka and Redis expertise impressive.' },
    { id: 'seed-iv-5',  candidateId: 'seed-cand-4',  scheduledAt: new Date('2025-02-14T15:00:00Z'), type: 'hr',        interviewers: ['Elena Vasquez'],            status: 'completed', notes: 'Great culture fit. Offer to be extended.' },
    { id: 'seed-iv-6',  candidateId: 'seed-cand-6',  scheduledAt: new Date('2025-02-20T10:30:00Z'), type: 'technical', interviewers: ['Priya Sharma'],             status: 'scheduled', notes: '' },
    { id: 'seed-iv-7',  candidateId: 'seed-cand-7',  scheduledAt: new Date('2025-02-15T13:00:00Z'), type: 'technical', interviewers: ['Marcus Williams'],          status: 'completed', notes: 'Strong campaign metrics. Moved to HR round.' },
    { id: 'seed-iv-8',  candidateId: 'seed-cand-7',  scheduledAt: new Date('2025-02-22T11:00:00Z'), type: 'hr',        interviewers: ['Elena Vasquez'],            status: 'scheduled', notes: '' },
    { id: 'seed-iv-9',  candidateId: 'seed-cand-9',  scheduledAt: new Date('2025-02-07T10:00:00Z'), type: 'technical', interviewers: ['David Kim','Alex Morgan'],   status: 'completed', notes: 'Exceptional product thinking.' },
    { id: 'seed-iv-10', candidateId: 'seed-cand-9',  scheduledAt: new Date('2025-02-13T14:00:00Z'), type: 'hr',        interviewers: ['Elena Vasquez'],            status: 'completed', notes: 'Excellent fit. Offer approved.' },
    { id: 'seed-iv-11', candidateId: 'seed-cand-10', scheduledAt: new Date('2025-02-21T09:30:00Z'), type: 'technical', interviewers: ['David Kim'],                status: 'scheduled', notes: '' },
    { id: 'seed-iv-12', candidateId: 'seed-cand-3',  scheduledAt: new Date('2025-02-25T11:00:00Z'), type: 'technical', interviewers: ['James Okafor'],             status: 'scheduled', notes: '' },
  ];
  for (const iv of interviewData) {
    await prisma.interview.upsert({
      where: { id: iv.id },
      update: {},
      create: { id: iv.id, candidateId: iv.candidateId, scheduledAt: iv.scheduledAt, type: iv.type, interviewers: iv.interviewers, status: iv.status as any, notes: iv.notes },
    });
  }
  console.log('  Interviews seeded');

  console.log('\nSeed complete!');
  console.log('\nDemo login credentials:');
  users.forEach(u => console.log(`  ${u.role.padEnd(16)} -> ${u.email}  /  ${u.password}`));
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
