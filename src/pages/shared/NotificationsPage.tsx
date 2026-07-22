import { useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks';
import { notificationsApi } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { formatRelativeTime } from '@/utils';
import { cn } from '@/utils';

const typeColors: Record<string, string> = {
  info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30',
  error:   'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30',
};
const typeDot: Record<string, string> = {
  info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500',
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useNotifications({ limit: 50 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n: any) => !n.read).length;

  // Auto mark all as read when page is opened
  useEffect(() => {
    if (unread > 0) markAllAsRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteNotif(id: string) {
    await notificationsApi.delete(id);
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['unread-count'] });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        description={`${unread} unread`}
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card padding="none">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4"><Skeleton className="size-8 rounded-full shrink-0" /><Skeleton className="h-12 flex-1" /></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Bell className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">All caught up</p>
            <p className="text-xs text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n: any, i: number) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={cn('flex items-start gap-3 p-4 transition-colors', !n.read && 'bg-primary-subtle/30')}>
                <div className={cn('flex size-8 items-center justify-center rounded-full shrink-0 border', typeColors[n.type] ?? typeColors.info)}>
                  <span className={cn('size-2 rounded-full', typeDot[n.type] ?? 'bg-blue-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-[13px] font-semibold text-foreground', !n.read && 'text-foreground')}>{n.title}</p>
                    {!n.read && <Badge variant="blue" size="sm">New</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-2xs text-muted-foreground mt-1.5">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="icon-xs" onClick={() => markAsRead(n.id)} className="shrink-0">
                    <Check className="size-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => deleteNotif(n.id)} className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="size-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
