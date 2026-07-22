// ─── Role & Permission Types ──────────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "frontend-dev"
  | "backend-dev"
  | "qa"
  | "marketing"
  | "hr"
  | "product-manager"
  | "sales"
  | "finance";

export type PermissionTier = "view" | "edit" | "approve" | "admin";

export interface Permission {
  resource: string;
  tier: PermissionTier;
  scope?: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
  title: string;
  startDate: string;
  status: "active" | "inactive" | "on-leave";
  permissions: Permission[];
  managerId?: string;
  teamId?: string;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  badge?: number | string;
  children?: NavItem[];
  roles?: UserRole[];
  isNew?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: "blue" | "violet" | "emerald" | "amber" | "red";
  sparkline?: number[];
}

export interface ActivityItem {
  id: string;
  user: Pick<User, "id" | "name" | "avatar" | "role">;
  action: string;
  target: string;
  timestamp: string;
  type: "commit" | "deploy" | "bug" | "task" | "leave" | "review" | "campaign" | "general";
}

// ─── Project & Task Types ─────────────────────────────────────────────────────

export type TaskStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done" | "blocked" | "overdue";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Pick<User, "id" | "name" | "avatar">;
  reporter: Pick<User, "id" | "name" | "avatar">;
  assignedById?: string;
  assignedDate?: string;
  projectId: string;
  project?: Pick<Project, "id" | "name" | "color">;
  sprintId?: string;
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  notes?: string;
  linkedPR?: string;
  isOverdue?: boolean;
  daysRemaining?: number | null;
  extensionRequests?: DeadlineExtensionRequest[];
  createdAt: string;
  updatedAt: string;
}

export type ExtensionStatus = "pending" | "approved" | "rejected";

export interface DeadlineExtensionRequest {
  id: string;
  taskId: string;
  requestedById: string;
  reason: string;
  requestedDueDate: string;
  comments?: string;
  status: ExtensionStatus;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  task?: Pick<Task, "id" | "title" | "dueDate"> & { assignee?: Pick<User, "id" | "name" | "avatar"> };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "on-hold" | "completed" | "archived";
  progress: number;
  startDate: string;
  endDate?: string;
  teamIds: string[];
  ownerId: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "completed";
  goal?: string;
  velocity?: number;
}

// ─── Employee Types ───────────────────────────────────────────────────────────

export interface Employee extends User {
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  emergencyContact?: { name: string; phone: string; relation: string };
  compensation?: { salary: number; currency: string; lastReview: string };
  documents: Document[];
  leaveBalance: LeaveBalance;
}

export interface LeaveBalance {
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  casual: { total: number; used: number; remaining: number };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "casual" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approverId?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  size: string;
}

// ─── Work Update Types ────────────────────────────────────────────────────────

export interface WorkUpdate {
  id: string;
  employeeId: string;
  employeeName: string;
  role: UserRole;
  date: string;
  tasks: WorkUpdateTask[];
  blockers?: string;
  planForTomorrow?: string;
  totalHours: number;
  submittedAt?: string;
}

export interface WorkUpdateTask {
  id: string;
  title: string;
  ticketRef?: string;
  status: "not-started" | "in-progress" | "completed" | "blocked";
  hours: number;
  notes?: string;
}

// ─── Marketing Types ──────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  channel: "email" | "social" | "paid" | "content" | "seo";
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
}

// ─── QA Types ─────────────────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  title: string;
  feature: string;
  status: "pass" | "fail" | "pending" | "skipped";
  priority: TaskPriority;
  assignee?: string;
  lastRun?: string;
  steps: string[];
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved" | "closed" | "wont-fix";
  assignee?: Pick<User, "id" | "name" | "avatar">;
  reporter: string;
  linkedPR?: string;
  linkedTicket?: string;
  createdAt: string;
  resolvedAt?: string;
  environment: "production" | "staging" | "development";
}

// ─── Notification Types ───────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
  actor?: Pick<User, "id" | "name" | "avatar" | "role">;
}

// ─── Chart Types ──────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

// ─── Recruitment Types ────────────────────────────────────────────────────────

export type JobStatus = "open" | "closed" | "on_hold";
export type CandidateStatus =
  | "applied"
  | "screening"
  | "technical_interview"
  | "hr_interview"
  | "selected"
  | "rejected";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  description?: string;
  requirements?: string;
  location?: string;
  type: string;
  status: JobStatus;
  createdById: string;
  createdAt: string;
  _count?: { candidates: number };
}

export type CandidateGender = 'male' | 'female' | 'other';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  appliedPosition: string;
  jobOpeningId?: string;
  status: CandidateStatus;
  gender?: CandidateGender;
  expectedSalary?: number;
  currentCompany?: string;
  noticePeriod?: number;
  notes?: string;
  convertedUserId?: string;
  offerSent?: boolean;
  offerAccepted?: boolean;
  onboardingComplete?: boolean;
  createdAt: string;
  jobOpening?: Pick<JobOpening, "id" | "title">;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  type: string;
  interviewers: string[];
  status: InterviewStatus;
  notes?: string;
  candidate?: Pick<Candidate, "id" | "name" | "appliedPosition">;
}

export interface RecruitmentStats {
  openPositions: number;
  totalCandidates: number;
  scheduledInterviews: number;
  hired: number;
  avgTimeToHire?: number;
  offerAcceptanceRate?: number;
  rejectionRate?: number;
  avgExperience?: number;
  maleCount?: number;
  femaleCount?: number;
  otherCount?: number;
}

// ─── Finance Types ───────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'received' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'cash' | 'cheque' | 'bank_transfer' | 'card';
export type ExpenseCategory = 'office' | 'rent' | 'electricity' | 'internet' | 'marketing' | 'travel' | 'software' | 'hardware' | 'salary' | 'equipment' | 'miscellaneous';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type PayrollStatus = 'pending' | 'paid';
export type BudgetStatus = 'active' | 'inactive' | 'completed';

export interface FinanceClient {
  id: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id?: string;
  item: string;
  description?: string;
  qty: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: FinanceClient;
  project?: string;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  invoice?: Pick<Invoice, 'id' | 'invoiceNumber' | 'grandTotal'> & { client?: Pick<FinanceClient, 'id' | 'companyName'> };
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  vendor?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  expenseDate: string;
  status: ExpenseStatus;
  notes?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee?: Pick<User, 'id' | 'name' | 'avatar' | 'department'> & { title?: string };
  month: string;
  basicSalary: number;
  bonus: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate?: string;
  status: PayrollStatus;
  createdAt: string;
}

export interface Budget {
  id: string;
  department: string;
  allocated: number;
  used: number;
  remaining: number;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  createdAt: string;
}

export interface FinanceDashboardData {
  currentBalance: number;
  revenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoiceAmount: number;
  pendingInvoiceCount: number;
  monthlyPayroll: number;
  activeBudgets: number;
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  recentExpenses: Expense[];
  recentPayroll: PayrollRecord[];
}

export interface MonthlyAnalytics {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinanceReportSummary {
  revenue: { total: number; count: number };
  expenses: { total: number; count: number };
  payroll: { total: number; count: number };
  profit: number;
  budgets: Budget[];
  monthly: MonthlyAnalytics[];
}
