import type { UserRole } from "@/types";

export const APP_NAME = "TZMicha";
export const APP_VERSION = "1.0.0";

// Supports both hyphen (frontend type) and underscore (DB/backend) formats
export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  "frontend-dev": "Frontend Developer",
  frontend_dev: "Frontend Developer",
  "backend-dev": "Backend Developer",
  backend_dev: "Backend Developer",
  qa: "QA Engineer",
  marketing: "Marketing",
  hr: "Human Resources",
  "product-manager": "Product Manager",
  product_manager: "Product Manager",
  sales: "Sales & CS",
  finance: "Finance",
};

export const ROLE_COLORS: Record<string, string> = {
  admin:            "bg-[#E6F7F7] text-[#0EA5A4]",
  "frontend-dev":   "bg-[#CCFBF1] text-[#0F766E]",
  frontend_dev:     "bg-[#CCFBF1] text-[#0F766E]",
  "backend-dev":    "bg-[#F0FDFA] text-[#0D9488]",
  backend_dev:      "bg-[#F0FDFA] text-[#0D9488]",
  qa:               "bg-[#FFFBEB] text-[#D97706]",
  marketing:        "bg-[#ECFEFF] text-[#0891B2]",
  hr:               "bg-[#DCFCE7] text-[#16A34A]",
  "product-manager":"bg-[#E6F7F7] text-[#0EA5A4]",
  product_manager:  "bg-[#E6F7F7] text-[#0EA5A4]",
  sales:            "bg-[#FFF7ED] text-[#EA580C]",
  finance:          "bg-[#DCFCE7] text-[#059669]",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  "in-progress": "In Progress",
  in_review: "In Review",
  "in-review": "In Review",
  done: "Done",
  blocked: "Blocked",
  overdue: "Overdue",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  backlog:      "bg-[#F1F5F9] text-[#64748B]",
  todo:         "bg-[#E6F7F7] text-[#0EA5A4]",
  in_progress:  "bg-[#FFFBEB] text-[#D97706]",
  "in-progress":"bg-[#FFFBEB] text-[#D97706]",
  in_review:    "bg-[#CCFBF1] text-[#0F766E]",
  "in-review":  "bg-[#CCFBF1] text-[#0F766E]",
  done:         "bg-[#DCFCE7] text-[#16A34A]",
  blocked:      "bg-[#FEF2F2] text-[#EF4444]",
  overdue:      "bg-[#FEF2F2] text-[#DC2626]",
};

export const PRIORITY_COLORS = {
  critical: "text-[#EF4444]",
  high:     "text-[#F59E0B]",
  medium:   "text-[#4F7CFF]",
  low:      "text-[#16C47F]",
};

export const SEVERITY_COLORS = {
  critical: "bg-[#FEF2F2] text-[#EF4444]",
  high:     "bg-[#FFFBEB] text-[#D97706]",
  medium:   "bg-[#E6F7F7] text-[#0EA5A4]",
  low:      "bg-[#DCFCE7] text-[#16A34A]",
};

export const CHART_COLORS = {
  primary:   "#0EA5A4",
  secondary: "#14B8A6",
  success:   "#22C55E",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  cyan:      "#06B6D4",
  purple:    "#8B5CF6",
  blue:      "#3B82F6",
  indigo:    "#6366F1",
  emerald:   "#10B981",
  amber:     "#F59E0B",
  red:       "#EF4444",
  pink:      "#EC4899",
  orange:    "#F97316",
};

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 60;
