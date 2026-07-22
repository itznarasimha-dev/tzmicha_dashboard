import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Clock, Users,
  ArrowUpRight, ArrowDownRight, Plus, FileText, Receipt, BarChart2, Settings,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { cn, formatCurrency, formatRelativeTime } from '@/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  useFinanceDashboard, useFinanceMonthlyAnalytics, useFinanceExpenseBreakdown,
  useOpeningBalance, useSetOpeningBalance,
} from '@/hooks';
import type { FinanceDashboardData } from '@/types';

const INV_STATUS: Record<string, { variant: any; label: string }> = {
  draft:     { variant: 'muted',     label: 'Draft'     },
  sent:      { variant: 'blue',      label: 'Sent'      },
  viewed:    { variant: 'violet',    label: 'Viewed'    },
  paid:      { variant: 'success',   label: 'Paid'      },
  overdue:   { variant: 'danger',    label: 'Overdue'   },
  cancelled: { variant: 'secondary', label: 'Cancelled' },
};

const PIE_COLORS = ['#0EA5A4','#14B8A6','#06b6d4','#6366f1','#f59e0b','#22c55e','#ef4444','#f97316'];
const fmt = (n: number) => formatCurrency(n);
const fmtK = (v: number) => `₹${(v / 1000).toFixed(0)}k`;
const TT_STYLE = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

function OpeningBalanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: ob } = useOpeningBalance();
  const { mutate, isPending } = useSetOpeningBalance();
  const [val, setVal] = useState('');

  useEffect(() => { if (open) setVal(''); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Set Opening Balance</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">Current: <span className="font-semibold text-foreground">{fmt(ob?.amount ?? 0)}</span></p>
          <Input label="New Opening Balance (₹)" type="number" placeholder="0.00" value={val} onChange={e => setVal(e.target.value)} />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={isPending} onClick={() => mutate(parseFloat(val) || 0, { onSuccess: onClose })}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FinanceDashboard() {
  const navigate = useNavigate();
  const [obOpen, setObOpen] = useState(false);
  const year = new Date().getFullYear();

  const { data: dash, isLoading } = useFinanceDashboard();
  const { data: monthly = [] } = useFinanceMonthlyAnalytics(year);
  const { data: expBreakdown = [] } = useFinanceExpenseBreakdown();

  const d = dash as FinanceDashboardData | undefined;

  const kpis = [
    { label: 'Current Balance',  value: fmt(d?.currentBalance ?? 0),      icon: <Wallet className="size-5" />,       color: 'text-teal-600 dark:text-teal-400',       bg: 'bg-teal-50 dark:bg-teal-950/30',       sub: 'Opening + Received − Expenses' },
    { label: 'Total Revenue',    value: fmt(d?.revenue ?? 0),              icon: <TrendingUp className="size-5" />,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', sub: 'Paid invoices' },
    { label: 'Total Expenses',   value: fmt(d?.totalExpenses ?? 0),        icon: <TrendingDown className="size-5" />, color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30',         sub: 'Expenses + Payroll' },
    { label: 'Net Profit',       value: fmt(d?.netProfit ?? 0),            icon: <DollarSign className="size-5" />,   color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/30',   sub: 'Revenue − Expenses' },
    { label: 'Pending Invoices', value: fmt(d?.pendingInvoiceAmount ?? 0), icon: <Clock className="size-5" />,        color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30',     sub: `${d?.pendingInvoiceCount ?? 0} invoices` },
    { label: 'Monthly Payroll',  value: fmt(d?.monthlyPayroll ?? 0),       icon: <Users className="size-5" />,        color: 'text-cyan-600 dark:text-cyan-400',       bg: 'bg-cyan-50 dark:bg-cyan-950/30',       sub: 'This month' },
    { label: 'Active Budgets',   value: d?.activeBudgets ?? 0,             icon: <BarChart2 className="size-5" />,    color: 'text-teal-600 dark:text-teal-400',       bg: 'bg-teal-50 dark:bg-teal-950/30',       sub: 'Departments' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Dashboard"
        description="Complete overview of company financial health"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Dashboard' }]}
        eyebrow="Finance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setObOpen(true)}>
              <Settings className="size-3.5" /> Opening Balance
            </Button>
            <Button size="sm" onClick={() => navigate('/finance/invoices')}>
              <Plus className="size-4" strokeWidth={2.5} /> New Invoice
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            {isLoading ? <CardSkeleton /> : (
              <Card padding="md" className="flex flex-col gap-3">
                <div className={cn('flex size-10 items-center justify-center rounded-xl shrink-0', k.bg, k.color)}>{k.icon}</div>
                <div>
                  <p className={cn('text-xl font-bold tabular-nums tracking-tight', k.color)}>{k.value}</p>
                  <p className="text-[12px] font-semibold text-foreground mt-0.5">{k.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Invoice',    icon: <FileText className="size-4" />,   path: '/finance/invoices' },
          { label: 'Record Expense', icon: <Receipt className="size-4" />,    path: '/finance/expenses' },
          { label: 'Record Payment', icon: <DollarSign className="size-4" />, path: '/finance/payments' },
          { label: 'Reports',        icon: <BarChart2 className="size-4" />,  path: '/finance/reports'  },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-border-strong transition-all duration-150 text-left group">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#0EA5A4]/10 dark:bg-[#0EA5A4]/20 text-[#0EA5A4] group-hover:bg-[#0EA5A4]/20 dark:group-hover:bg-[#0EA5A4]/30 transition-colors shrink-0">
              {a.icon}
            </div>
            <span className="text-[13px] font-semibold text-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="none" className="lg:col-span-2">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Revenue vs Expenses</CardTitle><CardDescription>Monthly comparison — {year}</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-4 pb-2 px-2">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={fmtK} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revG)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expG)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Expense Categories</CardTitle><CardDescription>Approved expenses breakdown</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={expBreakdown} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="total" nameKey="category">
                  {expBreakdown.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 px-1 mt-1 max-h-28 overflow-y-auto no-scrollbar">
              {expBreakdown.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-4">No expense data</p>
                : expBreakdown.map((e: any, i: number) => (
                  <div key={e.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground capitalize">{e.category}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fmt(e.total)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Bar + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Monthly Profit</CardTitle><CardDescription>Net profit per month</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-4 pb-2 px-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={fmtK} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                <Bar dataKey="profit" fill="#6366f1" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card padding="none" className="lg:col-span-2">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between w-full">
              <div><CardTitle>Recent Invoices</CardTitle><CardDescription>Latest invoice activity</CardDescription></div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/finance/invoices')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !d?.recentInvoices?.length ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <FileText className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border mt-1">
                {d.recentInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                      <FileText className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{inv.invoiceNumber}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{(inv as any).client?.companyName ?? '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-foreground tabular-nums">{fmt(inv.grandTotal)}</p>
                      <Badge variant={INV_STATUS[inv.status]?.variant ?? 'muted'} dot className="text-[10px]">
                        {INV_STATUS[inv.status]?.label ?? inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between w-full">
              <div><CardTitle>Latest Payments</CardTitle><CardDescription>Recent payment records</CardDescription></div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/finance/payments')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !d?.recentPayments?.length ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <DollarSign className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No payments yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border mt-1">
                {d.recentPayments.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0',
                      p.status === 'received' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted'
                    )}>
                      {p.status === 'received'
                        ? <ArrowUpRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        : <Clock className="size-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{(p as any).invoice?.client?.companyName ?? 'Direct Payment'}</p>
                      <p className="text-[11px] text-muted-foreground">{formatRelativeTime(p.paymentDate)}</p>
                    </div>
                    <p className={cn('text-[13px] font-bold tabular-nums shrink-0',
                      p.status === 'received' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    )}>{fmt(p.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between w-full">
              <div><CardTitle>Latest Expenses</CardTitle><CardDescription>Recent expense records</CardDescription></div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/finance/expenses')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !d?.recentExpenses?.length ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Receipt className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No expenses yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border mt-1">
                {d.recentExpenses.map(e => (
                  <div key={e.id} className="flex items-center gap-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
                      <ArrowDownRight className="size-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{e.category}</p>
                    </div>
                    <p className="text-[13px] font-bold text-red-600 dark:text-red-400 tabular-nums shrink-0">-{fmt(e.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OpeningBalanceDialog open={obOpen} onClose={() => setObOpen(false)} />
    </div>
  );
}
