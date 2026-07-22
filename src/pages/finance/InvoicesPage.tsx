import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, FileText, Download, Eye, Trash2, Copy, CheckCircle,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency, formatDate } from '@/utils';
import {
  useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice,
  useDuplicateInvoice, useMarkInvoicePaid, useFinanceClients, useCreateFinanceClient,
} from '@/hooks';
import type { Invoice, InvoiceStatus, InvoiceItem, FinanceClient } from '@/types';

const STATUS_CFG: Record<InvoiceStatus, { variant: any; label: string }> = {
  draft:     { variant: 'muted',     label: 'Draft'     },
  sent:      { variant: 'blue',      label: 'Sent'      },
  viewed:    { variant: 'violet',    label: 'Viewed'    },
  paid:      { variant: 'success',   label: 'Paid'      },
  overdue:   { variant: 'danger',    label: 'Overdue'   },
  cancelled: { variant: 'secondary', label: 'Cancelled' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  ...Object.entries(STATUS_CFG).map(([v, c]) => ({ value: v, label: c.label })),
];

const fmt = (n: number) => formatCurrency(n);

const EMPTY_ITEM: InvoiceItem = { item: '', description: '', qty: 1, price: 0, amount: 0 };

function InvoiceDialog({
  open, onClose, existing, clients,
}: {
  open: boolean; onClose: () => void; existing?: Invoice; clients: FinanceClient[];
}) {
  const { mutate: create, isPending: creating } = useCreateInvoice();
  const { mutate: update, isPending: updating } = useUpdateInvoice();
  const { mutate: createClient } = useCreateFinanceClient();

  const [form, setForm] = useState({
    clientId: existing?.clientId ?? '',
    project: existing?.project ?? '',
    dueDate: existing?.dueDate ? existing.dueDate.slice(0, 10) : '',
    status: existing?.status ?? 'draft',
    discount: existing?.discount ?? 0,
    tax: existing?.tax ?? 0,
    notes: existing?.notes ?? '',
  });
  const [items, setItems] = useState<InvoiceItem[]>(
    existing?.items?.length ? existing.items : [{ ...EMPTY_ITEM }]
  );
  const [newClientName, setNewClientName] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const grandTotal = subtotal - form.discount + form.tax;

  function setItem(idx: number, key: keyof InvoiceItem, val: any) {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, [key]: val };
      updated.amount = updated.qty * updated.price;
      return updated;
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, items };
    if (existing) {
      update({ id: existing.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  }

  function addNewClient() {
    if (!newClientName.trim()) return;
    createClient({ companyName: newClientName.trim() }, {
      onSuccess: (c: any) => { setForm(p => ({ ...p, clientId: c.id })); setShowNewClient(false); setNewClientName(''); },
    });
  }

  const isPending = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Client + Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-foreground">Client *</label>
                  <button type="button" onClick={() => setShowNewClient(v => !v)}
                    className="text-[11px] text-primary hover:underline font-medium">
                    {showNewClient ? 'Cancel' : '+ New Client'}
                  </button>
                </div>
                {showNewClient ? (
                  <div className="flex gap-2">
                    <Input placeholder="Company name" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                    <Button type="button" size="sm" onClick={addNewClient}>Add</Button>
                  </div>
                ) : (
                  <Select
                    options={[{ value: '', label: 'Select client...' }, ...clients.map(c => ({ value: c.id, label: c.companyName }))]}
                    value={form.clientId}
                    onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                    required
                  />
                )}
              </div>
              <Input label="Project" placeholder="Project name (optional)" value={form.project}
                onChange={e => setForm(p => ({ ...p, project: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Due Date *" type="date" value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
              <Select label="Status" options={STATUS_OPTIONS.slice(1)} value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as InvoiceStatus }))} />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-semibold text-foreground">Line Items</p>
                <Button type="button" variant="outline" size="xs" onClick={() => setItems(p => [...p, { ...EMPTY_ITEM }])}>
                  <Plus className="size-3" /> Add Item
                </Button>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Item', 'Description', 'Qty', 'Price', 'Amount', ''].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1.5">
                          <input className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Item name" value={it.item} onChange={e => setItem(idx, 'item', e.target.value)} required />
                        </td>
                        <td className="px-2 py-1.5">
                          <input className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Description" value={it.description ?? ''} onChange={e => setItem(idx, 'description', e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5 w-20">
                          <input type="number" min="1" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={it.qty} onChange={e => setItem(idx, 'qty', parseFloat(e.target.value) || 1)} />
                        </td>
                        <td className="px-2 py-1.5 w-28">
                          <input type="number" min="0" step="0.01" className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={it.price} onChange={e => setItem(idx, 'price', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="px-3 py-1.5 text-[13px] font-semibold text-foreground tabular-nums w-28">{fmt(it.qty * it.price)}</td>
                        <td className="px-2 py-1.5">
                          {items.length > 1 && (
                            <button type="button" onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                              className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <X className="size-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground shrink-0">Discount ($)</span>
                  <input type="number" min="0" step="0.01"
                    className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.discount} onChange={e => setForm(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground shrink-0">Tax ($)</span>
                  <input type="number" min="0" step="0.01"
                    className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.tax} onChange={e => setForm(p => ({ ...p, tax: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span className="text-foreground">Grand Total</span>
                  <span className="text-primary">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>

            <Textarea label="Notes" placeholder="Payment terms, notes..." value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={isPending}>{existing ? 'Update Invoice' : 'Create Invoice'}</Button>
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
        <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
        <DialogBody><p className="text-sm text-muted-foreground">This action cannot be undone. The invoice will be permanently deleted.</p></DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="sm" loading={loading} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Invoice | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const params = useMemo(() => ({ search: search || undefined, status: status || undefined, page, limit: 15 }), [search, status, page]);
  const { data, isLoading } = useInvoices(params);
  const { data: clientsData } = useFinanceClients({ limit: 100 });
  const { mutate: deleteInv, isPending: deleting_ } = useDeleteInvoice();
  const { mutate: duplicate } = useDuplicateInvoice();
  const { mutate: markPaid } = useMarkInvoicePaid();

  const invoices: Invoice[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;
  const clients: FinanceClient[] = Array.isArray(clientsData) ? clientsData : Array.isArray(clientsData?.data) ? clientsData.data : [];

  const summaryStats = [
    { label: 'Total',    count: meta?.total ?? 0,                                                    color: 'text-foreground' },
    { label: 'Paid',     count: invoices.filter(i => i.status === 'paid').length,                    color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Pending',  count: invoices.filter(i => ['sent','viewed'].includes(i.status)).length,   color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Overdue',  count: invoices.filter(i => i.status === 'overdue').length,                 color: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage client invoices"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Invoices' }]}
        eyebrow="Finance"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
            <Plus className="size-4" strokeWidth={2.5} /> New Invoice
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map(s => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn('text-2xl font-bold tabular-nums mt-1', s.color)}>{s.count}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              placeholder="Search by invoice number, client, project..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="h-10 rounded-xl border border-border bg-card px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-40"
            value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(search || status) && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
              <X className="size-3.5" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Invoice #', 'Client', 'Project', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="size-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">No invoices found</p>
                      <Button size="sm" onClick={() => { setEditing(undefined); setShowDialog(true); }}>
                        <Plus className="size-4" /> Create Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : invoices.map((inv, i) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-muted shrink-0">
                        <FileText className="size-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground">{inv.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-foreground">{(inv as any).client?.companyName ?? '—'}</p>
                    <p className="text-[11px] text-muted-foreground">{(inv as any).client?.email ?? ''}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{inv.project ?? '—'}</td>
                  <td className="px-5 py-3.5 font-bold text-[13px] text-foreground tabular-nums">{fmt(inv.grandTotal)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_CFG[inv.status]?.variant ?? 'muted'} dot>{STATUS_CFG[inv.status]?.label ?? inv.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button size="icon-xs" variant="ghost" title="Edit" onClick={() => { setEditing(inv); setShowDialog(true); }}>
                        <Eye className="size-3.5" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" title="Duplicate" onClick={() => duplicate(inv.id)}>
                        <Copy className="size-3.5" />
                      </Button>
                      {inv.status !== 'paid' && (
                        <Button size="icon-xs" variant="ghost" title="Mark Paid" onClick={() => markPaid(inv.id)}
                          className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                          <CheckCircle className="size-3.5" />
                        </Button>
                      )}
                      <Button size="icon-xs" variant="ghost" title="Download PDF">
                        <Download className="size-3.5" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" title="Delete"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(inv.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      <InvoiceDialog open={showDialog} onClose={() => setShowDialog(false)} existing={editing} clients={clients} />
      <DeleteConfirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        loading={deleting_}
        onConfirm={() => deleting && deleteInv(deleting, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
