import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActivity } from '@/hooks';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils';

const ALL_TYPES = ['all', 'task', 'commit', 'deploy', 'bug', 'leave', 'review', 'campaign', 'general'] as const;

// Which activity types each role cares about
const ROLE_RELEVANT_TYPES: Record<string, string[]> = {
  admin:           ['task', 'commit', 'deploy', 'bug', 'leave', 'review', 'campaign', 'general'],
  product_manager: ['task', 'commit', 'deploy', 'bug', 'review', 'general'],
  frontend_dev:    ['task', 'commit', 'deploy', 'bug', 'review'],
  backend_dev:     ['task', 'commit', 'deploy', 'bug', 'review'],
  qa:              ['task', 'bug', 'review', 'deploy'],
  marketing:       ['campaign', 'general', 'task'],
  hr:              ['leave', 'general'],
  sales:           ['general', 'task'],
};

export function ActivityPage() {
  const user = useAppStore(s => s.user);
  const role = user?.role ?? 'admin';
  const [typeFilter, setTypeFilter] = useState('all');

  const relevantTypes = ROLE_RELEVANT_TYPES[role] ?? ALL_TYPES.slice(1);

  const { data, isLoading } = useActivity({
    limit: 50,
    ...(typeFilter !== 'all' && { type: typeFilter }),
  });

  const activities = (data?.data ?? []).map((a: any) => ({
    id: a.id,
    user: { id: a.userId, name: a.user?.name ?? 'Unknown', avatar: a.user?.avatar, role: a.user?.role },
    action: a.action,
    target: a.target,
    timestamp: a.createdAt,
    type: a.type,
  }));

  // For non-admin roles, filter client-side to relevant types when showing "all"
  const filtered = typeFilter === 'all' && role !== 'admin'
    ? activities.filter((a: any) => relevantTypes.includes(a.type))
    : activities;

  const visibleTypes = role === 'admin'
    ? ALL_TYPES
    : ['all', ...relevantTypes] as string[];

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Activity"
        description="Team activity across the workspace"
        breadcrumbs={[{ label: 'Activity' }]}
      />

      {/* Type filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {visibleTypes.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors',
              typeFilter === t
                ? 'bg-rose-600 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}>
            {t === 'all' ? 'All' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card padding="lg">
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No activity found</div>
          ) : (
            <ActivityFeed items={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
