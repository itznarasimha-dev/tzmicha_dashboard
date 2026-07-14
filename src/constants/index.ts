import type { UserRole } from "@/types";

export const APP_NAME = "TZMicha";
export const APP_VERSION = "1.0.0";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  "frontend-dev": "Frontend Developer",
  "backend-dev": "Backend Developer",
  qa: "QA Engineer",
  marketing: "Marketing",
  hr: "Human Resources",
  "product-manager": "Product Manager",
  sales: "Sales & CS",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "frontend-dev": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "backend-dev": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  qa: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  hr: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "product-manager": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  sales: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const TASK_STATUS_LABELS = {
  backlog: "Backlog",
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  blocked: "Blocked",
};

export const TASK_STATUS_COLORS = {
  backlog: "bg-muted text-muted-foreground",
  todo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "in-review": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const PRIORITY_COLORS = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-600 dark:text-orange-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-emerald-600 dark:text-emerald-400",
};

export const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export const CHART_COLORS = {
  primary: "hsl(243, 75%, 59%)",
  secondary: "hsl(258, 90%, 66%)",
  success: "hsl(152, 69%, 36%)",
  warning: "hsl(35, 95%, 50%)",
  danger: "hsl(4, 86%, 58%)",
  muted: "hsl(220, 9%, 46%)",
  blue: "#6366f1",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  pink: "#ec4899",
  cyan: "#06b6d4",
  orange: "#f97316",
};

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 60;
