import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Clock, AlertCircle, Circle, ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockWorkUpdates } from "@/data/users";
import { ROLE_LABELS } from "@/constants";
import { cn, formatDate } from "@/utils";

const statusConfig = {
  completed: { icon: <CheckCircle2 className="size-4 text-emerald-500" />, label: "Completed", color: "success" as const },
  "in-progress": { icon: <Clock className="size-4 text-amber-500" />, label: "In Progress", color: "warning" as const },
  blocked: { icon: <AlertCircle className="size-4 text-red-500" />, label: "Blocked", color: "danger" as const },
  "not-started": { icon: <Circle className="size-4 text-muted-foreground" />, label: "Not Started", color: "muted" as const },
};

export function WorkUpdatesPage() {
  const [selectedDate] = useState("2024-02-26");

  const todayUpdates = mockWorkUpdates.filter((u) => u.date === selectedDate);
  const submitted = todayUpdates.length;
  const total = 8;
  const totalHours = todayUpdates.reduce((s, u) => s + u.totalHours, 0);
  const blockerCount = todayUpdates.filter((u) => u.blockers).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Updates"
        description={`${formatDate(selectedDate)} · ${submitted}/${total} submitted`}
        breadcrumbs={[{ label: "Work" }, { label: "Work Updates" }]}
        actions={
          <Button size="md">
            <Plus className="size-4" strokeWidth={2.5} /> Log Update
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Submitted Today",
            value: `${submitted}/${total}`,
            sub: `${total - submitted} pending`,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            icon: <Users className="size-5 text-emerald-600 dark:text-emerald-400" />,
          },
          {
            label: "Total Hours Logged",
            value: `${totalHours}h`,
            sub: `avg ${(totalHours / submitted).toFixed(1)}h per person`,
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
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.06em]">{stat.label}</p>
                  <p className={cn("text-3xl font-bold mt-2 leading-none", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
                </div>
                <div className={cn("flex size-9 items-center justify-center rounded-lg", stat.bg)}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Updates */}
      <div className="space-y-4">
        {todayUpdates.map((update, i) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card padding="lg">
              <CardHeader className="flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={update.employeeName} size="md" showStatus status="active" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{update.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[update.role]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{update.totalHours}h</span>
                  <Badge variant="success" dot>Submitted</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 mb-4">
                  {update.tasks.map((task) => {
                    const config = statusConfig[task.status];
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
                          <span className="text-xs font-semibold text-muted-foreground">{task.hours}h</span>
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

        {todayUpdates.length === 0 && (
          <Card padding="xl" className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-4">
              <ClipboardList className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">No updates yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to log your work for today</p>
            <Button size="sm" className="mt-5">
              <Plus className="size-3.5" /> Log Update
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
