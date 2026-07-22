import { useState } from 'react';
import { Plus, Search, AlertCircle, Timer, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTasks } from '@/hooks';
import { useAppStore } from '@/store/appStore';
import { PRIORITY_COLORS, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { TaskStatus, TaskPriority } from '@/types';
import { CreateTaskModal, RequestExtensionModal } from '@/components/forms/FormModals';

const MANAGER_ROLES = ['admin', 'product_manager', 'product-manager'];

export function TasksPage() {
  const user = useAppStore(s => s.user);
  const isManager = MANAGER_ROLES.includes(user?.role ?? '');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [extensionTask, setExtensionTask] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useTasks({
    ...(filterStatus !== 'all' && { status: filterStatus }),
    ...(search && { search }),
    limit: 50,
  });

  const tasks = data?.data ?? [];

  const statusFilters: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress' as any, 'in_review' as any, 'done', 'blocked', 'overdue'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`${data?.meta?.total ?? 0} tasks`}
        breadcrumbs={[{ label: 'Work' }, { label: 'Tasks' }]}
        actions={
          isManager ? (
            <>
              <Button size="md" onClick={() => setShowCreate(true)}>
                <Plus className="size-4" strokeWidth={2.5} /> Add Task
              </Button>
              <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)} />
            </>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={<Search className="size-3.5" />}
          className="flex-1 min-w-[180px] max-w-xs"
        />
        <div className="flex items-center gap-1 flex-wrap">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                filterStatus === s ? 'bg-rose-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {s === 'all' ? 'All' : TASK_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            ))
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">No tasks found</div>
          ) : (
            tasks.map((task: any, i: number) => {
              const isOverdue = task.status === 'overdue' || task.isOverdue;
              return (
                <motion.div key={task.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={cn('flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group',
                    isOverdue && 'bg-red-500/5 border-l-2 border-l-red-500')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {(task.priority === 'critical' || isOverdue) && (
                        <AlertCircle className={cn('size-3.5 shrink-0', isOverdue ? 'text-red-500' : 'text-red-500')} />
                      )}
                      <p className={cn('text-[13px] font-medium truncate', isOverdue ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.project && (
                        <span className="text-2xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">{task.project.name}</span>
                      )}
                      {task.dueDate && (
                        <span className={cn('text-2xs flex items-center gap-1', isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
                          <Timer className="size-3" /> {formatDate(task.dueDate)}
                          {isOverdue && ' — OVERDUE'}
                        </span>
                      )}
                      {!isOverdue && task.daysRemaining != null && task.daysRemaining <= 3 && task.daysRemaining >= 0 && (
                        <span className="text-2xs text-amber-500 font-semibold flex items-center gap-1">
                          <Clock className="size-3" /> {task.daysRemaining}d left
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn('text-xs font-semibold', PRIORITY_COLORS[task.priority as TaskPriority])}>{task.priority}</span>
                    <Badge className={cn(TASK_STATUS_COLORS[task.status] ?? '')}>
                      {task.status?.replace(/_/g, ' ')}
                    </Badge>
                    {task.assignee ? <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" /> : <div className="size-5 rounded-full bg-muted" />}
                    {isOverdue && !isManager && (
                      <button
                        onClick={e => { e.stopPropagation(); setExtensionTask({ id: task.id, title: task.title }); }}
                        className="text-2xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap">
                        Request Extension
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {extensionTask && (
        <RequestExtensionModal
          open={!!extensionTask}
          onClose={() => setExtensionTask(null)}
          taskId={extensionTask.id}
          taskTitle={extensionTask.title}
        />
      )}
    </div>
  );
}
