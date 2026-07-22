import { useState, useEffect } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, AlertCircle, Timer, Clock, CheckCircle2,
  MessageSquare, ShieldAlert, CalendarClock, Loader2, ListTodo,
  ChevronDown, ChevronUp, LayoutGrid, List, Flame, Ban, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Progress } from '@/components/ui/Progress';
import { Card } from '@/components/ui/Card';
import { useTasks, useUpdateTask, useUpdateTaskStatus, useRequestExtension, useApproveTask } from '@/hooks';
import { useAppStore } from '@/store/appStore';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { TaskStatus } from '@/types';
import { CreateTaskModal } from '@/components/forms/FormModals';

// ── Role helpers ──────────────────────────────────────────────────────────────
const MANAGER_ROLES = ['admin', 'hr', 'product_manager'];
const EMPLOYEE_ROLES = ['frontend_dev', 'backend_dev', 'qa', 'sales', 'marketing'];

function normalizeRole(role: string) {
  return role.replace(/-/g, '_');
}

function isRole(role: string, list: string[]) {
  const r = normalizeRole(role);
  return list.map(x => normalizeRole(x)).includes(r);
}

// ── Board columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',     dot: 'bg-slate-400',    bg: 'bg-slate-50/60 dark:bg-slate-900/20' },
  { id: 'todo',        label: 'To Do',       dot: 'bg-blue-500',     bg: 'bg-blue-50/50 dark:bg-blue-950/10' },
  { id: 'in_progress', label: 'In Progress', dot: 'bg-amber-500',    bg: 'bg-amber-50/50 dark:bg-amber-950/10' },
  { id: 'in_review',   label: 'In Review',   dot: 'bg-violet-500',   bg: 'bg-violet-50/50 dark:bg-violet-950/10' },
  { id: 'done',        label: 'Done',        dot: 'bg-emerald-500',  bg: 'bg-emerald-50/50 dark:bg-emerald-950/10' },
  { id: 'blocked',     label: 'Blocked',     dot: 'bg-red-500',      bg: 'bg-red-50/50 dark:bg-red-950/10' },
  { id: 'overdue',     label: 'Overdue',     dot: 'bg-rose-600',     bg: 'bg-rose-50/60 dark:bg-rose-950/20' },
];

const STATUS_OPTIONS_EMPLOYEE = ['todo', 'in_progress', 'in_review', 'blocked'] as const;
const STATUS_OPTIONS_ADMIN    = ['todo', 'in_progress', 'in_review', 'done', 'blocked'] as const;

// ── StatusSelect ──────────────────────────────────────────────────────────────
function StatusSelect({ value, onChange, disabled, isAdmin }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; isAdmin?: boolean;
}) {
  // Employees cannot change status once task is in_review — it's locked for admin
  const lockedForEmployee = !isAdmin && value === 'in_review';
  const options = isAdmin ? STATUS_OPTIONS_ADMIN : STATUS_OPTIONS_EMPLOYEE;
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      disabled={disabled || lockedForEmployee}
      title={lockedForEmployee ? 'Awaiting admin review' : undefined}
      className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 cursor-pointer"
    >
      {options.map(s => (
        <option key={s} value={s}>{TASK_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}</option>
      ))}
    </select>
  );
}

// ── ProgressSlider ────────────────────────────────────────────────────────────
function ProgressSlider({ value, onChange, disabled }: {
  value: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range" min={0} max={100} step={5} value={value}
        onChange={e => onChange(Number(e.target.value))} disabled={disabled}
        className="flex-1 h-1.5 accent-rose-500 cursor-pointer disabled:opacity-50"
      />
      <span className="text-xs font-bold text-foreground w-9 text-right tabular-nums">{value}%</span>
    </div>
  );
}

