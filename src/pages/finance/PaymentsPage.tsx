import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, X, CreditCard, Building2, Smartphone, Banknote,
  ArrowUpRight, ArrowDownRight, Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency, formatDate } from '@/utils';
import { useFinancePayments, useCreatePayment, useUpdatePayment, useDeletePayment, useInvoices } from '@/hooks';
import type { Payment, PaymentStatus, PaymentMethod } from '@/types';

const STATUSES: PaymentStatus[] = ['pending','received','failed','refunded'];
const METHODS: PaymentMethod[] = ['upi','cash','cheque','bank_transfer','card'];

const STATUS_CFG: Record<PaymentStatus, { variant: any; label: string }> = {
  pending:  { variant: 'warning',   label: 'Pending'  },
  received: { variant: 'success',   label: 'Received' },
  failed:   { variant: 'danger',    label: 'Failed'   },
  refunded: { variant: 'secondary', label: 'Refunded' },
};

const METHOD_ICON: Record<PaymentMethod, React.ReactNode> = {
  card:          <CreditCard className="size-3.5" />,
  bank_transfer: <Building2 className="size-3.5" />,
  upi:           <Smartphone className="size-3.5" />,
  cash:          <Banknote className="size-3.5" />,
  cheque:        <Banknote className="size-3.5" />,
};

const fmt = (n: number) => formatCurrency(n);

function PaymentDialog({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Payment }) {
  const { mutate: create, isPending: creating } = useCreatePayment();
  const { mutate: update, isPending: updating } = useUpdatePayment();
  const { data: invoicesData } = useInvoices({ limit: 100 });
  const invoices = Array.isArray(invoicesData?.data) ? invoicesData.data : Array.isArray(invoicesData) ? invoicesData : [];

  const [form, setForm] = useState({
    invoiceId: existing?.invoiceId ?? '',
    amount: existing?.amount ? String(existing.amount) : '',
    paymentMethod: existing?.paymentMethod ?? 'bank_transfer',
    referenceNumber: existing?.referenceNumber ?? '',
    paymentDate: existing?.paymentDate ? existing.paymentDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: existing?.status ?? 'pending',
    notes: existing?.notes ?? '',
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) || 0, invoiceId: form.invoiceId || undefined };
    if (existing) {
      update({ id: existing.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader><DialogTitle>{existing ? 'Edit Payment' : 'Record Payment'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Select label="Invoice (optional)"
              options={[{ value: '', label: 'No invoice (direct payment)' }, ...invoices.map((inv: any) => ({ value: inv.id, label: `${inv.invoiceNumber} — ${inv.client?.companyName ?? ''}` }))]}
              value={form.invoiceId} onChange={f('invoiceId')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount ($) *" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={f('amount')} required />
              <Input label="Payment Date *" type="date" value={form.paymentDate} onChange={f('paymentDate')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Payment Method"
                options={METHODS.map(m => ({ value: m, label: m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
                value={form.paymentMethod} onChange={f('paymentMethod')} />
              <Select label="Status"
                options={STATUSES.map(s => ({ value: s, label: STATUS_CFG[s].label }))}
                value={form.status} onChange={f('status')} />
            </div>
            <Input label="Reference Number" placeholder="Transaction ID, cheque no..." value={form.referenceNumber} onChange={f('referenceNumber')} />
            <Textarea label="Notes" placeholder="Additional notes..." value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={creating || updating}>{existing ? 'Update' : 'Record Payment'}</Button>
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
        <DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
        <DialogBody><p className="text-sm text-muted-foreground">This payment record will be permanently deleted.</p></DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Payment | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const params = useMemo(() => ({
    search: search || undefined, status: status || undefined,
    method: method || undefined, page, limit: 15,
  }), [search, status, method, page]);

  const { data, isLoading } = useFinancePayments(params);
  const { mutate: deletePay, isPending: deleting_ } = useDeletePayment();

  const payments: Payment[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const totalReceived = payments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0);
  const totalPending  = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalFailed   = payments.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track all incoming and outgoing payments"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
        eyebrow="Finance"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" strokeWidth={2.5} /> Record Payment
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Received', value: totalReceived, icon: <ArrowUpRight className="size-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Pending',        value: totalPending,  icon: <CreditCard className="size-5" />,   color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Failed',         value: totalFailed,   icon: <ArrowDownRight className="size-5" />,color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/30' },
        ].map(s => (
          <Card key={s.label} padding="md" className="flex items-center gap-3">
            <div className={cn('flex size-10 items-center justify-center rounded-xl shrink-0', s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', s.color)}>{fmt(s.value)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Method summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {METHODS.map(m => {
          const count = payments.filter(p => p.paymentMethod === m).length;
          const vol = payments.filter(p => p.paymentMethod === m).reduce((s, p) => s + p.amount, 0);
          return (
            <Card key={m} padding="md">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">{METHOD_ICON[m]}</div>
                <p className="text-xs font-semibold text-foreground capitalize">{m.replace('_', ' ')}</p>
              </div>
              <p className="text-base font-bold text-foreground tabular-nums">{fmt(vol)}</p>
              <p className="text-[11px] text-muted-foreground">{count} transactions</p>
            </Card>
          );
        })}
      </div>

      <Card padding="none">
        <CardHeader className="px-5 pt-4 pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div><CardTitle>Payment History</CardTitle><CardDescription>{meta?.total ?? 0} records</CardDescription></div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input className="h-10 w-48 rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
                value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
              <select className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-36"
                value={method} onChange={e => { setMethod(e.target.value); setPage(1); }}>
                <option value="">All Methods</option>
                {METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              {(search || status || method) && (
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus(''); setMethod(''); setPage(1); }}>
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
                  {['Invoice', 'Client', 'Amount', 'Method', 'Reference', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <CreditCard className="size-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">No payments found</p>
                        <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
                          <Plus className="size-4" /> Record Payment
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : payments.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-foreground">
                      {(p as any).invoice?.invoiceNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-foreground">
                      {(p as any).invoice?.client?.companyName ?? 'Direct'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('text-[13px] font-bold tabular-nums',
                        p.status === 'received' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                      )}>
                        {p.status === 'received' ? '+' : ''}{fmt(p.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground capitalize">
                        {METHOD_ICON[p.paymentMethod]}{p.paymentMethod.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground font-mono">{p.referenceNumber ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={STATUS_CFG[p.status]?.variant ?? 'muted'} dot>{STATUS_CFG[p.status]?.label ?? p.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button size="icon-xs" variant="ghost" onClick={() => { setEditing(p); setShowDialog(true); }}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleting(p.id)}>
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

      <PaymentDialog open={showDialog} onClose={() => setShowDialog(false)} existing={editing} />
      <DeleteConfirm
        open={!!deleting} onClose={() => setDeleting(null)} loading={deleting_}
        onConfirm={() => deleting && deletePay(deleting, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
