import {
  Bug, CheckSquare, ShieldCheck, AlertTriangle, Clock,
  ArrowRight, Plus, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BarChartComponent } from "@/components/charts/Charts";
import { mockBugs, mockTestCases } from "@/data/projects";
import { bugTrendData } from "@/data/analytics";
import { useTasks } from "@/hooks";
import { TASK_STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from "@/constants";
import { cn, formatRelativeTime } from "@/utils";
import { UpcomingEventsCard } from "@/components/ui/UpcomingEventsCard";
import { TodayEventBanner } from "@/components/ui/TodayEventBanner";
import { useTodayHoliday } from "@/hooks";
import type { KPICard as KPICardType } from "@/types";

const kpiCards: KPICardType[] = [
  { id: "k1", title: "Open Bugs", value: 7, change: -22, changeLabel: "vs last week", trend: "down", icon: "bugs", color: "red", sparkline: [14, 12, 10, 9, 8, 7] },
  { id: "k2", title: "Test Pass Rate", value: "87%", change: 4, changeLabel: "vs last run", trend: "up", icon: "pass", color: "emerald", sparkline: [78, 80, 82, 84, 85, 87] },
  { id: "k3", title: "Test Cases", value: 142, change: 8, changeLabel: "added this sprint", trend: "up", icon: "cases", color: "blue", sparkline: [120, 125, 130, 134, 138, 142] },
  { id: "k4", title: "Release Ready", value: "No", change: 0, changeLabel: "2 blockers", trend: "neutral", icon: "release", color: "amber" },
];

const kpiIcons = [
  <Bug className="size-5" />,
  <CheckSquare className="size-5" />,
  <ShieldCheck className="size-5" />,
  <AlertTriangle className="size-5" />,
];

const statusIcon = {
  pass: <CheckCircle2 className="size-4 text-emerald-500" />,
  fail: <XCircle className="size-4 text-red-500" />,
  pending: <Loader2 className="size-4 text-amber-500 animate-spin" />,
  skipped: <Clock className="size-4 text-muted-foreground" />,
};

const checklist = [
  { label: "All critical tests passing", done: false, blocker: true },
  { label: "No critical/high open bugs", done: false, blocker: true },
  { label: "Regression suite complete", done: true },
  { label: "Performance benchmarks met", done: true },
  { label: "Security scan clean", done: true },
  { label: "Staging deploy verified", done: true },
  { label: "Rollback plan documented", done: true },
  { label: "QA sign-off", done: false },
];

export function QADashboard() {
  const { data: tasksData } = useTasks({ limit: 50 });
  const allTasks = tasksData?.data ?? [];
  const overdueTasks = allTasks.filter((t: any) => t.status === 'overdue' || t.isOverdue);
  const openBugs = mockBugs.filter((b) => b.status === "open" || b.status === "in-progress");
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">Quality Assurance</span>
            <Badge variant="danger" dot>2 Blockers</Badge>
          </div>
          <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight leading-tight">QA Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sprint 12 release readiness · {doneCount}/{checklist.length} checks passed
            {overdueTasks.length > 0 && <> · <span className="text-red-500 font-semibold">{overdueTasks.length} overdue</span></>}
          </p>
        </div>
        <Button size="md">
          <Plus className="size-4" strokeWidth={2.5} /> File Bug
        </Button>
      </motion.div>

      {/* Today's Holiday / Company Event Banner */}
      <TodayEventBanner />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Upcoming Events — synced from Calendar */}
      <UpcomingEventsCard />

      {/* Release Readiness */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Release Readiness — Sprint 12</CardTitle>
            <CardDescription>Go / No-Go checklist · {doneCount} of {checklist.length} complete</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{Math.round((doneCount / checklist.length) * 100)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {checklist.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-150",
                  item.done
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                    : item.blocker
                    ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
                    : "border-border bg-muted/20"
                )}
              >
                <div className={cn("flex size-5 items-center justify-center rounded shrink-0", {
                  "bg-emerald-100 dark:bg-emerald-900/40": item.done,
                  "bg-red-100 dark:bg-red-900/40": item.blocker && !item.done,
                  "bg-muted": !item.done && !item.blocker,
                })}>
                  {item.done ? (
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  ) : item.blocker ? (
                    <XCircle className="size-3 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="size-3 text-muted-foreground" />
                  )}
                </div>
                <span className={cn("text-xs font-medium leading-snug", {
                  "text-emerald-700 dark:text-emerald-400": item.done,
                  "text-red-700 dark:text-red-400": item.blocker && !item.done,
                  "text-muted-foreground": !item.done && !item.blocker,
                })}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bug Trend + Test Cases */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Bug Trend</CardTitle>
              <CardDescription>Opened vs closed — last 6 weeks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={bugTrendData}
              series={[
                { key: "opened", label: "Opened", color: "#ef4444" },
                { key: "closed", label: "Closed", color: "#10b981" },
              ]}
              height={210}
            />
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Latest run results</CardDescription>
            </div>
            <Link to="/qa">
              <Button variant="ghost" size="icon-xs"><ArrowRight className="size-3.5" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTestCases.map((tc, i) => (
                <motion.div
                  key={tc.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong transition-all duration-150 cursor-pointer"
                >
                  {statusIcon[tc.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{tc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tc.feature}</p>
                  </div>
                  <Badge variant={tc.priority === "critical" ? "danger" : tc.priority === "high" ? "warning" : "muted"}>
                    {tc.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Bugs */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Open Bugs</CardTitle>
            <CardDescription>{openBugs.length} issues need attention</CardDescription>
          </div>
          <Link to="/qa">
            <Button variant="outline" size="sm">View All <ArrowRight className="size-3.5" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {openBugs.map((bug, i) => (
              <motion.div
                key={bug.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong transition-all duration-150 cursor-pointer group"
              >
                <div className={cn("flex size-7 items-center justify-center rounded-md shrink-0", {
                  "bg-red-50 dark:bg-red-950/30": bug.severity === "critical",
                  "bg-orange-50 dark:bg-orange-950/30": bug.severity === "high",
                  "bg-amber-50 dark:bg-amber-950/30": bug.severity === "medium",
                })}>
                  <AlertTriangle className={cn("size-3.5", {
                    "text-red-500": bug.severity === "critical",
                    "text-orange-500": bug.severity === "high",
                    "text-amber-500": bug.severity === "medium",
                  })} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground group-hover:text-indigo-600 transition-colors">{bug.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{bug.environment} · {formatRelativeTime(bug.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={cn(SEVERITY_COLORS[bug.severity])}>{bug.severity}</Badge>
                  {bug.assignee && (
                    <span className="text-xs text-muted-foreground">{bug.assignee.name.split(" ")[0]}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