// ── ExtensionForm ─────────────────────────────────────────────────────────────
function ExtensionForm({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { mutate, isPending } = useRequestExtension();
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const today = new Date().toISOString().split('T')[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || !date) return;
    mutate({ id: taskId, data: { reason, requestedDueDate: date } }, { onSuccess: onClose });
  }

  return (
    <form onSubmit={submit} className="mt-3 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/20 space-y-2.5">
      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
        <CalendarClock className="size-3.5" /> Request Deadline Extension
      </p>
      <textarea
        required placeholder="Reason (required)" value={reason} onChange={e => setReason(e.target.value)}
        className="w-full h-16 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
      />
      <input
        type="date" required min={today} value={date} onChange={e => setDate(e.target.value)}
        className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending || !reason.trim() || !date}
          className="h-7 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5">
          {isPending && <Loader2 className="size-3 animate-spin" />} Submit
        </button>
        <button type="button" onClick={onClose} className="h-7 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── CommentForm ───────────────────────────────────────────────────────────────
function CommentForm({ taskId, type, onClose }: {
  taskId: string; type: 'comment' | 'blocker'; onClose: () => void;
}) {
  const { mutate, isPending } = useUpdateTask();
  const [text, setText] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    mutate({ id: taskId, data: { [type === 'blocker' ? 'notes' : 'description']: text } }, { onSuccess: onClose });
  }

  return (
    <form onSubmit={submit} className={cn(
      'mt-3 p-3.5 rounded-xl border space-y-2.5',
      type === 'blocker' ? 'border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-950/20' : 'border-border bg-muted/30'
    )}>
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        {type === 'blocker'
          ? <><ShieldAlert className="size-3.5 text-red-500" /> Report Blocker</>
          : <><MessageSquare className="size-3.5 text-blue-500" /> Add Comment</>}
      </p>
      <textarea
        required placeholder={type === 'blocker' ? 'Describe the blocker...' : 'Add a progress note...'}
        value={text} onChange={e => setText(e.target.value)}
        className="w-full h-16 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isPending || !text.trim()}
          className={cn(
            'h-7 px-3 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5',
            type === 'blocker' ? 'bg-red-600 hover:bg-red-500' : 'bg-rose-600 hover:bg-rose-500'
          )}>
          {isPending && <Loader2 className="size-3 animate-spin" />} Submit
        </button>
        <button type="button" onClick={onClose} className="h-7 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Drag permission rules ────────────────────────────────────────────────────
// Columns an employee is allowed to DROP into
const EMPLOYEE_ALLOWED_DROP: string[] = ['todo', 'in_progress', 'in_review', 'blocked'];

// Employees cannot drag tasks that are done or overdue
function canDrag(task: any, userId: string, isManager: boolean): boolean {
  if (isManager) return true;
  if (task.status === 'in_review' || task.status === 'done' || task.status === 'overdue') return false;
  return task.assigneeId === userId || task.assignee?.id === userId;
}

function canDrop(toCol: string, isManager: boolean): boolean {
  if (isManager) return true;
  return EMPLOYEE_ALLOWED_DROP.includes(toCol);
}

// ── Board: TaskCardInner ──────────────────────────────────────────────────────
// priority pill colors for board cards
const PRIORITY_PILL: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  medium:   'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  low:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
};

function TaskCardInner({ task, isManager, onRequestExtension }: {
  task: any; isManager: boolean; onRequestExtension?: (t: any) => void;
}) {
  const isOverdue = task.status === 'overdue' || task.isOverdue;
  const isBlocked = task.status === 'blocked';
  const progress = task.estimatedHours && task.loggedHours
    ? Math.min(100, Math.round((task.loggedHours / task.estimatedHours) * 100))
    : null;

  const borderAccent = isOverdue ? 'border-l-red-500'
    : isBlocked ? 'border-l-red-400'
    : task.status === 'in_progress' ? 'border-l-amber-500'
    : task.status === 'in_review' ? 'border-l-violet-500'
    : task.status === 'done' ? 'border-l-emerald-500'
    : 'border-l-slate-300 dark:border-l-slate-600';

  return (
    <div className={cn(
      'rounded-xl border-l-[3px] border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-150 space-y-3',
      borderAccent,
      isOverdue && 'bg-red-50/30 dark:bg-red-950/10 border-red-200/60 dark:border-red-800/40',
    )}>
      {/* title */}
      <p className={cn(
        'text-[13px] font-semibold leading-snug',
        isOverdue ? 'text-red-600 dark:text-red-400' : 'text-foreground'
      )}>
        {isOverdue && <AlertCircle className="size-3.5 inline mr-1 text-red-500" />}
        {task.title}
      </p>

      {/* description snippet */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((l: string) => (
            <span key={l} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">{l}</span>
          ))}
        </div>
      )}

      {/* project + priority row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {task.project && (
          <span className="inline-flex items-center text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-border/50 truncate max-w-[120px]">
            {task.project.name}
          </span>
        )}
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
          PRIORITY_PILL[task.priority] ?? 'bg-muted text-muted-foreground'
        )}>
          {task.priority}
        </span>
      </div>

      {/* progress bar */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Progress</span>
            <span className="text-[10px] font-bold tabular-nums text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500',
                task.status === 'done' ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-rose-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* footer: due date + assignee */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.dueDate && (
            <span className={cn('text-[11px] flex items-center gap-1 font-medium', isOverdue ? 'text-red-500' : 'text-muted-foreground')}>
              <Timer className="size-3 shrink-0" />{formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* reporter */}
      {task.reporter && (
        <p className="text-[10px] text-muted-foreground">
          Assigned by <span className="font-semibold text-foreground">{task.reporter.name.split(' ')[0]}</span>
        </p>
      )}

      {isOverdue && !isManager && onRequestExtension && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onRequestExtension(task); }}
          className="w-full text-[11px] py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
          Request Extension
        </button>
      )}
    </div>
  );
}

