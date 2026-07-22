import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Minus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency, formatDate } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFinanceBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks';
import type { Budget, BudgetStatus } from '@/types';

const DEPARTMENTS = ['Development','Marketing','Sales','HR','Finance','Operations','Product','Design','Legal'];
const STATUSES: BudgetStatus[] = ['active','inactive','completed'];
const STATUS_CFG: Record<BudgetStatus, { variant: any; label: string }> = {
  active:    { variant: 'success',   label: 'Active'    },
  inactive:  { variant: 'muted',     label: 'Inactive'  },
  completed: { variant: 'secondary', label: 'Completed' },
};

const DEPT_COLORS: Record<string, string> = {
  Development: '#6366f1', Marketing: '#ec4899', Sales: '#f97316',
  HR: '#10b981', Finance: '#06b6d4', Operations: '#8b5cf6',
  Product: '#f59e0b', Design: '#f43f5e', Legal: '#64748b',
};

const fmt = (n: number) => formatCurrency(n);
const TT_STYLE = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

function BudgetProgressBar({ spent, allocated, color }: { spent: number; allocated: number; color: string }) {
  const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
  const over = spent > allocated;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{fmt(spent)} spent</span>
        <span className={cn('font-semibold', over ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: over ? '#ef4444' : color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">of {fmt(allocated)}</span>
        {over
          ? <span className="text-rose-600 dark:text-rose-400 font-semibold">Over by {fmt(spent - allocated)}</span>
          : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(allocated - spent)} left</span>}
      </div>
    </div>
  );
}

function BudgetDialog({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Budget }) {
  const { mutate: create, isPending: creating } = useCreateBudget();
  const { mutate: update, isPending: updating } = useUpdateBudget();

  const [form, setForm] = useState({
    department: existing?.department ?? '',
    allocated: existing?.allocated ? String(existing.allocated) : '',
    used: existing?.used ? String(existing.used) : '0',
    startDate: existing?.startDate ? existing.startDate.slice(0, 10) : '',
    endDate: existing?.endDate ? existing.endDate.slice(0, 10) : '',
    status: existing?.status ?? 'active',
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const remaining = (parseFloat(form.allocated) || 0) - (parseFloat(form.used) || 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      allocated: parseFloat(form.allocated) || 0,
      used: parseFloat(form.used) || 0,
    };
    if (existing) {
      update({ id: existing.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader><DialogTitle>{existing ? 'Edit Budget' : 'New Budget'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Select label="Department *"
              options={[{ value: '', label: 'Select department...' }, ...DEPARTMENTS.map(d => ({ value: d, label: d }))]}
              value={form.department} onChange={f('department')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Allocated ($) *" type="number" min="0" step="0.01" placeholder="0.00" value={form.allocated} onChange={f('allocated')} required />
              <Input label="Used ($)" type="number" min="0" step="0.01" placeholder="0.00" value={form.used} onChange={f('used')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date *" type="date" value={form.startDate} onChange={f('startDate')} required />
              <Input label="End Date *" type="date" value={form.endDate} onChange={f('endDate')} required />
            </div>
            <Select label="Status" options={STATUSES.map(s => ({ value: s, label: STATUS_CFG[s].label }))}
              value={form.status} onChange={f('status')} />
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-sm font-semibold text-foreground">Remaining</span>
              <span className={cn('text-base font-bold tabular-nums', remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
                {fmt(remaining)}
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={creating || updating}>{existing ? 'Update' : 'Create Budget'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader><DialogTitle>Delete Budget</DialogTitle></DialogHeader>
        <DialogBody><p className="text-sm text-muted-foreground">This budget will be permanently deleted.</p></DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BudgetsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Budget | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading } = useFinanceBudgets({ limit: 50 });
  const { mutate: deleteBudget, isPending: deleting_ } = useDeleteBudget();

  const budgets: Budget[] = Array.isArray(data?.data) ? data.data : [];

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalUsed      = budgets.reduce((s, b) => s + b.used, 0);
  const overBudget     = budgets.filter(b => b.used > b.allocated).length;

  const chartData = budgets.map(b => ({
    name: b.department,
    allocated: b.allocated,
    used: b.used,
    color: DEPT_COLORS[b.department] ?? '#6366f1',
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Track department budgets and spending limits"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Budgets' }]}
        eyebrow="Finance"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" strokeWidth={2.5} /> New Budget
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Allocated', value: fmt(totalAllocated), icon: <TrendingUp className="size-5" />,   color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Total Used',      value: fmt(totalUsed),      icon: <TrendingDown className="size-5" />, color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Remaining',       value: fmt(totalAllocated - totalUsed), icon: <Minus className="size-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Over Budget',     value: overBudget,          icon: <TrendingUp className="size-5" />,   color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map(s => (
          <Card key={s.label} padding="md" className="flex items-center gap-3">
            <div className={cn('flex size-9 items-center justify-center rounded-xl shrink-0', s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={cn('text-lg font-bold tabular-nums', s.color)}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card padding="xl" className="flex flex-col items-center justify-center gap-4 py-16">
          <TrendingUp className="size-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No budgets yet</p>
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" /> Create Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b, i) => {
            const pct = b.allocated > 0 ? Math.round((b.used / b.allocated) * 100) : 0;
            const over = b.used > b.allocated;
            const color = DEPT_COLORS[b.department] ?? '#6366f1';
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="lg" hover className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl shrink-0" style={{ background: color + '20' }}>
                        <span className="size-3 rounded-full" style={{ background: color }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{b.department}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={over ? 'danger' : pct >= 80 ? 'warning' : 'success'} dot>
                        {over ? 'Over' : pct >= 80 ? 'Near Limit' : 'On Track'}
                      </Badge>
                    </div>
                  </div>

                  <BudgetProgressBar spent={b.used} allocated={b.allocated} color={color} />

                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <Badge variant={STATUS_CFG[b.status]?.variant ?? 'muted'}>{STATUS_CFG[b.status]?.label ?? b.status}</Badge>
                    <div className="flex items-center gap-1">
                      <Button size="icon-xs" variant="ghost" onClick={() => { setEditing(b); setShowDialog(true); }}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(b.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Budget vs Actual Spend</CardTitle><CardDescription>By department</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-4 pb-3 px-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                <Bar dataKey="allocated" name="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.35} />
                <Bar dataKey="used" name="Used" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.used > entry.allocated ? '#ef4444' : entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <BudgetDialog open={showDialog} onClose={() => setShowDialog(false)} existing={editing} />
      <DeleteConfirm
        open={!!deleting} onClose={() => setDeleting(null)} loading={deleting_}
        onConfirm={() => deleting && deleteBudget(deleting, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
