import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, X, Eye, Download, Users, DollarSign, Clock,
  CheckCircle2, Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatCurrency, formatDate } from '@/utils';
import { useFinancePayroll, useCreatePayroll, useUpdatePayroll, useDeletePayroll, useUsers } from '@/hooks';
import type { PayrollRecord, PayrollStatus } from '@/types';

const STATUSES: PayrollStatus[] = ['pending', 'paid'];
const STATUS_CFG: Record<PayrollStatus, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  paid:    { variant: 'success', label: 'Paid'    },
};
const fmt = (n: number) => formatCurrency(n);

function PayrollDialog({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: PayrollRecord }) {
  const { mutate: create, isPending: creating } = useCreatePayroll();
  const { mutate: update, isPending: updating } = useUpdatePayroll();
  const { data: usersData } = useUsers({ limit: 100 });
  const users = Array.isArray(usersData?.data) ? usersData.data : Array.isArray(usersData) ? usersData : [];

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    employeeId: existing?.employeeId ?? '',
    month: existing?.month ?? defaultMonth,
    basicSalary: existing?.basicSalary ? String(existing.basicSalary) : '',
    bonus: existing?.bonus ? String(existing.bonus) : '0',
    allowances: existing?.allowances ? String(existing.allowances) : '0',
    deductions: existing?.deductions ? String(existing.deductions) : '0',
    paymentDate: existing?.paymentDate ? existing.paymentDate.slice(0, 10) : '',
    status: existing?.status ?? 'pending',
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const net = (parseFloat(form.basicSalary) || 0) + (parseFloat(form.bonus) || 0) + (parseFloat(form.allowances) || 0) - (parseFloat(form.deductions) || 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      basicSalary: parseFloat(form.basicSalary) || 0,
      bonus: parseFloat(form.bonus) || 0,
      allowances: parseFloat(form.allowances) || 0,
      deductions: parseFloat(form.deductions) || 0,
      paymentDate: form.paymentDate || undefined,
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
        <DialogHeader><DialogTitle>{existing ? 'Edit Payroll' : 'Add Payroll Record'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Select label="Employee *"
              options={[{ value: '', label: 'Select employee...' }, ...users.map((u: any) => ({ value: u.id, label: `${u.name} — ${u.department}` }))]}
              value={form.employeeId} onChange={f('employeeId')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Month *" type="month" value={form.month} onChange={f('month')} required />
              <Input label="Payment Date" type="date" value={form.paymentDate} onChange={f('paymentDate')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Basic Salary ($) *" type="number" min="0" step="0.01" placeholder="0.00" value={form.basicSalary} onChange={f('basicSalary')} required />
              <Input label="Bonus ($)" type="number" min="0" step="0.01" placeholder="0.00" value={form.bonus} onChange={f('bonus')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Allowances ($)" type="number" min="0" step="0.01" placeholder="0.00" value={form.allowances} onChange={f('allowances')} />
              <Input label="Deductions ($)" type="number" min="0" step="0.01" placeholder="0.00" value={form.deductions} onChange={f('deductions')} />
            </div>
            <Select label="Status" options={STATUSES.map(s => ({ value: s, label: STATUS_CFG[s].label }))}
              value={form.status} onChange={f('status')} />
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <span className="text-sm font-bold text-foreground">Net Salary</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(net)}</span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={creating || updating}>{existing ? 'Update' : 'Add Record'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PayslipDialog({ open, onClose, record }: { open: boolean; onClose: () => void; record: PayrollRecord | null }) {
  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader><DialogTitle>Payslip Preview</DialogTitle></DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <Avatar name={record.employee?.name ?? 'E'} src={record.employee?.avatar} size="md" />
            <div>
              <p className="text-sm font-bold text-foreground">{record.employee?.name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{(record.employee as any)?.title ?? ''} · {record.employee?.department ?? ''}</p>
              <p className="text-xs text-muted-foreground">Pay Period: {record.month}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Earnings</p>
            <div className="space-y-1.5">
              {[{ label: 'Basic Salary', value: record.basicSalary }, { label: 'Bonus', value: record.bonus }, { label: 'Allowances', value: record.allowances }].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-foreground">{fmt(r.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-border" />
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Deductions</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax & Deductions</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">-{fmt(record.deductions)}</span>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
            <span className="text-sm font-bold text-foreground">Net Pay</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(record.netSalary)}</span>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm"><Download className="size-4" /> Download PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader><DialogTitle>Delete Payroll Record</DialogTitle></DialogHeader>
        <DialogBody><p className="text-sm text-muted-foreground">This payroll record will be permanently deleted.</p></DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PayrollPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<PayrollRecord | undefined>();
  const [viewing, setViewing] = useState<PayrollRecord | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const params = useMemo(() => ({
    search: search || undefined, status: status || undefined,
    month: month || undefined, page, limit: 15,
  }), [search, status, month, page]);

  const { data, isLoading } = useFinancePayroll(params);
  const { mutate: deletePr, isPending: deleting_ } = useDeletePayroll();

  const records: PayrollRecord[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const totalPayroll = records.reduce((s, r) => s + r.netSalary, 0);
  const paidCount    = records.filter(r => r.status === 'paid').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Manage employee salaries and payslips"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payroll' }]}
        eyebrow="Finance"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" strokeWidth={2.5} /> Add Record
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Payroll', value: fmt(totalPayroll), icon: <DollarSign className="size-5" />, color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Employees',     value: meta?.total ?? 0,  icon: <Users className="size-5" />,      color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Paid',          value: paidCount,         icon: <CheckCircle2 className="size-5" />,color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Pending',       value: pendingCount,      icon: <Clock className="size-5" />,      color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
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

      <Card padding="none">
        <CardHeader className="px-5 pt-4 pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div><CardTitle>Payroll Records</CardTitle><CardDescription>{meta?.total ?? 0} records</CardDescription></div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input className="h-10 w-48 rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Search employee..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <input type="month" className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-36"
                value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} />
              <select className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
                value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
              {(search || status || month) && (
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus(''); setMonth(''); setPage(1); }}>
                  <X className="size-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Employee', 'Department', 'Month', 'Basic', 'Bonus', 'Allowances', 'Deductions', 'Net Salary', 'Pay Date', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan={11} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="size-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">No payroll records found</p>
                        <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
                          <Plus className="size-4" /> Add Record
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : records.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.employee?.name ?? 'E'} src={r.employee?.avatar} size="xs" />
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{r.employee?.name ?? '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{(r.employee as any)?.title ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground">{r.employee?.department ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground font-mono">{r.month}</td>
                    <td className="px-4 py-3.5 text-[13px] text-foreground tabular-nums">{fmt(r.basicSalary)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-emerald-600 dark:text-emerald-400 tabular-nums">+{fmt(r.bonus)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-emerald-600 dark:text-emerald-400 tabular-nums">+{fmt(r.allowances)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-rose-600 dark:text-rose-400 tabular-nums">-{fmt(r.deductions)}</td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-foreground tabular-nums">{fmt(r.netSalary)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{r.paymentDate ? formatDate(r.paymentDate) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={STATUS_CFG[r.status]?.variant ?? 'muted'} dot>{STATUS_CFG[r.status]?.label ?? r.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button size="icon-xs" variant="ghost" title="View Payslip" onClick={() => setViewing(r)}>
                          <Eye className="size-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" title="Edit" onClick={() => { setEditing(r); setShowDialog(true); }}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" title="Delete"
                          className="text-destructive hover:bg-destructive/10" onClick={() => setDeleting(r.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-2">
              <p className="text-xs text-muted-foreground">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-1">
                <Button size="icon-xs" variant="outline" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">{meta.page} / {meta.totalPages}</span>
                <Button size="icon-xs" variant="outline" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PayrollDialog open={showDialog} onClose={() => setShowDialog(false)} existing={editing} />
      <PayslipDialog open={!!viewing} onClose={() => setViewing(null)} record={viewing} />
      <DeleteConfirm
        open={!!deleting} onClose={() => setDeleting(null)} loading={deleting_}
        onConfirm={() => deleting && deletePr(deleting, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