// ── Board: SortableTaskCard ───────────────────────────────────────────────────
function SortableTaskCard({ task, isManager, currentUserId, onRequestExtension }: {
  task: any; isManager: boolean; currentUserId: string; onRequestExtension: (t: any) => void;
}) {
  const draggable = canDrag(task, currentUserId, isManager);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        isDragging && 'opacity-40',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      )}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      <TaskCardInner task={task} isManager={isManager} onRequestExtension={onRequestExtension} />
    </div>
  );
}

// ── Board: DroppableColumn ────────────────────────────────────────────────────
function DroppableColumn({ col, children, isEmpty, locked, lockedLabel }: {
  col: typeof COLUMNS[0]; children: React.ReactNode; isEmpty: boolean; locked: boolean; lockedLabel?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, disabled: locked });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-3 min-h-[520px] rounded-xl p-3 border border-dashed transition-all duration-150',
        col.bg,
        locked
          ? 'opacity-50 border-border/30 cursor-not-allowed'
          : isOver ? 'border-rose-400 scale-[1.01] shadow-md' : 'border-border/60'
      )}
    >
      {locked && (
        <p className="text-[9px] text-center text-muted-foreground/50 font-semibold uppercase tracking-wider pt-1">{lockedLabel ?? 'Admin only'}</p>
      )}
      {children}
      {isEmpty && !locked && (
        <div className={cn('flex items-center justify-center h-16 rounded-lg border border-dashed transition-colors', isOver ? 'border-rose-400' : 'border-transparent')}>
          <p className="text-[10px] text-muted-foreground/40 font-medium">{isOver ? 'Release to drop' : 'Drop here'}</p>
        </div>
      )}
    </div>
  );
}

