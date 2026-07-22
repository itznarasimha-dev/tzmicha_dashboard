import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, X, Receipt, Trash2, Pencil, ChevronLeft, ChevronRight, Upload, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency, formatDate } from '@/utils';
import { useFinanceExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks';
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/types';

const CATEGORIES: ExpenseCategory[] = ['office','rent','electricity','internet','marketing','travel','software','hardware','salary','equipment','miscellaneous'];
const STATUSES: ExpenseStatus[] = ['pending','approved','rejected','paid'];
const METHODS = ['upi','cash','cheque','bank_transfer','card'];

const STATUS_CFG: Record<ExpenseStatus, { variant: any; label: string }> = {
  pending:  { variant: 'warning',   label: 'Pending'  },
  approved: { variant: 'success',   label: 'Approved' },
  rejected: { variant: 'danger',    label: 'Rejected' },
  paid:     { variant: 'blue',      label: 'Paid'     },
};

const CAT_COLORS: Record<string, string> = {
  office: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  rent: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  electricity: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  internet: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
  marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
  travel: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  software: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  hardware: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  salary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  equipment: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  miscellaneous: 'bg-muted text-muted-foreground',
};

const fmt = (n: number) => formatCurrency(n);

function ExpenseDialog({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Expense }) {
  const { mutate: create, isPending: creating } = useCreateExpense();
  const { mutate: update, isPending: updating } = useUpdateExpense();

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    category: existing?.category ?? 'miscellaneous',
    vendor: existing?.vendor ?? '',
    amount: existing?.amount ? String(existing.amount) : '',
    paymentMethod: existing?.paymentMethod ?? 'bank_transfer',
    expenseDate: existing?.expenseDate ? existing.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: existing?.status ?? 'pending',
    notes: existing?.notes ?? '',
    receiptUrl: existing?.receiptUrl ?? '',
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) || 0 };
    if (existing) {
      update({ id: existing.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader><DialogTitle>{existing ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Input label="Expense Title *" placeholder="e.g. AWS Monthly Bill" value={form.title} onChange={f('title')} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                value={form.category} onChange={f('category')} />
              <Input label="Amount ($) *" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={f('amount')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vendor" placeholder="Vendor name" value={form.vendor} onChange={f('vendor')} />
              <Input label="Expense Date *" type="date" value={form.expenseDate} onChange={f('expenseDate')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Payment Method" options={METHODS.map(m => ({ value: m, label: m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
                value={form.paymentMethod} onChange={f('paymentMethod')} />
              <Select label="Status" options={STATUSES.map(s => ({ value: s, label: STATUS_CFG[s].label }))}
                value={form.status} onChange={f('status')} />
            </div>
            <Input label="Receipt URL" placeholder="https://..." value={form.receiptUrl} onChange={f('receiptUrl')}
              rightIcon={<Upload className="size-3.5" />} />
            <Textarea label="Notes" placeholder="Additional notes..." value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={creating || updating}>{existing ? 'Update' : 'Add Expense'}</Button>
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
        <DialogHeader><DialogTitle>Delete Expense</DialogTitle></DialogHeader>
        <DialogBody><p className="text-sm text-muted-foreground">This expense record will be permanently deleted.</p></DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const params = useMemo(() => ({
    search: search || undefined, status: status || undefined,
    category: category || undefined, page, limit: 15,
  }), [search, status, category, page]);

  const { data, isLoading } = useFinanceExpenses(params);
  const { mutate: deleteExp, isPending: deleting_ } = useDeleteExpense();

  const expenses: Expense[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage all company expenses"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Expenses' }]}
        eyebrow="Finance"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" strokeWidth={2.5} /> Add Expense
          </Button>
        }
      />

      {/* Category chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setCategory(''); setPage(1); }}
          className={cn('px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
            !category ? 'bg-rose-600 text-white border-rose-600' : 'border-border text-muted-foreground hover:text-foreground hover:border-border-strong')}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c === category ? '' : c); setPage(1); }}
            className={cn('px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize',
              c === category ? CAT_COLORS[c] + ' ring-2 ring-offset-1 ring-current' : CAT_COLORS[c])}>
            {c}
          </button>
        ))}
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-foreground">{meta?.total ?? 0} expenses</p>
            <p className="text-xs text-muted-foreground">Total: <span className="font-semibold text-foreground">{fmt(totalAmount)}</span></p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                className="h-10 w-56 rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search expenses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-36"
              value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
            </select>
            {(search || status || category) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus(''); setCategory(''); setPage(1); }}>
                <X className="size-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Title', 'Category', 'Vendor', 'Amount', 'Method', 'Date', 'Receipt', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="size-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">No expenses found</p>
                      <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
                        <Plus className="size-4" /> Add Expense
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : expenses.map((exp, i) => (
                <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Receipt className="size-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground">{exp.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize', CAT_COLORS[exp.category])}>{exp.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{exp.vendor ?? '—'}</td>
                  <td className="px-5 py-3.5 font-bold text-[13px] text-foreground tabular-nums">{fmt(exp.amount)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground capitalize">{exp.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(exp.expenseDate)}</td>
                  <td className="px-5 py-3.5">
                    {exp.receiptUrl
                      ? <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                          <ExternalLink className="size-3" /> View
                        </a>
                      : <span className="text-[11px] text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_CFG[exp.status]?.variant ?? 'muted'} dot>{STATUS_CFG[exp.status]?.label ?? exp.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button size="icon-xs" variant="ghost" onClick={() => { setEditing(exp); setShowDialog(true); }}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(exp.id)}>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
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
      </Card>

      <ExpenseDialog open={showDialog} onClose={() => setShowDialog(false)} existing={editing} />
      <DeleteConfirm
        open={!!deleting} onClose={() => setDeleting(null)} loading={deleting_}
        onConfirm={() => deleting && deleteExp(deleting, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
