import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Mail, MessageSquare, Phone,
  DollarSign, Users, Target, Percent, ArrowUpRight, ArrowDownRight,
  Download, Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AreaChartComponent, BarChartComponent, DonutChart } from '@/components/charts/Charts';
import { cn, formatCurrency, formatNumber } from '@/utils';

type ReportTab = 'campaign' | 'lead_source' | 'roi' | 'email' | 'whatsapp' | 'sms' | 'ai_voice' | 'revenue';

const TABS: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
  { key: 'campaign',    label: 'Campaign Performance', icon: <BarChart3 className="size-3.5" /> },
  { key: 'lead_source', label: 'Lead Source Analysis', icon: <Users className="size-3.5" /> },
  { key: 'roi',         label: 'ROI',                  icon: <TrendingUp className="size-3.5" /> },
  { key: 'email',       label: 'Email Analytics',      icon: <Mail className="size-3.5" /> },
  { key: 'whatsapp',    label: 'WhatsApp Analytics',   icon: <MessageSquare className="size-3.5" /> },
  { key: 'sms',         label: 'SMS Analytics',        icon: <MessageSquare className="size-3.5" /> },
  { key: 'ai_voice',    label: 'AI Voice Analytics',   icon: <Phone className="size-3.5" /> },
  { key: 'revenue',     label: 'Revenue Reports',      icon: <DollarSign className="size-3.5" /> },
];

const campaignPerfData = [
  { label: 'Jan', sent: 42000, delivered: 41200, opened: 18400, clicked: 4200, converted: 380 },
  { label: 'Feb', sent: 58000, delivered: 57100, opened: 24800, clicked: 5900, converted: 520 },
  { label: 'Mar', sent: 74000, delivered: 72800, opened: 31200, clicked: 7100, converted: 710 },
  { label: 'Apr', sent: 62000, delivered: 61000, opened: 26400, clicked: 5800, converted: 580 },
  { label: 'May', sent: 89000, delivered: 87400, opened: 38200, clicked: 9400, converted: 940 },
  { label: 'Jun', sent: 104000, delivered: 102100, opened: 44800, clicked: 11200, converted: 1120 },
  { label: 'Jul', sent: 98000, delivered: 96200, opened: 41400, clicked: 10800, converted: 1080 },
];

const campaignRows = [
  { name: 'Q3 Flash Sale Blast',      channel: 'WhatsApp', sent: 48200, delivered: 47100, opened: 42800, clicked: 12400, converted: 1840, roi: '3.2x' },
  { name: 'New User Onboarding',      channel: 'Email',    sent: 8400,  delivered: 8200,  opened: 5900,  clicked: 3200,  converted: 980,  roi: '4.8x' },
  { name: 'Abandoned Cart Recovery',  channel: 'SMS',      sent: 18400, delivered: 18100, opened: 18100, clicked: 6200,  converted: 720,  roi: '2.9x' },
  { name: 'Product Launch — RCS',     channel: 'RCS',      sent: 42000, delivered: 41200, opened: 34800, clicked: 8200,  converted: 1240, roi: '2.1x' },
  { name: 'Re-engagement Voice',      channel: 'AI Voice', sent: 2840,  delivered: 1920,  opened: 1920,  clicked: 0,     converted: 284,  roi: '1.8x' },
];

const leadSourceDonut = [
  { name: 'Organic Search', value: 3840, color: '#6366f1' },
  { name: 'WhatsApp',       value: 2910, color: '#10b981' },
  { name: 'Email',          value: 2140, color: '#f59e0b' },
  { name: 'SMS',            value: 1820, color: '#3b82f6' },
  { name: 'Paid Ads',       value: 1240, color: '#8b5cf6' },
  { name: 'Referral',       value: 890,  color: '#ec4899' },
  { name: 'LinkedIn',       value: 620,  color: '#06b6d4' },
  { name: 'Cold Call',      value: 380,  color: '#f97316' },
];