// ── My Work: WorkItemCard ─────────────────────────────────────────────────────
function WorkItemCard({ task, index, isAdmin }: { task: any; index: number; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { mutate: updateStatus, isPending: statusPending } = useUpdateTaskStatus();
  const { mutate: updateTask, isPending: taskPending } = useUpdateTask();
  const { mutate: approveTask, isPending: approvePending } = useApproveTask();

  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(task.status);
  const [localProgress, setLocalProgress] = useState<number>(
    task.loggedHours && task.estimatedHours
      ? Math.min(100, Math.round((task.loggedHours / task.estimatedHours) * 100))
      : 0
  );
  const [showExtension, setShowExtension] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showBlocker, setShowBlocker] = useState(false);

  useEffect(() => { setLocalStatus(task.status); }, [task.status]);

  const isOverdue = task.status === 'overdue' || task.isOverdue;
  const isDone = localStatus === 'done';
  const isBlocked = localStatus === 'blocked';
  const hasPendingExtension = task.extensionRequests?.some((r: any) => r.status === 'pending');
  const daysRemaining = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  function invalidateAll() {
    ['tasks', 'projects', 'notifications', 'unread-count', 'work-updates', 'activity'].forEach(k =>
      qc.invalidateQueries({ queryKey: [k] })
    );
  }

  function handleStatusChange(s: string) {
    setLocalStatus(s);
    updateStatus({ id: task.id, status: s as TaskStatus }, { onSuccess: invalidateAll });
  }

  function handleProgressSave() {
    const loggedHours = task.estimatedHours ? (localProgress / 100) * task.estimatedHours : localProgress;
    updateTask({ id: task.id, data: { loggedHours } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['tasks'] });
        qc.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  function handleMarkComplete() {
    if (isAdmin) {
      // Admin directly approves
      approveTask(task.id, { onSuccess: invalidateAll });
    } else {
      // Employee submits for review
      setLocalStatus('in_review');
      updateStatus({ id: task.id, status: 'in_review' }, { onSuccess: invalidateAll });
    }
  }

  // left accent color
  const accentColor = isDone
    ? 'border-l-emerald-500'
    : isOverdue ? 'border-l-red-500'
    : isBlocked ? 'border-l-red-400'
    : localStatus === 'in_progress' ? 'border-l-amber-500'
    : localStatus === 'in_review' ? 'border-l-violet-500'
    : 'border-l-blue-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'rounded-xl border-l-4 border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200',
        accentColor,
        isDone && 'opacity-60'
      )}
    >
      {/* ── Header row ── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* complete toggle */}
        <button
          onClick={isDone ? undefined : handleMarkComplete}
          disabled={isDone || statusPending}
          title={isDone ? 'Completed' : 'Mark complete'}
          className={cn(
            'mt-0.5 shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isDone
              ? 'border-emerald-500 bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'
              : 'border-muted-foreground/30 hover:border-emerald-500 hover:scale-110'
          )}
        >
          {isDone && <CheckCircle2 className="size-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <p className={cn(
                  'text-[13.5px] font-semibold leading-snug',
                  isDone ? 'line-through text-muted-foreground'
                    : isOverdue ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground'
                )}>
                  {task.title}
                </p>
                {isOverdue && !isDone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-wide">
                    <Flame className="size-2.5" /> Overdue
                  </span>
                )}
                {isBlocked && !isDone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-wide">
                    <Ban className="size-2.5" /> Blocked
                  </span>
                )}
                {hasPendingExtension && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    <CalendarClock className="size-2.5" /> Ext. Pending
                  </span>
                )}
              </div>

              {/* meta chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.project && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium border border-border/50">
                    {task.project.name}
                  </span>
                )}
                <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border',
                  task.priority === 'critical' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                  : task.priority === 'high' ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400'
                  : task.priority === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                )}>
                  {task.priority}
                </span>
                <Badge className={cn('text-[10px]', TASK_STATUS_COLORS[localStatus] ?? '')}>
                  {TASK_STATUS_LABELS[localStatus] ?? localStatus.replace(/_/g, ' ')}
                </Badge>
                {task.dueDate && (
                  <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium',
                    isOverdue ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    <Timer className="size-2.5" />{formatDate(task.dueDate)}
                  </span>
                )}
                {!isOverdue && daysRemaining != null && daysRemaining <= 3 && daysRemaining >= 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                    <Clock className="size-2.5" />{daysRemaining}d left
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setExpanded(p => !p)}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>

          {/* progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-medium">Progress</span>
              <span className="text-[10px] font-bold text-foreground tabular-nums">{localProgress}%</span>
            </div>
            <Progress value={localProgress} color={isDone ? 'emerald' : isOverdue ? 'red' : 'rose'} size="sm" />
          </div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-border/60 space-y-4">
              {/* detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: 'Assigned By',
                    content: (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {task.reporter && <Avatar name={task.reporter.name} src={task.reporter.avatar} size="xs" />}
                        <span className="text-xs font-semibold text-foreground">{task.reporter?.name ?? '—'}</span>
                      </div>
                    ),
                  },
                  {
                    label: 'Assigned Date',
                    content: <p className="text-xs font-semibold text-foreground mt-0.5">
                      {task.assignedDate ? formatDate(task.assignedDate) : task.createdAt ? formatDate(task.createdAt) : '—'}
                    </p>,
                  },
                  {
                    label: 'Due Date',
                    content: <p className={cn('text-xs font-semibold mt-0.5', isOverdue ? 'text-red-500' : 'text-foreground')}>
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </p>,
                  },
                  {
                    label: 'Days Remaining',
                    content: <p className={cn('text-xs font-semibold mt-0.5',
                      daysRemaining != null && daysRemaining < 0 ? 'text-red-500'
                        : daysRemaining != null && daysRemaining <= 3 ? 'text-amber-500'
                        : 'text-foreground'
                    )}>
                      {daysRemaining == null ? '—'
                        : daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue`
                        : `${daysRemaining}d`}
                    </p>,
                  },
                  {
                    label: 'Est. Hours',
                    content: <p className="text-xs font-semibold text-foreground mt-0.5">{task.estimatedHours ? `${task.estimatedHours}h` : '—'}</p>,
                  },
                  {
                    label: 'Logged Hours',
                    content: <p className="text-xs font-semibold text-foreground mt-0.5">{task.loggedHours ? `${task.loggedHours}h` : '—'}</p>,
                  },
                ].map(({ label, content }) => (
                  <div key={label} className="bg-muted/40 rounded-lg px-3 py-2 border border-border/40">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                    {content}
                  </div>
                ))}
              </div>

              {/* description */}
              {task.description && (
                <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Description</p>
                  <p className="text-xs text-foreground leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* blocker note */}
              {task.notes && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <ShieldAlert className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5">Blocker</p>
                    <p className="text-xs text-foreground">{task.notes}</p>
                  </div>
                </div>
              )}

              {/* controls */}
              {!isDone ? (
                <div className="space-y-3 pt-1">
                  {/* status + progress row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg border border-border/40 px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Status</p>
                      <StatusSelect value={localStatus} onChange={handleStatusChange} disabled={statusPending} isAdmin={isAdmin} />
                    </div>
                    <div className="bg-muted/30 rounded-lg border border-border/40 px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Progress</p>
                      <ProgressSlider value={localProgress} onChange={setLocalProgress} disabled={taskPending} />
                      <button
                        onClick={handleProgressSave} disabled={taskPending}
                        className="mt-2 h-6 px-2.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {taskPending && <Loader2 className="size-2.5 animate-spin" />}
                        Save
                      </button>
                    </div>
                  </div>

                  {/* action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setShowComment(p => !p); setShowBlocker(false); setShowExtension(false); }}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    >
                      <MessageSquare className="size-3 text-blue-500" /> Comment
                    </button>
                    <button
                      onClick={() => { setShowBlocker(p => !p); setShowComment(false); setShowExtension(false); }}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <ShieldAlert className="size-3" /> Report Blocker
                    </button>
                    {isOverdue && !hasPendingExtension && (
                      <button
                        onClick={() => { setShowExtension(p => !p); setShowComment(false); setShowBlocker(false); }}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors"
                      >
                        <CalendarClock className="size-3" /> Request Extension
                      </button>
                    )}
                    {/* Admin: Approve button shown when task is in_review */}
                    {isAdmin && localStatus === 'in_review' && (
                      <button
                        onClick={() => approveTask(task.id, { onSuccess: invalidateAll })}
                        disabled={approvePending}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 ml-auto"
                      >
                        {approvePending ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                        Approve Task
                      </button>
                    )}
                    {/* Employee: Submit for Review; Admin: Mark Done directly */}
                    {!(isAdmin && localStatus === 'in_review') && (
                      <button
                        onClick={handleMarkComplete}
                        disabled={statusPending || approvePending || localStatus === 'in_review'}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 ml-auto"
                      >
                        {(statusPending || approvePending) ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                        {isAdmin ? 'Mark Done' : localStatus === 'in_review' ? 'Awaiting Review' : 'Submit for Review'}
                      </button>
                    )}
                  </div>

                  {showComment   && <CommentForm taskId={task.id} type="comment"  onClose={() => setShowComment(false)} />}
                  {showBlocker   && <CommentForm taskId={task.id} type="blocker"  onClose={() => setShowBlocker(false)} />}
                  {showExtension && <ExtensionForm taskId={task.id}               onClose={() => setShowExtension(false)} />}
                </div>
              ) : (localStatus as string) === 'in_review' && !isAdmin ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                  <CheckCircle2 className="size-4 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Submitted for admin review — awaiting approval.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Task approved and completed — great work!</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── BoardView ─────────────────────────────────────────────────────────────────
function BoardView({ tasks, isManager, currentUserId }: { tasks: any[]; isManager: boolean; currentUserId: string }) {
  const qc = useQueryClient();
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const [taskMap, setTaskMap] = useState<Record<string, any[]>>(() => {
    const m: Record<string, any[]> = {};
    COLUMNS.forEach(c => { m[c.id] = []; });
    tasks.forEach(t => { const col = t.status in m ? t.status : 'backlog'; m[col].push(t); });
    return m;
  });
  // snapshot before drag starts — used to revert on forbidden drop
  const [snapshotMap, setSnapshotMap] = useState<Record<string, any[]> | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [extensionTask, setExtensionTask] = useState<any>(null);

  useEffect(() => {
    const m: Record<string, any[]> = {};
    COLUMNS.forEach(c => { m[c.id] = []; });
    tasks.forEach(t => { const col = t.status in m ? t.status : 'backlog'; m[col].push(t); });
    setTaskMap(m);
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function findColumn(taskId: string) {
    return Object.keys(taskMap).find(col => taskMap[col].some((t: any) => t.id === taskId));
  }

  function onDragStart({ active }: DragStartEvent) {
    const col = findColumn(active.id as string);
    if (col) {
      setActiveTask(taskMap[col].find((t: any) => t.id === active.id));
      setSnapshotMap(JSON.parse(JSON.stringify(taskMap)));
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const fromCol = findColumn(active.id as string);
    const toCol = COLUMNS.some(c => c.id === over.id) ? (over.id as string) : findColumn(over.id as string);
    if (!fromCol || !toCol || fromCol === toCol) return;
    // Don't animate into locked columns
    if (!canDrop(toCol, isManager)) return;
    setTaskMap(prev => {
      const task = prev[fromCol].find((t: any) => t.id === active.id)!;
      return { ...prev, [fromCol]: prev[fromCol].filter((t: any) => t.id !== active.id), [toCol]: [...prev[toCol], task] };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) {
      // Dropped outside — revert
      if (snapshotMap) setTaskMap(snapshotMap);
      setSnapshotMap(null);
      return;
    }
    const toCol = COLUMNS.some(c => c.id === over.id) ? (over.id as string) : findColumn(over.id as string);
    setSnapshotMap(null);
    if (!toCol) return;

    const draggedTask = activeTask ?? tasks.find((t: any) => t.id === active.id);

    // Rule 1: employee can only drag their own tasks
    if (!canDrag(draggedTask, currentUserId, isManager)) return;
    // Rule 2: employee cannot drop into locked columns
    if (!canDrop(toCol, isManager)) return;

    updateStatus({ id: active.id as string, status: toCol }, {
      onSuccess: () => {
        ['tasks', 'projects', 'notifications', 'unread-count', 'work-updates', 'activity'].forEach(k =>
          qc.invalidateQueries({ queryKey: [k] })
        );
      },
    });
  }

  const total      = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const overdue    = tasks.filter(t => t.status === 'overdue' || t.isOverdue).length;
  const blocked    = tasks.filter(t => t.status === 'blocked').length;

  const boardStats = [
    { label: 'Total Tasks',  value: total,      sub: 'across all columns',  icon: <ListTodo className="size-5 text-blue-500" />,    bg: 'bg-blue-50 dark:bg-blue-950/20',    color: 'text-blue-600 dark:text-blue-400' },
    { label: 'In Progress',  value: inProgress, sub: 'actively being worked', icon: <Zap className="size-5 text-amber-500" />,       bg: 'bg-amber-50 dark:bg-amber-950/20',  color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Completed',    value: done,       sub: `${total ? Math.round((done/total)*100) : 0}% completion rate`, icon: <CheckCircle2 className="size-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Overdue',      value: overdue,    sub: overdue > 0 ? 'needs attention' : 'all on track', icon: <Flame className="size-5 text-red-500" />,          bg: 'bg-red-50 dark:bg-red-950/20',      color: 'text-red-600 dark:text-red-400' },
    { label: 'Blocked',      value: blocked,    sub: blocked > 0 ? 'requires resolution' : 'no blockers', icon: <Ban className="size-5 text-rose-500" />,        bg: 'bg-rose-50 dark:bg-rose-950/20',    color: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-5">
      {/* stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {boardStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card padding="sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{s.label}</p>
                  <p className={cn('text-2xl font-bold mt-1.5 leading-none tabular-nums', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.sub}</p>
                </div>
                <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', s.bg)}>{s.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* kanban */}
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${COLUMNS.length * 300 + (COLUMNS.length - 1) * 16}px` }}>
            {COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col gap-2 shrink-0" style={{ width: 300 }}>
                <div className="flex items-center gap-2 px-1">
                  <span className={cn('size-2.5 rounded-full shrink-0', col.dot)} />
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground font-bold bg-muted rounded-full px-2 py-0.5 min-w-[22px] text-center">
                    {taskMap[col.id]?.length ?? 0}
                  </span>
                </div>
                <SortableContext items={taskMap[col.id]?.map((t: any) => t.id) ?? []} strategy={verticalListSortingStrategy}>
                  <DroppableColumn col={col} isEmpty={!taskMap[col.id]?.length} locked={!canDrop(col.id, isManager)}
                    lockedLabel={col.id === 'overdue' ? 'System managed' : 'Admin only'}>
                    {taskMap[col.id]?.map((task: any) => (
                      <SortableTaskCard key={task.id} task={task} isManager={isManager} currentUserId={currentUserId} onRequestExtension={setExtensionTask} />
                    ))}
                  </DroppableColumn>
                </SortableContext>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90 scale-105">
              <TaskCardInner task={activeTask} isManager={isManager} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* extension modal */}
      {extensionTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-5">
            <p className="text-sm font-semibold text-foreground mb-3">{extensionTask.title}</p>
            <ExtensionForm taskId={extensionTask.id} onClose={() => setExtensionTask(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── SprintBoardPage ───────────────────────────────────────────────────────────
export default function SprintBoardPage() {
  const { user } = useAppStore();
  const role = user?.role ?? '';
  const isManager = isRole(role, MANAGER_ROLES);
  const isEmployee = isRole(role, EMPLOYEE_ROLES);

  const [view, setView] = useState<'board' | 'mywork'>(isEmployee ? 'mywork' : 'board');
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Board: fetch all tasks — backend enforces role-based visibility server-side
  const { data: boardData, isLoading: boardLoading } = useTasks({ limit: 100 });
  const allTasks: any[] = boardData?.data ?? boardData ?? [];

  // My Work: always only tasks assigned to the logged-in user
  const { data: myData, isLoading: myLoading } = useTasks({ assigneeId: user?.id, limit: 100 });
  const myTasks: any[] = myData?.data ?? myData ?? [];

  const filteredMyTasks = statusFilter === 'all'
    ? myTasks
    : myTasks.filter(t => t.status === statusFilter);

  const myStats = {
    total:      myTasks.length,
    inProgress: myTasks.filter(t => t.status === 'in_progress').length,
    done:       myTasks.filter(t => t.status === 'done').length,
    overdue:    myTasks.filter(t => t.status === 'overdue' || t.isOverdue).length,
    blocked:    myTasks.filter(t => t.status === 'blocked').length,
  };

  const myWorkStats = [
    {
      label: 'Assigned',
      value: myStats.total,
      sub: 'total tasks',
      icon: <ListTodo className="size-5 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'In Progress',
      value: myStats.inProgress,
      sub: 'actively working',
      icon: <Zap className="size-5 text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Completed',
      value: myStats.done,
      sub: `${myStats.total ? Math.round((myStats.done / myStats.total) * 100) : 0}% done`,
      icon: <CheckCircle2 className="size-5 text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Overdue',
      value: myStats.overdue,
      sub: myStats.overdue > 0 ? 'needs attention' : 'all on track',
      icon: <Flame className="size-5 text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-950/20',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Blocked',
      value: myStats.blocked,
      sub: myStats.blocked > 0 ? 'requires resolution' : 'no blockers',
      icon: <Ban className="size-5 text-rose-500" />,
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      color: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const STATUS_FILTERS = [
    { key: 'all',         label: 'All',         count: myTasks.length },
    { key: 'todo',        label: 'To Do',        count: myTasks.filter(t => t.status === 'todo').length },
    { key: 'in_progress', label: 'In Progress',  count: myStats.inProgress },
    { key: 'in_review',   label: 'In Review',    count: myTasks.filter(t => t.status === 'in_review').length },
    { key: 'blocked',     label: 'Blocked',      count: myStats.blocked },
    { key: 'overdue',     label: 'Overdue',      count: myStats.overdue },
    { key: 'done',        label: 'Done',         count: myStats.done },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Sprint Board"
        description={view === 'board' ? 'Drag & drop tasks to update status in real time' : `${myStats.total} tasks assigned to you`}
        breadcrumbs={[{ label: 'Work' }, { label: 'Sprint Board' }]}
        actions={
          <div className="flex items-center gap-2">
            {/* view toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden shadow-sm">
              <button
                onClick={() => setView('board')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors',
                  view === 'board'
                    ? 'bg-foreground text-background'
                    : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <LayoutGrid className="size-3.5" /> Board
              </button>
              {isEmployee && (
                <button
                  onClick={() => setView('mywork')}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors border-l border-border',
                    view === 'mywork'
                      ? 'bg-foreground text-background'
                      : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <List className="size-3.5" /> My Work
                </button>
              )}
            </div>

            {isManager && (
              <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 shadow-sm">
                <Plus className="size-4" /> New Task
              </Button>
            )}
          </div>
        }
      />

      {/* ── Board View ── */}
      {view === 'board' && (
        boardLoading ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {COLUMNS.map(c => <Skeleton key={c.id} className="h-48 rounded-xl" />)}
            </div>
          </div>
        ) : (
          <BoardView tasks={allTasks} isManager={isManager} currentUserId={user?.id ?? ''} />
        )
      )}

      {/* ── My Work View ── */}
      {view === 'mywork' && (
        <div className="space-y-5">
          {/* stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {myWorkStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{s.label}</p>
                      <p className={cn('text-2xl font-bold mt-1.5 leading-none tabular-nums', s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.sub}</p>
                    </div>
                    <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', s.bg)}>{s.icon}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* filter tabs with counts */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border',
                  statusFilter === f.key
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-border-strong hover:bg-muted'
                )}
              >
                {f.label}
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center',
                  statusFilter === f.key ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                )}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* task list */}
          {myLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : filteredMyTasks.length === 0 ? (
            <Card padding="xl" className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 mb-4">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {statusFilter === 'all' ? 'No tasks assigned to you' : `No ${statusFilter.replace(/_/g, ' ')} tasks`}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">You're all caught up — great work!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMyTasks.map((task, i) => (
                <WorkItemCard key={task.id} task={task} index={i} isAdmin={isManager} />
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
