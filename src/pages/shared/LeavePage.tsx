import { CheckCircle2, XCircle, Calendar, Clock, Plus, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLeaveRequests, useUpdateLeaveStatus } from '@/hooks';
import { useAppStore } from '@/store/appStore';
import { formatDate } from '@/utils';
import { CreateLeaveModal } from '@/components/forms/FormModals';
import { useState } from 'react';
import { cn } from '@/utils';

const APPROVER_ROLES = ['admin', 'hr'];

export function LeavePage() {
  const { user } = useAppStore();
  const qc = useQueryClient();
  const isApprover = APPROVER_ROLES.includes(user?.role ?? '');

  const { data, isLoading } = useLeaveRequests({ limit: 50 });
  const { mutate: updateStatus, isPending: statusPending } = useUpdateLeaveStatus();
  const [showCreate, setShowCreate] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const requests = data?.data ?? [];
  const pending  = requests.filter((r: any) => r.status === 'pending');
  const approved = requests.filter((r: any) => r.status === 'approved');

  const typeColor: Record<string, any> = {
    annual: 'blue', sick: 'warning', casual: 'secondary', unpaid: 'muted',
  };

  function handleStatus(id: string, status: 'approved' | 'rejected') {
    setActioningId(id);
    updateStatus({ id, status }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['notifications'] });
        qc.invalidateQueries({ queryKey: ['unread-count'] });
        qc.invalidateQueries({ queryKey: ['leave'] });
        setActioningId(null);
      },
      onError: () => setActioningId(null),
    });
  }

  // Can this approver action this specific request?
  function canAction(req: any) {
    if (!isApprover) return false;
    if (req.userId === user?.id) return false; // cannot approve own leave
    return req.status === 'pending';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description={`${pending.length} pending · ${approved.length} approved`}
        breadcrumbs={[{ label: 'People' }, { label: 'Leave' }]}
        actions={
          <>
            <Button size="md" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" strokeWidth={2.5} /> Request Leave
            </Button>
            <CreateLeaveModal open={showCreate} onClose={() => setShowCreate(false)} />
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending',    value: pending.length,                                               color: 'text-amber-600' },
          { label: 'Approved',   value: approved.length,                                              color: 'text-emerald-600' },
          { label: 'Rejected',   value: requests.filter((r: any) => r.status === 'rejected').length,  color: 'text-red-600' },
          { label: 'Total Days', value: requests.reduce((s: number, r: any) => s + r.days, 0),        color: 'text-foreground' },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <div>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>
              {isApprover ? 'Review and manage team leave' : 'Your leave requests'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border mt-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              ))
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No leave requests</div>
            ) : (
              requests.map((req: any, i: number) => {
                const isSelf = req.userId === user?.id;
                const isActioning = actioningId === req.id;

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 px-1"
                  >
                    <Avatar name={req.user?.name ?? 'User'} size="sm" className="mt-0.5" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-foreground">{req.user?.name ?? 'Unknown'}</p>
                        {isSelf && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            You
                          </span>
                        )}
                        {req.user?.department && (
                          <span className="text-[10px] text-muted-foreground">{req.user.department}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={typeColor[req.type] ?? 'muted'}>{req.type}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" /> {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" /> {req.days} day{req.days > 1 ? 's' : ''}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 italic">"{req.reason}"</p>

                      {/* Show who actioned it */}
                      {req.status !== 'pending' && req.approver && (
                        <div className={cn(
                          'mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border',
                          req.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                        )}>
                          <UserCheck className="size-3" />
                          {req.status === 'approved' ? 'Approved' : 'Rejected'} by {req.approver.name}
                        </div>
                      )}

                      {/* HR seeing their own pending request */}
                      {isSelf && req.status === 'pending' && isApprover && (
                        <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Awaiting approval from admin
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      {canAction(req) ? (
                        <>
                          <Button
                            size="xs"
                            disabled={isActioning || statusPending}
                            onClick={() => handleStatus(req.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-none"
                          >
                            {isActioning ? (
                              <span className="size-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-3.5" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={isActioning || statusPending}
                            onClick={() => handleStatus(req.id, 'rejected')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="size-3.5" /> Reject
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}
                          dot
                        >
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