const leadSourceRows = [
  { source: 'Organic Search', leads: 3840, qualified: 1420, won: 284, convRate: '7.4%', avgValue: '$18,400' },
  { source: 'WhatsApp',       leads: 2910, qualified: 980,  won: 196, convRate: '6.7%', avgValue: '$14,200' },
  { source: 'Email',          leads: 2140, qualified: 820,  won: 164, convRate: '7.7%', avgValue: '$22,100' },
  { source: 'SMS',            leads: 1820, qualified: 540,  won: 108, convRate: '5.9%', avgValue: '$9,800' },
  { source: 'Paid Ads',       leads: 1240, qualified: 480,  won: 96,  convRate: '7.7%', avgValue: '$28,400' },
  { source: 'Referral',       leads: 890,  qualified: 420,  won: 84,  convRate: '9.4%', avgValue: '$32,000' },
];

const leadTrendData = [
  { label: 'Jan', value: 1240, qualified: 420 },
  { label: 'Feb', value: 1580, qualified: 580 },
  { label: 'Mar', value: 2100, qualified: 740 },
  { label: 'Apr', value: 1840, qualified: 620 },
  { label: 'May', value: 2480, qualified: 890 },
  { label: 'Jun', value: 2920, qualified: 1040 },
  { label: 'Jul', value: 2680, qualified: 980 },
];

const roiData = [
  { label: 'Jan', spend: 12000, revenue: 38400 },
  { label: 'Feb', spend: 15000, revenue: 51000 },
  { label: 'Mar', spend: 18000, revenue: 63000 },
  { label: 'Apr', spend: 14000, revenue: 46200 },
  { label: 'May', spend: 22000, revenue: 79200 },
  { label: 'Jun', spend: 26000, revenue: 98800 },
  { label: 'Jul', spend: 24000, revenue: 91200 },
];

const roiByChannel = [
  { channel: 'Email',    spend: 4200,  revenue: 28400, roi: 6.8 },
  { channel: 'WhatsApp', spend: 8400,  revenue: 42100, roi: 5.0 },
  { channel: 'SMS',      spend: 3600,  revenue: 14400, roi: 4.0 },
  { channel: 'RCS',      spend: 5800,  revenue: 19720, roi: 3.4 },
  { channel: 'AI Voice', spend: 2000,  revenue: 5800,  roi: 2.9 },
  { channel: 'Paid Ads', spend: 12000, revenue: 28800, roi: 2.4 },
];

const emailData = [
  { label: 'Jan', sent: 42000, opened: 11760, clicked: 2940, bounced: 420, unsubscribed: 84 },
  { label: 'Feb', sent: 48000, opened: 14400, clicked: 3840, bounced: 480, unsubscribed: 96 },
  { label: 'Mar', sent: 54000, opened: 16740, clicked: 4320, bounced: 540, unsubscribed: 108 },
  { label: 'Apr', sent: 46000, opened: 13340, clicked: 3220, bounced: 460, unsubscribed: 92 },
  { label: 'May', sent: 62000, opened: 19840, clicked: 5580, bounced: 620, unsubscribed: 124 },
  { label: 'Jun', sent: 74000, opened: 24420, clicked: 7400, bounced: 740, unsubscribed: 148 },
  { label: 'Jul', sent: 68000, opened: 21760, clicked: 6120, bounced: 680, unsubscribed: 136 },
];

const whatsappData = [
  { label: 'Jan', sent: 28000, delivered: 27440, read: 21560, replied: 4200 },
  { label: 'Feb', sent: 34000, delivered: 33320, read: 26520, replied: 5440 },
  { label: 'Mar', sent: 42000, delivered: 41160, read: 32760, replied: 6720 },
  { label: 'Apr', sent: 38000, delivered: 37240, read: 28880, replied: 5700 },
  { label: 'May', sent: 52000, delivered: 50960, read: 40560, replied: 8320 },
  { label: 'Jun', sent: 64000, delivered: 62720, read: 50560, replied: 10240 },
  { label: 'Jul', sent: 58000, delivered: 56840, read: 45240, replied: 9280 },
];

