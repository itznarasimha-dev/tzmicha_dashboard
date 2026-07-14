// ─── Role & Permission Types ──────────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "frontend-dev"
  | "backend-dev"
  | "qa"
  | "marketing"
  | "hr"
  | "product-manager"
  | "sales";

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

export type TaskStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done" | "blocked";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Pick<User, "id" | "name" | "avatar">;
  reporter: Pick<User, "id" | "name" | "avatar">;
  projectId: string;
  sprintId?: string;
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  loggedHours?: number;
  linkedPR?: string;
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
