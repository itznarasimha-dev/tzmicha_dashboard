import { motion } from "framer-motion";
import { Plus, MoreHorizontal, AlertCircle, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockTasks } from "@/data/projects";
import { PRIORITY_COLORS } from "@/constants";
import { cn } from "@/utils";
import type { Task, TaskStatus } from "@/types";

const columns: { id: TaskStatus; label: string; dot: string }[] = [
  { id: "backlog", label: "Backlog", dot: "bg-muted-foreground/40" },
  { id: "todo", label: "To Do", dot: "bg-blue-500" },
  { id: "in-progress", label: "In Progress", dot: "bg-amber-500" },
  { id: "in-review", label: "In Review", dot: "bg-violet-500" },
  { id: "done", label: "Done", dot: "bg-emerald-500" },
  { id: "blocked", label: "Blocked", dot: "bg-red-500" },
];

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-border bg-card p-3 shadow-card hover:shadow-elevated hover:border-border-strong transition-all duration-150 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[13px] font-medium text-foreground leading-snug flex-1">{task.title}</p>
        <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 shrink-0 -mt-0.5 -mr-1">
          <MoreHorizontal className="size-3.5" />
        </Button>
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.map((l) => (
            <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground font-medium">{l}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.priority === "critical" && <AlertCircle className="size-3.5 text-red-500" />}
          <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.estimatedHours && (
            <span className="flex items-center gap-1 text-2xs text-muted-foreground">
              <Timer className="size-3" />{task.estimatedHours}h
            </span>
          )}
          {task.assignee && (
            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SprintBoardPage() {
  const grouped = columns.reduce((acc, col) => {
    acc[col.id] = mockTasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const doneCount = grouped["done"]?.length ?? 0;
  const progress = Math.round((doneCount / mockTasks.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprint Board"
        description="Sprint 12 · Feb 19 – Mar 1 · 8 tasks"
        breadcrumbs={[{ label: "Work" }, { label: "Sprint Board" }]}
        actions={
          <Button size="md">
            <Plus className="size-4" strokeWidth={2.5} /> Add Task
          </Button>
        }
      />

      {/* Sprint summary */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border border-border bg-card shadow-card">
        {[
          { label: "Total", value: mockTasks.length, color: "text-foreground" },
          { label: "Done", value: doneCount, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "In Progress", value: grouped["in-progress"]?.length ?? 0, color: "text-amber-600 dark:text-amber-400" },
          { label: "Blocked", value: grouped["blocked"]?.length ?? 0, color: "text-red-600 dark:text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className={cn("text-xl font-bold", stat.color)}>{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
        <div className="w-full sm:w-auto sm:ml-auto flex-1 max-w-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Sprint progress</span>
            <span className="text-xs font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {columns.map((col) => {
          const tasks = grouped[col.id] ?? [];
          return (
            <div key={col.id} className="flex flex-col gap-2 min-w-[252px] w-[252px] shrink-0">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <span className="text-[13px] font-semibold text-foreground">{col.label}</span>
                  <span className="flex size-4 items-center justify-center rounded bg-muted text-2xs font-bold text-muted-foreground">
                    {tasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon-xs">
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 min-h-[160px] rounded-lg p-2 border border-dashed border-border bg-muted/20">
                {tasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} />
                ))}
                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-16">
                    <p className="text-xs text-muted-foreground/40">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