const smsData = [
  { label: 'Jan', sent: 84000, delivered: 82320, failed: 1680, pending: 0 },
  { label: 'Feb', sent: 96000, delivered: 94080, failed: 1920, pending: 0 },
  { label: 'Mar', sent: 112000, delivered: 109760, failed: 2240, pending: 0 },
  { label: 'Apr', sent: 98000, delivered: 96040, failed: 1960, pending: 0 },
  { label: 'May', sent: 128000, delivered: 125440, failed: 2560, pending: 0 },
  { label: 'Jun', sent: 148000, delivered: 145040, failed: 2960, pending: 0 },
  { label: 'Jul', sent: 136000, delivered: 133280, failed: 2720, pending: 0 },
];

const aiVoiceData = [
  { label: 'Jan', calls: 840,  answered: 588,  converted: 84 },
  { label: 'Feb', calls: 1120, answered: 784,  converted: 112 },
  { label: 'Mar', calls: 1480, answered: 1036, converted: 148 },
  { label: 'Apr', calls: 1240, answered: 868,  converted: 124 },
  { label: 'May', calls: 1840, answered: 1288, converted: 184 },
  { label: 'Jun', calls: 2240, answered: 1568, converted: 224 },
  { label: 'Jul', calls: 2040, answered: 1428, converted: 204 },
];

