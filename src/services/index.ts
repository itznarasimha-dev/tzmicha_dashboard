import { api } from './api';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data.data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me').then(r => r.data.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, any>) =>
    api.get('/users', { params }).then(r => r.data),
  getById: (id: string) =>
    api.get(`/users/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/users', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/users/${id}`, data).then(r => r.data.data),
  changePassword: (id: string, currentPassword: string, newPassword: string) =>
    api.patch(`/users/${id}/password`, { currentPassword, newPassword }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/projects', { params }).then(r => r.data),
  getById: (id: string) =>
    api.get(`/projects/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/projects', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/projects/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: Record<string, any>) =>
    api.get('/tasks', { params }).then(r => r.data),
  getById: (id: string) =>
    api.get(`/tasks/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/tasks', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/tasks/${id}`, data).then(r => r.data.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }).then(r => r.data.data),
  approve: (id: string) =>
    api.patch(`/tasks/${id}/approve`).then(r => r.data.data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  requestExtension: (id: string, data: Record<string, any>) =>
    api.post(`/tasks/${id}/request-extension`, data).then(r => r.data.data),
  getExtensions: (params?: Record<string, any>) =>
    api.get('/tasks/extensions', { params }).then(r => r.data.data),
  reviewExtension: (id: string, action: 'approved' | 'rejected') =>
    api.patch(`/tasks/extensions/${id}/review`, { action }).then(r => r.data.data),
  runOverdueCheck: () =>
    api.post('/tasks/overdue-check').then(r => r.data.data),
};

// ── Sprints ───────────────────────────────────────────────────────────────────
export const sprintsApi = {
  list: (projectId?: string) =>
    api.get('/sprints', { params: projectId ? { projectId } : {} }).then(r => r.data.data),
  getById: (id: string) =>
    api.get(`/sprints/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/sprints', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/sprints/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/sprints/${id}`),
};

// ── Work Updates ──────────────────────────────────────────────────────────────
export const workUpdatesApi = {
  list: (params?: Record<string, any>) =>
    api.get('/work-updates', { params }).then(r => r.data),
  getById: (id: string) =>
    api.get(`/work-updates/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/work-updates', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/work-updates/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/work-updates/${id}`),
};

// ── Leave ─────────────────────────────────────────────────────────────────────
export const leaveApi = {
  list: (params?: Record<string, any>) =>
    api.get('/leave', { params }).then(r => r.data),
  create: (data: Record<string, any>) =>
    api.post('/leave', data).then(r => r.data.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/leave/${id}/status`, { status }).then(r => r.data.data),
  myBalance: () =>
    api.get('/leave/balance/me').then(r => r.data.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  list: (params?: Record<string, any>) =>
    api.get('/attendance', { params }).then(r => r.data),
  upsert: (data: Record<string, any>) =>
    api.post('/attendance', data).then(r => r.data.data),
};

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaignsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/campaigns', { params }).then(r => r.data),
  stats: () => api.get('/campaigns/stats').then(r => r.data.data),
  getById: (id: string) =>
    api.get(`/campaigns/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/campaigns', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/campaigns/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
};

// ── Deals ─────────────────────────────────────────────────────────────────────
export const dealsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/deals', { params }).then(r => r.data),
  stats: () => api.get('/deals/stats').then(r => r.data.data),
  getById: (id: string) =>
    api.get(`/deals/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/deals', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/deals/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/deals/${id}`),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapApi = {
  list: (params?: Record<string, any>) =>
    api.get('/roadmap', { params }).then(r => r.data.data),
  getById: (id: string) =>
    api.get(`/roadmap/${id}`).then(r => r.data.data),
  create: (data: Record<string, any>) =>
    api.post('/roadmap', data).then(r => r.data.data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/roadmap/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/roadmap/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/notifications', { params }).then(r => r.data),
  unreadCount: () =>
    api.get('/notifications/unread-count').then(r => r.data.data.count),
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ── Calendar Events ──────────────────────────────────────────────────────────
export const calendarApi = {
  // Events
  listEvents: (params?: Record<string, any>) =>
    api.get('/calendar-events/events', { params }).then(r => r.data.data),
  createEvent: (data: Record<string, any>) =>
    api.post('/calendar-events/events', data).then(r => r.data.data),
  updateEvent: (id: string, data: Record<string, any>) =>
    api.patch(`/calendar-events/events/${id}`, data).then(r => r.data.data),
  deleteEvent: (id: string) =>
    api.delete(`/calendar-events/events/${id}`),
  // Holidays
  listHolidays: () =>
    api.get('/calendar-events/holidays').then(r => r.data.data),
  getTodayHoliday: () =>
    api.get('/calendar-events/holidays/today').then(r => r.data.data),
  createHoliday: (data: Record<string, any>) =>
    api.post('/calendar-events/holidays', data).then(r => r.data.data),
  updateHoliday: (id: string, data: Record<string, any>) =>
    api.patch(`/calendar-events/holidays/${id}`, data).then(r => r.data.data),
  deleteHoliday: (id: string) =>
    api.delete(`/calendar-events/holidays/${id}`),
  seedHolidays: () =>
    api.post('/calendar-events/holidays/seed'),
};

// ── Activity ──────────────────────────────────────────────────────────────────
export const activityApi = {
  list: (params?: Record<string, any>) =>
    api.get('/activity', { params }).then(r => r.data),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: () => api.get('/settings').then(r => r.data.data),
  upsert: (key: string, value: string) =>
    api.post('/settings', { key, value }),
  upsertMany: (settings: Record<string, string>) =>
    api.put('/settings', settings),
};

// ── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  getMessages: (params?: Record<string, any>) =>
    api.get('/chat', { params }).then(r => r.data.data),
  sendMessage: (text: string) =>
    api.post('/chat', { text }).then(r => r.data.data),
  poll: (afterTime: string) =>
    api.get('/chat/poll', { params: { afterTime } }).then(r => r.data.data),
  // DM
  getUnreadCounts: () =>
    api.get('/chat/unread').then(r => r.data.data as Record<string, number>),
  getDMHistory: (peerId: string) =>
    api.get(`/chat/dm/${peerId}`).then(r => r.data.data),
  sendDM: (peerId: string, text: string) =>
    api.post(`/chat/dm/${peerId}`, { text }).then(r => r.data.data),
  pollDM: (peerId: string, afterTime: string) =>
    api.get(`/chat/dm/${peerId}/poll`, { params: { afterTime } }).then(r => r.data.data),
};

// ── Finance ──────────────────────────────────────────────────────────────────
export const financeApi = {
  // Dashboard
  getDashboard: () =>
    api.get('/finance/dashboard').then(r => r.data.data),
  getMonthlyAnalytics: (year?: number) =>
    api.get('/finance/analytics/monthly', { params: { year } }).then(r => r.data.data),
  getExpenseBreakdown: () =>
    api.get('/finance/analytics/expenses').then(r => r.data.data),

  // Opening Balance
  getOpeningBalance: () =>
    api.get('/finance/opening-balance').then(r => r.data.data),
  setOpeningBalance: (amount: number) =>
    api.put('/finance/opening-balance', { amount }).then(r => r.data.data),

  // Clients
  listClients: (params?: Record<string, any>) =>
    api.get('/finance/clients', { params }).then(r => r.data.data),
  createClient: (data: Record<string, any>) =>
    api.post('/finance/clients', data).then(r => r.data.data),
  updateClient: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/clients/${id}`, data).then(r => r.data.data),
  deleteClient: (id: string) =>
    api.delete(`/finance/clients/${id}`),

  // Invoices
  listInvoices: (params?: Record<string, any>) =>
    api.get('/finance/invoices', { params }).then(r => r.data),
  getInvoice: (id: string) =>
    api.get(`/finance/invoices/${id}`).then(r => r.data.data),
  createInvoice: (data: Record<string, any>) =>
    api.post('/finance/invoices', data).then(r => r.data.data),
  updateInvoice: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/invoices/${id}`, data).then(r => r.data.data),
  deleteInvoice: (id: string) =>
    api.delete(`/finance/invoices/${id}`),
  duplicateInvoice: (id: string) =>
    api.post(`/finance/invoices/${id}/duplicate`).then(r => r.data.data),
  markInvoicePaid: (id: string) =>
    api.patch(`/finance/invoices/${id}/mark-paid`).then(r => r.data.data),

  // Payments
  listPayments: (params?: Record<string, any>) =>
    api.get('/finance/payments', { params }).then(r => r.data),
  createPayment: (data: Record<string, any>) =>
    api.post('/finance/payments', data).then(r => r.data.data),
  updatePayment: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/payments/${id}`, data).then(r => r.data.data),
  deletePayment: (id: string) =>
    api.delete(`/finance/payments/${id}`),

  // Expenses
  listExpenses: (params?: Record<string, any>) =>
    api.get('/finance/expenses', { params }).then(r => r.data),
  createExpense: (data: Record<string, any>) =>
    api.post('/finance/expenses', data).then(r => r.data.data),
  updateExpense: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/expenses/${id}`, data).then(r => r.data.data),
  deleteExpense: (id: string) =>
    api.delete(`/finance/expenses/${id}`),

  // Payroll
  listPayroll: (params?: Record<string, any>) =>
    api.get('/finance/payroll', { params }).then(r => r.data),
  createPayroll: (data: Record<string, any>) =>
    api.post('/finance/payroll', data).then(r => r.data.data),
  updatePayroll: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/payroll/${id}`, data).then(r => r.data.data),
  deletePayroll: (id: string) =>
    api.delete(`/finance/payroll/${id}`),

  // Budgets
  listBudgets: (params?: Record<string, any>) =>
    api.get('/finance/budgets', { params }).then(r => r.data),
  createBudget: (data: Record<string, any>) =>
    api.post('/finance/budgets', data).then(r => r.data.data),
  updateBudget: (id: string, data: Record<string, any>) =>
    api.patch(`/finance/budgets/${id}`, data).then(r => r.data.data),
  deleteBudget: (id: string) =>
    api.delete(`/finance/budgets/${id}`),

  // Reports
  getReports: (params?: Record<string, any>) =>
    api.get('/finance/reports', { params }).then(r => r.data.data),
};

// ── Recruitment ───────────────────────────────────────────────────────────────
export const recruitmentApi = {
  stats: () => api.get('/recruitment/stats').then(r => r.data.data),

  listJobs: (params?: Record<string, any>) =>
    api.get('/recruitment/jobs', { params }).then(r => r.data),
  getJob: (id: string) =>
    api.get(`/recruitment/jobs/${id}`).then(r => r.data.data),
  createJob: (data: Record<string, any>) =>
    api.post('/recruitment/jobs', data).then(r => r.data.data),
  updateJob: (id: string, data: Record<string, any>) =>
    api.patch(`/recruitment/jobs/${id}`, data).then(r => r.data.data),
  deleteJob: (id: string) => api.delete(`/recruitment/jobs/${id}`),

  listCandidates: (params?: Record<string, any>) =>
    api.get('/recruitment/candidates', { params }).then(r => r.data),
  getCandidate: (id: string) =>
    api.get(`/recruitment/candidates/${id}`).then(r => r.data.data),
  createCandidate: (data: Record<string, any>) =>
    api.post('/recruitment/candidates', data).then(r => r.data.data),
  updateCandidate: (id: string, data: Record<string, any>) =>
    api.patch(`/recruitment/candidates/${id}`, data).then(r => r.data.data),
  updateCandidateStatus: (id: string, status: string) =>
    api.patch(`/recruitment/candidates/${id}/status`, { status }).then(r => r.data.data),
  deleteCandidate: (id: string) => api.delete(`/recruitment/candidates/${id}`),
  convertToEmployee: (id: string, data: Record<string, any>) =>
    api.post(`/recruitment/candidates/${id}/convert`, data).then(r => r.data.data),

  listInterviews: (params?: Record<string, any>) =>
    api.get('/recruitment/interviews', { params }).then(r => r.data),
  createInterview: (data: Record<string, any>) =>
    api.post('/recruitment/interviews', data).then(r => r.data.data),
  updateInterview: (id: string, data: Record<string, any>) =>
    api.patch(`/recruitment/interviews/${id}`, data).then(r => r.data.data),
  deleteInterview: (id: string) => api.delete(`/recruitment/interviews/${id}`),
};
