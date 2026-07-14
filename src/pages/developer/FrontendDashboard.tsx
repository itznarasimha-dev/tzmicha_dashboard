import {
  GitPullRequest, Bug, Zap, CheckCircle2, Clock,
  AlertCircle, ArrowRight, Plus, GitBranch, Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { BarChartComponent } from "@/components/charts/Charts";
import { mockTasks, mockBugs } from "@/data/projects";
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from "@/constants";
import { cn, formatRelativeTime } from "@/utils";
import type { KPICard as KPICardType } from "@/types";

const kpiCards: KPICardType[] = [
  { id: "k1", title: "My Open Tasks", value: 8, change: -2, changeLabel: "vs last week", trend: "down", icon: "tasks", color: "blue", sparkline: [12, 11, 10, 9, 10, 8] },
  { id: "k2", title: "PRs Open", value: 3, change: 0, changeLabel: "no change", trend: "neutral", icon: "prs", color: "violet", sparkline: [2, 4, 3, 5, 3, 3] },
  { id: "k3", title: "Bugs Assigned", value: 2, change: -50, changeLabel: "vs last week", trend: "down", icon: "bugs", color: "amber", sparkline: [5, 4, 4, 3, 2, 2] },
  { id: "k4", title: "Sprint Progress", value: "68%", change: 15, changeLabel: "vs sprint start", trend: "up", icon: "sprint", color: "emerald", sparkline: [20, 35, 45, 55, 60, 68] },
];

const kpiIcons = [
  <CheckCircle2 className="size-5" />,
  <GitPullRequest className="size-5" />,
  <Bug className="size-5" />,
  <Zap className="size-5" />,
];

const performanceData = [
  { label: "Mon", tasks: 3, hours: 7.5 },
  { label: "Tue", tasks: 4, hours: 8.2 },
  { label: "Wed", tasks: 2, hours: 6.8 },
  { label: "Thu", tasks: 5, hours: 9.1 },
  { label: "Fri", tasks: 3, hours: 7.9 },
];

const ciRuns = [
  { branch: "main", status: "passed", time: "2m 14s", ago: "12 min ago" },
  { branch: "feat/dashboard-v2", status: "passed", time: "3m 42s", ago: "1 hour ago" },
  { branch: "fix/safari-crash", status: "running", time: "—", ago: "just now" },
  { branch: "feat/dark-mode", status: "failed", time: "1m 08s", ago: "3 hours ago" },
];

const statusDot: Record<string, string> = {
  passed: "bg-emerald-500",
  running: "bg-amber-500 animate-pulse",
  failed: "bg-red-500",
};
const statusText: Record<string, string> = {
  passed: "text-emerald-600 dark:text-emerald-400",
  running: "text-amber-600 dark:text-amber-400",
  failed: "text-red-600 dark:text-red-400",
};

export function FrontendDashboard() {
  const myTasks = mockTasks.filter((t) => t.assignee?.id === "u2");
  const myBugs = mockBugs.filter((b) => b.assignee?.id === "u2");

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
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">Developer Workspace</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
              <Flame className="size-3 text-amber-500" />
              Sprint 12 · 3 days left
            </span>
          </div>
          <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight leading-tight">My Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Feb 19 – Mar 1 · 8 tasks assigned · 2 bugs open</p>
        </div>
        <Button size="md">
          <Plus className="size-4" strokeWidth={2.5} /> New Task
        </Button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Tasks + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader>
            <div>
              <CardTitle>My Tasks — Sprint 12</CardTitle>
              <CardDescription>{myTasks.length} tasks assigned to you</CardDescription>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="icon-xs"><ArrowRight className="size-3.5" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {myTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong hover:bg-muted/30 transition-all duration-150 cursor-pointer group"
                >
                  <div className={cn("size-2 rounded-full shrink-0", {
                    "bg-emerald-500": task.status === "done",
                    "bg-amber-500": task.status === "in-progress",
                    "bg-violet-500": task.status === "in-review",
                    "bg-blue-500": task.status === "todo",
                    "bg-red-500": task.status === "blocked",
                    "bg-muted-foreground/40": task.status === "backlog",
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate group-hover:text-indigo-600 transition-colors">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {task.labels.map((l) => (
                        <span key={l} className="text-2xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn("text-2xs", TASK_STATUS_COLORS[task.status])}>
                      {task.status.replace("-", " ")}
                    </Badge>
                    <span className={cn("text-xs font-semibold", PRIORITY_COLORS[task.priority])}>
                      {task.priority}
                    </span>
                    {task.assignee && <Avatar name={task.assignee.name} size="xs" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Tasks completed & hours logged</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={performanceData}
              series={[
                { key: "tasks", label: "Tasks", color: "#6366f1" },
                { key: "hours", label: "Hours", color: "#8b5cf6" },
              ]}
              height={210}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bugs + CI */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Bugs Assigned to Me</CardTitle>
              <CardDescription>{myBugs.length} open issues</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {myBugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 mb-3">
                  <CheckCircle2 className="size-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">All clear</p>
                <p className="text-xs text-muted-foreground mt-1">No bugs assigned to you right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myBugs.map((bug) => (
                  <div key={bug.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border-strong transition-all duration-150">
                    <div className={cn("flex size-7 items-center justify-center rounded-md shrink-0 mt-0.5", {
                      "bg-red-50 dark:bg-red-950/30": bug.severity === "critical",
                      "bg-orange-50 dark:bg-orange-950/30": bug.severity === "high",
                      "bg-amber-50 dark:bg-amber-950/30": bug.severity === "medium",
                    })}>
                      <AlertCircle className={cn("size-3.5", {
                        "text-red-500": bug.severity === "critical",
                        "text-orange-500": bug.severity === "high",
                        "text-amber-500": bug.severity === "medium",
                      })} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{bug.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(bug.createdAt)}</p>
                    </div>
                    <Badge variant={bug.severity === "critical" ? "danger" : bug.severity === "high" ? "warning" : "muted"}>
                      {bug.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>CI/CD Pipeline</CardTitle>
              <CardDescription>Latest build runs</CardDescription>
            </div>
            <Badge variant="success" dot>Live</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ciRuns.map((run, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong transition-all duration-150 cursor-pointer"
                >
                  <div className={cn("size-2 rounded-full shrink-0", statusDot[run.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="size-3 text-muted-foreground shrink-0" />
                      <p className="text-[13px] font-mono font-medium text-foreground truncate">{run.branch}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{run.ago}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xs font-semibold", statusText[run.status])}>{run.status}</p>
                    <p className="text-xs text-muted-foreground">{run.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
