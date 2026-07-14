import type { Campaign, ActivityItem, Notification, ChartDataPoint } from "@/types";

export const mockCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "Q1 Product Launch",
    status: "active",
    channel: "email",
    budget: 15000,
    spent: 8200,
    startDate: "2024-02-01",
    endDate: "2024-03-31",
    impressions: 124500,
    clicks: 8930,
    conversions: 342,
    roi: 2.8,
  },
  {
    id: "c2",
    name: "Spring Social Campaign",
    status: "active",
    channel: "social",
    budget: 8000,
    spent: 3100,
    startDate: "2024-02-15",
    endDate: "2024-04-15",
    impressions: 89200,
    clicks: 4210,
    conversions: 128,
    roi: 1.9,
  },
  {
    id: "c3",
    name: "Google Ads — Brand",
    status: "active",
    channel: "paid",
    budget: 20000,
    spent: 12400,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    impressions: 340000,
    clicks: 18200,
    conversions: 890,
    roi: 3.4,
  },
  {
    id: "c4",
    name: "SEO Content Push",
    status: "completed",
    channel: "seo",
    budget: 5000,
    spent: 5000,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    impressions: 56000,
    clicks: 3400,
    conversions: 89,
    roi: 1.4,
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: "a1",
    user: { id: "u2", name: "Sarah Chen", avatar: undefined, role: "frontend-dev" },
    action: "merged PR",
    target: "#142 — Dashboard KPI components",
    timestamp: "2024-02-26T17:30:00Z",
    type: "commit",
  },
  {
    id: "a2",
    user: { id: "u4", name: "Priya Sharma", avatar: undefined, role: "qa" },
    action: "filed bug",
    target: "Login page crashes on Safari 16",
    timestamp: "2024-02-26T16:00:00Z",
    type: "bug",
  },
  {
    id: "a3",
    user: { id: "u3", name: "James Okafor", avatar: undefined, role: "backend-dev" },
    action: "deployed to staging",
    target: "v2.4.1-beta",
    timestamp: "2024-02-26T15:00:00Z",
    type: "deploy",
  },
  {
    id: "a4",
    user: { id: "u6", name: "Elena Vasquez", avatar: undefined, role: "hr" },
    action: "approved leave request",
    target: "Sarah Chen — 5 days annual leave",
    timestamp: "2024-02-26T14:00:00Z",
    type: "leave",
  },
  {
    id: "a5",
    user: { id: "u5", name: "Marcus Williams", avatar: undefined, role: "marketing" },
    action: "launched campaign",
    target: "Q1 Product Launch",
    timestamp: "2024-02-26T13:00:00Z",
    type: "campaign",
  },
  {
    id: "a6",
    user: { id: "u7", name: "David Kim", avatar: undefined, role: "product-manager" },
    action: "updated roadmap",
    target: "Q2 2024 — Analytics Engine",
    timestamp: "2024-02-26T11:00:00Z",
    type: "task",
  },
  {
    id: "a7",
    user: { id: "u1", name: "Alex Morgan", avatar: undefined, role: "admin" },
    action: "added user",
    target: "Aisha Patel — Sales Lead",
    timestamp: "2024-02-26T10:00:00Z",
    type: "general",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "PR Review Requested",
    message: "Sarah Chen requested your review on #148 — Design system button variants",
    type: "info",
    read: false,
    createdAt: "2024-02-26T17:00:00Z",
    link: "/projects/p1/tasks/tk2",
    actor: { id: "u2", name: "Sarah Chen", avatar: undefined, role: "frontend-dev" },
  },
  {
    id: "n2",
    title: "Critical Bug Filed",
    message: "Login page crashes on Safari 16 — assigned to you",
    type: "error",
    read: false,
    createdAt: "2024-02-26T16:00:00Z",
    link: "/qa/bugs/b1",
  },
  {
    id: "n3",
    title: "Leave Request Approved",
    message: "Your annual leave request (Feb 12–16) has been approved",
    type: "success",
    read: true,
    createdAt: "2024-02-26T14:00:00Z",
  },
  {
    id: "n4",
    title: "Sprint 12 Ending Soon",
    message: "Sprint 12 ends in 3 days. 4 tasks still in progress.",
    type: "warning",
    read: false,
    createdAt: "2024-02-26T09:00:00Z",
    link: "/projects/p1/sprint",
  },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────

export const velocityData: ChartDataPoint[] = [
  { label: "Sprint 7", value: 28 },
  { label: "Sprint 8", value: 34 },
  { label: "Sprint 9", value: 31 },
  { label: "Sprint 10", value: 40 },
  { label: "Sprint 11", value: 38 },
  { label: "Sprint 12", value: 42 },
];

export const trafficData: ChartDataPoint[] = [
  { label: "Jan", value: 42000, sessions: 38000, conversions: 1200 },
  { label: "Feb", value: 58000, sessions: 51000, conversions: 1800 },
  { label: "Mar", value: 51000, sessions: 46000, conversions: 1500 },
  { label: "Apr", value: 67000, sessions: 60000, conversions: 2100 },
  { label: "May", value: 74000, sessions: 68000, conversions: 2400 },
  { label: "Jun", value: 89000, sessions: 82000, conversions: 2900 },
  { label: "Jul", value: 95000, sessions: 88000, conversions: 3200 },
];

export const bugTrendData: (ChartDataPoint & { opened: number; closed: number })[] = [
  { label: "Week 1", value: 12, opened: 12, closed: 8 },
  { label: "Week 2", value: 8, opened: 8, closed: 14 },
  { label: "Week 3", value: 15, opened: 15, closed: 10 },
  { label: "Week 4", value: 6, opened: 6, closed: 12 },
  { label: "Week 5", value: 9, opened: 9, closed: 11 },
  { label: "Week 6", value: 4, opened: 4, closed: 9 },
];

export const teamProductivityData = [
  { label: "Mon", frontend: 8.2, backend: 7.8, qa: 6.5 },
  { label: "Tue", frontend: 7.5, backend: 8.4, qa: 7.2 },
  { label: "Wed", frontend: 9.1, backend: 7.2, qa: 8.0 },
  { label: "Thu", frontend: 6.8, backend: 9.0, qa: 7.5 },
  { label: "Fri", frontend: 7.9, backend: 8.1, qa: 6.8 },
];

export const channelData = [
  { name: "Organic Search", value: 38, color: "#6366f1" },
  { name: "Paid Ads", value: 28, color: "#8b5cf6" },
  { name: "Social Media", value: 18, color: "#10b981" },
  { name: "Email", value: 10, color: "#f59e0b" },
  { name: "Direct", value: 6, color: "#ef4444" },
];

export const revenueData: (ChartDataPoint & { mrr: number; arr: number })[] = [
  { label: "Jan", value: 42000, mrr: 42000, arr: 504000 },
  { label: "Feb", value: 48000, mrr: 48000, arr: 576000 },
  { label: "Mar", value: 52000, mrr: 52000, arr: 624000 },
  { label: "Apr", value: 58000, mrr: 58000, arr: 696000 },
  { label: "May", value: 63000, mrr: 63000, arr: 756000 },
  { label: "Jun", value: 71000, mrr: 71000, arr: 852000 },
];