const revenueData = [
  { label: 'Jan', mrr: 42000, arr: 504000, newRevenue: 8400 },
  { label: 'Feb', mrr: 51000, arr: 612000, newRevenue: 9000 },
  { label: 'Mar', mrr: 58000, arr: 696000, newRevenue: 7000 },
  { label: 'Apr', mrr: 54000, arr: 648000, newRevenue: 6000 },
  { label: 'May', mrr: 67000, arr: 804000, newRevenue: 13000 },
  { label: 'Jun', mrr: 78000, arr: 936000, newRevenue: 11000 },
  { label: 'Jul', mrr: 84200, arr: 1010400, newRevenue: 6200 },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('campaign');
  const [dateRange, setDateRange] = useState('last_7_months');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Comprehensive analytics across all marketing channels"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Reports' }]}
        actions={
          <div className="flex gap-2">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none">
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_7_months">Last 7 Months</option>
              <option value="this_year">This Year</option>
            </select>
            <Button size="md" variant="outline"><Download className="size-4" /> Export</Button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === t.key
                ? 'border-rose-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Campaign Performance ── */}
      {activeTab === 'campaign' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Sent',    value: formatNumber(campaignPerfData.reduce((s, d) => s + d.sent, 0)),      up: true,  change: '+18%' },
              { label: 'Total Opened',  value: formatNumber(campaignPerfData.reduce((s, d) => s + d.opened, 0)),    up: true,  change: '+22%' },
              { label: 'Total Clicked', value: formatNumber(campaignPerfData.reduce((s, d) => s + d.clicked, 0)),   up: true,  change: '+15%' },
              { label: 'Conversions',   value: formatNumber(campaignPerfData.reduce((s, d) => s + d.converted, 0)), up: true,  change: '+24%' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
                  <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold mt-1', k.up ? 'text-emerald-600' : 'text-red-500')}>
                    {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{k.change}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">Messages Sent vs Conversions</p>
            <p className="text-xs text-muted-foreground mb-4">Last 7 months across all channels</p>
            <AreaChartComponent
              data={campaignPerfData}
              series={[
                { key: 'sent',      label: 'Sent',        color: '#6366f1' },
                { key: 'opened',    label: 'Opened',      color: '#10b981' },
                { key: 'converted', label: 'Converted',   color: '#f59e0b' },
              ]}
              height={220}
            />
          </Card>
          <Card padding="none">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Campaign Breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Campaign', 'Channel', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Converted', 'ROI'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaignRows.map((r, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3"><Badge variant="muted" className="text-[10px]">{r.channel}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.sent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold tabular-nums">{r.delivered.toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold tabular-nums">{r.opened.toLocaleString()}</td>
                      <td className="px-4 py-3 text-violet-600 font-semibold tabular-nums">{r.clicked.toLocaleString()}</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold tabular-nums">{r.converted.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{r.roi}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Lead Source Analysis ── */}
      {activeTab === 'lead_source' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card padding="lg" className="lg:col-span-2">
              <p className="text-sm font-bold text-foreground mb-1">Lead Trend</p>
              <p className="text-xs text-muted-foreground mb-4">Total leads vs qualified leads</p>
              <AreaChartComponent
                data={leadTrendData}
                series={[
                  { key: 'value',     label: 'Total Leads',     color: '#6366f1' },
                  { key: 'qualified', label: 'Qualified Leads',  color: '#10b981' },
                ]}
                height={200}
              />
            </Card>
            <Card padding="lg">
              <p className="text-sm font-bold text-foreground mb-1">Leads by Source</p>
              <p className="text-xs text-muted-foreground mb-4">Traffic origin breakdown</p>
              <DonutChart data={leadSourceDonut} height={180} showLegend />
            </Card>
          </div>
          <Card padding="none">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Source Performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Source', 'Total Leads', 'Qualified', 'Won', 'Conv. Rate', 'Avg Deal Value'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leadSourceRows.map((r, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">{r.source}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.leads.toLocaleString()}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold tabular-nums">{r.qualified.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold tabular-nums">{r.won}</td>
                      <td className="px-4 py-3 font-bold text-violet-600">{r.convRate}</td>
                      <td className="px-4 py-3 font-bold text-amber-600">{r.avgValue}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── ROI ── */}
      {activeTab === 'roi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Spend',   value: formatCurrency(roiData.reduce((s, d) => s + d.spend, 0)),   color: 'text-red-600' },
              { label: 'Total Revenue', value: formatCurrency(roiData.reduce((s, d) => s + d.revenue, 0)), color: 'text-emerald-600' },
              { label: 'Overall ROI',   value: (roiData.reduce((s, d) => s + d.revenue, 0) / roiData.reduce((s, d) => s + d.spend, 0)).toFixed(1) + 'x', color: 'text-violet-600' },
              { label: 'Best Channel',  value: 'Email (6.8x)',  color: 'text-amber-600' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">Spend vs Revenue</p>
            <p className="text-xs text-muted-foreground mb-4">Monthly marketing spend vs attributed revenue</p>
            <AreaChartComponent
              data={roiData}
              series={[
                { key: 'revenue', label: 'Revenue', color: '#10b981' },
                { key: 'spend',   label: 'Spend',   color: '#ef4444' },
              ]}
              height={220}
            />
          </Card>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-4">ROI by Channel</p>
            <div className="space-y-3">
              {roiByChannel.map((r, i) => (
                <motion.div key={r.channel} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-foreground w-20 shrink-0">{r.channel}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(r.roi / 7) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-violet-600 w-10 text-right shrink-0">{r.roi}x</span>
                  <span className="text-xs text-muted-foreground w-24 text-right shrink-0 hidden sm:block">
                    {formatCurrency(r.spend)} → {formatCurrency(r.revenue)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Email Analytics ── */}
      {activeTab === 'email' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Sent',          value: formatNumber(emailData.reduce((s, d) => s + d.sent, 0)),          color: 'text-foreground' },
              { label: 'Opened',        value: formatNumber(emailData.reduce((s, d) => s + d.opened, 0)),        color: 'text-emerald-600' },
              { label: 'Clicked',       value: formatNumber(emailData.reduce((s, d) => s + d.clicked, 0)),       color: 'text-blue-600' },
              { label: 'Bounced',       value: formatNumber(emailData.reduce((s, d) => s + d.bounced, 0)),       color: 'text-amber-600' },
              { label: 'Unsubscribed',  value: formatNumber(emailData.reduce((s, d) => s + d.unsubscribed, 0)),  color: 'text-red-600' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">Email Funnel Trend</p>
            <p className="text-xs text-muted-foreground mb-4">Sent → Opened → Clicked over time</p>
            <AreaChartComponent
              data={emailData}
              series={[
                { key: 'sent',    label: 'Sent',    color: '#6366f1' },
                { key: 'opened',  label: 'Opened',  color: '#10b981' },
                { key: 'clicked', label: 'Clicked', color: '#f59e0b' },
              ]}
              height={220}
            />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg Open Rate',        value: (emailData.reduce((s, d) => s + d.opened, 0) / emailData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%', color: 'text-emerald-600', desc: 'Industry avg: 21.3%' },
              { label: 'Avg Click Rate',       value: (emailData.reduce((s, d) => s + d.clicked, 0) / emailData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%', color: 'text-blue-600', desc: 'Industry avg: 2.6%' },
              { label: 'Avg Bounce Rate',      value: (emailData.reduce((s, d) => s + d.bounced, 0) / emailData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%', color: 'text-amber-600', desc: 'Industry avg: 0.7%' },
            ].map((k, i) => (
              <Card key={k.label} padding="md">
                <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                <p className={cn('text-3xl font-black mt-1', k.color)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{k.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── WhatsApp Analytics ── */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Sent',      value: formatNumber(whatsappData.reduce((s, d) => s + d.sent, 0)),      color: 'text-foreground' },
              { label: 'Delivered',       value: formatNumber(whatsappData.reduce((s, d) => s + d.delivered, 0)), color: 'text-emerald-600' },
              { label: 'Read',            value: formatNumber(whatsappData.reduce((s, d) => s + d.read, 0)),      color: 'text-blue-600' },
              { label: 'Replied',         value: formatNumber(whatsappData.reduce((s, d) => s + d.replied, 0)),   color: 'text-violet-600' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">WhatsApp Engagement Trend</p>
            <p className="text-xs text-muted-foreground mb-4">Sent → Delivered → Read → Replied</p>
            <AreaChartComponent
              data={whatsappData}
              series={[
                { key: 'sent',      label: 'Sent',      color: '#6366f1' },
                { key: 'delivered', label: 'Delivered', color: '#10b981' },
                { key: 'read',      label: 'Read',      color: '#3b82f6' },
                { key: 'replied',   label: 'Replied',   color: '#8b5cf6' },
              ]}
              height={220}
            />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg Delivery Rate', value: (whatsappData.reduce((s, d) => s + d.delivered, 0) / whatsappData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%', color: 'text-emerald-600' },
              { label: 'Avg Read Rate',     value: (whatsappData.reduce((s, d) => s + d.read, 0) / whatsappData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%',      color: 'text-blue-600' },
              { label: 'Avg Reply Rate',    value: (whatsappData.reduce((s, d) => s + d.replied, 0) / whatsappData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%',   color: 'text-violet-600' },
            ].map((k) => (
              <Card key={k.label} padding="md">
                <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                <p className={cn('text-3xl font-black mt-1', k.color)}>{k.value}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── SMS Analytics ── */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Sent',      value: formatNumber(smsData.reduce((s, d) => s + d.sent, 0)),      color: 'text-foreground' },
              { label: 'Delivered',       value: formatNumber(smsData.reduce((s, d) => s + d.delivered, 0)), color: 'text-emerald-600' },
              { label: 'Failed',          value: formatNumber(smsData.reduce((s, d) => s + d.failed, 0)),    color: 'text-red-600' },
              { label: 'Delivery Rate',   value: (smsData.reduce((s, d) => s + d.delivered, 0) / smsData.reduce((s, d) => s + d.sent, 0) * 100).toFixed(1) + '%', color: 'text-violet-600' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">SMS Delivery Trend</p>
            <p className="text-xs text-muted-foreground mb-4">Sent vs Delivered vs Failed — last 7 months</p>
            <BarChartComponent
              data={smsData}
              series={[
                { key: 'delivered', label: 'Delivered', color: '#10b981' },
                { key: 'failed',    label: 'Failed',    color: '#ef4444' },
              ]}
              height={220}
            />
          </Card>
        </div>
      )}

      {/* ── AI Voice Analytics ── */}
      {activeTab === 'ai_voice' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Calls',   value: formatNumber(aiVoiceData.reduce((s, d) => s + d.calls, 0)),     color: 'text-foreground' },
              { label: 'Answered',      value: formatNumber(aiVoiceData.reduce((s, d) => s + d.answered, 0)),  color: 'text-emerald-600' },
              { label: 'Converted',     value: formatNumber(aiVoiceData.reduce((s, d) => s + d.converted, 0)), color: 'text-violet-600' },
              { label: 'Answer Rate',   value: (aiVoiceData.reduce((s, d) => s + d.answered, 0) / aiVoiceData.reduce((s, d) => s + d.calls, 0) * 100).toFixed(1) + '%', color: 'text-blue-600' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">AI Voice Call Trend</p>
            <p className="text-xs text-muted-foreground mb-4">Calls made vs answered vs converted</p>
            <BarChartComponent
              data={aiVoiceData}
              series={[
                { key: 'calls',     label: 'Calls Made', color: '#6366f1' },
                { key: 'answered',  label: 'Answered',   color: '#10b981' },
                { key: 'converted', label: 'Converted',  color: '#f59e0b' },
              ]}
              height={220}
            />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card padding="md">
              <p className="text-xs text-muted-foreground font-medium">Conversion Rate</p>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {(aiVoiceData.reduce((s, d) => s + d.converted, 0) / aiVoiceData.reduce((s, d) => s + d.calls, 0) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Calls → Converted leads</p>
            </Card>
            <Card padding="md">
              <p className="text-xs text-muted-foreground font-medium">Best Month</p>
              <p className="text-3xl font-black text-violet-600 mt-1">Jun</p>
              <p className="text-[10px] text-muted-foreground mt-1">2,240 calls · 224 conversions</p>
            </Card>
          </div>
        </div>
      )}

      {/* ── Revenue Reports ── */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Current MRR',   value: formatCurrency(84200),   color: 'text-emerald-600', change: '+8.0%',  up: true },
              { label: 'ARR',           value: formatCurrency(1010400),  color: 'text-blue-600',    change: '+18.4%', up: true },
              { label: 'New Revenue',   value: formatCurrency(revenueData.reduce((s, d) => s + d.newRevenue, 0)), color: 'text-violet-600', change: '+12%', up: true },
              { label: 'MoM Growth',    value: '8.0%',                  color: 'text-amber-600',   change: '+3.2%',  up: true },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="md">
                  <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', k.color)}>{k.value}</p>
                  <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold mt-1', k.up ? 'text-emerald-600' : 'text-red-500')}>
                    {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{k.change}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-1">MRR Growth</p>
            <p className="text-xs text-muted-foreground mb-4">Monthly recurring revenue attributed to marketing</p>
            <AreaChartComponent
              data={revenueData}
              series={[
                { key: 'mrr',        label: 'MRR',         color: '#8b5cf6' },
                { key: 'newRevenue', label: 'New Revenue',  color: '#10b981' },
              ]}
              height={220}
            />
          </Card>
          <Card padding="lg">
            <p className="text-sm font-bold text-foreground mb-4">Monthly Revenue Breakdown</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Month', 'MRR', 'ARR', 'New Revenue', 'MoM Growth'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {revenueData.map((r, i) => {
                    const prev = revenueData[i - 1];
                    const growth = prev ? (((r.mrr - prev.mrr) / prev.mrr) * 100).toFixed(1) : '—';
                    const isUp = prev ? r.mrr >= prev.mrr : true;
                    return (
                      <motion.tr key={r.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{r.label}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 tabular-nums">{formatCurrency(r.mrr)}</td>
                        <td className="px-4 py-3 text-blue-600 font-semibold tabular-nums">{formatCurrency(r.arr)}</td>
                        <td className="px-4 py-3 text-violet-600 font-semibold tabular-nums">{formatCurrency(r.newRevenue)}</td>
                        <td className="px-4 py-3">
                          {growth !== '—' ? (
                            <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', isUp ? 'text-emerald-600' : 'text-red-500')}>
                              {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{growth}%
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
