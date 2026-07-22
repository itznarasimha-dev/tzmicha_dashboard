import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Clock, AlertCircle, Circle, ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkUpdates, useTasks } from "@/hooks";
import { useAppStore } from "@/store/appStore";
import { ROLE_LABELS } from "@/constants";
import { cn, formatDate } from "@/utils";
import { LogWorkUpdateModal } from "@/components/forms/FormModals";
import type { UserRole } from "@/types";

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: "success" | "warning" | "danger" | "muted" }> = {
  completed:   { icon: <CheckCircle2 className="size-4 text-emerald-500" />, label: "Completed", color: "success" },
  in_progress: { icon: <Clock className="size-4 text-amber-500" />,         label: "In Progress", color: "warning" },
  blocked:     { icon: <AlertCircle className="size-4 text-red-500" />,     label: "Blocked",     color: "danger" },
  not_started: { icon: <Circle className="size-4 text-muted-foreground" />, label: "Not Started", color: "muted" },
  // legacy hyphen keys from mock data
  "in-progress": { icon: <Clock className="size-4 text-amber-500" />,      label: "In Progress", color: "warning" },
  "not-started": { icon: <Circle className="size-4 text-muted-foreground" />, label: "Not Started", color: "muted" },
};

export function WorkUpdatesPage() {
  const user = useAppStore(s => s.user);
  const [showLog, setShowLog] = useState(false);
  const { data, isLoading } = useWorkUpdates({ limit: 20 });
  const { data: myTasksData } = useTasks({ limit: 50, status: 'in_progress' });
  const updates = data?.data ?? [];
  const myTasks = (myTasksData?.data ?? []).map((t: any) => ({ title: t.title, ticketRef: t.id }));

  const totalHours = updates.reduce((s: number, u: any) => {
    const h = Number(u.totalHours);
    return s + (isFinite(h) && h < 24 ? h : 0);
  }, 0);
  const blockerCount = updates.filter((u: any) => u.blockers).length;
  const submitted = updates.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Updates"
        description={`${submitted} updates submitted`}
        breadcrumbs={[{ label: "Work" }, { label: "Work Updates" }]}
        actions={
          <>
            <Button size="md" onClick={() => setShowLog(true)}>
              <Plus className="size-4" strokeWidth={2.5} /> Log Update
            </Button>
            <LogWorkUpdateModal open={showLog} onClose={() => setShowLog(false)} prefillTasks={myTasks} />
          </>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Submitted",
            value: submitted.toString(),
            sub: "work updates",
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            icon: <Users className="size-5 text-emerald-600 dark:text-emerald-400" />,
          },
          {
            label: "Total Hours Logged",
            value: `${totalHours.toFixed(1)}h`,
            sub: submitted > 0 ? `avg ${(totalHours / submitted).toFixed(1)}h per person` : "no data",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            icon: <Clock className="size-5 text-blue-600 dark:text-blue-400" />,
          },
          {
            label: "Active Blockers",
            value: blockerCount.toString(),
            sub: blockerCount > 0 ? "needs attention" : "all clear",
            color: blockerCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
            bg: blockerCount > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-emerald-50 dark:bg-emerald-950/20",
            icon: <AlertCircle className={cn("size-5", blockerCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")} />,
          },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.06em]">{stat.label}</p>
                  <p className={cn("text-3xl font-bold mt-2 leading-none", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
                </div>
                <div className={cn("flex size-9 items-center justify-center rounded-lg", stat.bg)}>{stat.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Updates */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : updates.length === 0 ? (
        <Card padding="xl" className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-4">
            <ClipboardList className="size-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">No updates yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to log your work for today</p>
          <Button size="sm" className="mt-5" onClick={() => setShowLog(true)}>
            <Plus className="size-3.5" /> Log Update
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update: any, i: number) => (
            <motion.div key={update.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card padding="lg">
                <CardHeader className="flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={update.user?.name ?? 'User'} src={update.user?.avatar} size="md" showStatus status="active" />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{update.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.user?.role ? (ROLE_LABELS[update.user.role as UserRole] ?? update.user.role) : ''}
                        {update.date && ` · ${formatDate(update.date)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-sm font-bold text-foreground">{(() => { const h = Number(update.totalHours); return (isFinite(h) && h < 24) ? `${h}h` : '—'; })()}</span>
                    <Badge variant="success" dot>Submitted</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 mb-4">
                    {(update.tasks ?? []).map((task: any) => {
                      const config = statusConfig[task.status] ?? statusConfig.not_started;
                      return (
                        <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                          {config.icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-foreground font-medium">{task.title}</p>
                            {task.ticketRef && (
                              <span className="text-2xs text-muted-foreground font-mono bg-muted rounded px-1.5 py-0.5 mt-0.5 inline-block">{task.ticketRef}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <Badge variant={config.color}>{config.label}</Badge>
                            <span className="text-xs font-semibold text-muted-foreground">{(() => { const h = Number(task.hours); return (isFinite(h) && h < 24) ? `${h}h` : '—'; })()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {update.blockers && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/30 mb-3">
                      <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-0.5">Blocker</p>
                        <p className="text-xs text-red-600 dark:text-red-300">{update.blockers}</p>
                      </div>
                    </div>
                  )}

                  {update.planForTomorrow && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30">
                      <Clock className="size-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">Plan for Tomorrow</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">{update.planForTomorrow}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
