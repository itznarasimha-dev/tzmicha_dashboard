import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, FileText, BarChart2, PieChart as PieChartIcon,
  TrendingUp, Calendar, Filter, Printer,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency } from '@/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useFinanceReports } from '@/hooks';
import type { FinanceReportSummary } from '@/types';

const fmt = (n: number) => formatCurrency(n);
const TT_STYLE = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };
const PIE_COLORS = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#10b981'];

const REPORT_CARDS = [
  { id: 'revenue',   title: 'Revenue Report',       desc: 'Total revenue from paid invoices',         type: 'financial', icon: <TrendingUp className="size-5" />,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { id: 'expense',   title: 'Expense Report',        desc: 'Detailed breakdown by category',           type: 'expense',   icon: <BarChart2 className="size-5" />,     color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { id: 'pnl',       title: 'Profit & Loss',         desc: 'Revenue minus all expenses',               type: 'financial', icon: <FileText className="size-5" />,      color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'payroll',   title: 'Payroll Report',        desc: 'Salary disbursements and deductions',      type: 'payroll',   icon: <FileText className="size-5" />,      color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { id: 'budget',    title: 'Budget Report',         desc: 'Allocated vs actual spend per department', type: 'budget',    icon: <PieChartIcon className="size-5" />,  color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'monthly',   title: 'Monthly Summary',       desc: 'Month-by-month financial overview',        type: 'summary',   icon: <Calendar className="size-5" />,      color: 'text-cyan-600 dark:text-cyan-400',       bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
];

const TYPE_BADGE: Record<string, any> = {
  financial: 'blue', expense: 'danger', payroll: 'success', budget: 'warning', summary: 'violet',
};

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState<string | null>(null);

  const params = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    year,
  };

  const { data, isLoading } = useFinanceReports(params);
  const report = data as FinanceReportSummary | undefined;

  function handleDownload(id: string) {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1200);
  }

  const summaryKpis = [
    { label: 'Total Revenue',  value: fmt(report?.revenue?.total ?? 0),  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Total Expenses', value: fmt(report?.expenses?.total ?? 0), color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Payroll',        value: fmt(report?.payroll?.total ?? 0),  color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Net Profit',     value: fmt(report?.profit ?? 0),          color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30' },
  ];

  const budgetChartData = (report?.budgets ?? []).map(b => ({
    name: b.department,
    allocated: b.allocated,
    used: b.used,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download financial reports"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Reports' }]}
        eyebrow="Finance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print
            </Button>
            <Button size="sm" onClick={() => handleDownload('all')}>
              <Download className="size-4" strokeWidth={2.5} /> Export All
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <Filter className="size-3.5" /> Filters
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-muted-foreground" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-36" />
          <span className="text-xs text-muted-foreground">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Year:</span>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="h-9 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-24">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="outline" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</Button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryKpis.map(k => (
          <Card key={k.label} padding="md">
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <>
                <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                <p className={cn('text-xl font-bold tabular-nums mt-1', k.color)}>{k.value}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORT_CARDS.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card padding="lg" hover className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={cn('flex size-10 items-center justify-center rounded-xl shrink-0', r.bg, r.color)}>
                  {r.icon}
                </div>
                <Badge variant={TYPE_BADGE[r.type] ?? 'muted'}>{r.type}</Badge>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-foreground leading-snug">{r.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button onClick={() => handleDownload(r.id + '-pdf')} disabled={downloading === r.id + '-pdf'}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-60 flex-1 justify-center">
                  {downloading === r.id + '-pdf'
                    ? <><span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Downloading...</>
                    : <><Download className="size-3.5" /> PDF</>}
                </button>
                <button onClick={() => handleDownload(r.id + '-xlsx')} disabled={downloading === r.id + '-xlsx'}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-60 flex-1 justify-center">
                  {downloading === r.id + '-xlsx'
                    ? <><span className="size-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Downloading...</>
                    : <><Download className="size-3.5" /> Excel</>}
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="none" className="lg:col-span-2">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Annual Revenue & Expenses</CardTitle><CardDescription>Monthly trend — {year}</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-4 pb-2 px-2">
            {isLoading ? <Skeleton className="h-[230px] w-full" /> : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={report?.monthly ?? []}>
                  <defs>
                    <linearGradient id="rptRevG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rptExpG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rptRevG)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#rptExpG)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card padding="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div><CardTitle>Budget Utilization</CardTitle><CardDescription>Allocated vs used</CardDescription></div>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : budgetChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-sm text-muted-foreground">No budget data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={budgetChartData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="used" nameKey="name">
                    {budgetChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5 px-1 mt-1 max-h-28 overflow-y-auto no-scrollbar">
              {budgetChartData.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{b.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{fmt(b.used)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Bar */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <div><CardTitle>Quarterly Performance</CardTitle><CardDescription>Revenue vs expenses by quarter — {year}</CardDescription></div>
        </CardHeader>
        <CardContent className="pt-4 pb-3 px-2">
          {isLoading ? <Skeleton className="h-[220px] w-full" /> : (() => {
            const monthly = report?.monthly ?? [];
            const quarters = [
              { quarter: 'Q1', months: monthly.slice(0, 3) },
              { quarter: 'Q2', months: monthly.slice(3, 6) },
              { quarter: 'Q3', months: monthly.slice(6, 9) },
              { quarter: 'Q4', months: monthly.slice(9, 12) },
            ].map(q => ({
              quarter: q.quarter,
              revenue: q.months.reduce((s, m) => s + m.revenue, 0),
              expenses: q.months.reduce((s, m) => s + m.expenses, 0),
            }));
            return (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quarters} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={TT_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
