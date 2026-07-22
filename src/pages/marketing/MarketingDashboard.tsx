import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, ArrowRight, Plus, Eye, MousePointer, Target,
  Users, Megaphone, MessageSquare, Mail, Bot,
  Percent, ArrowUpRight, ArrowDownRight, Activity,
  CheckCircle2, XCircle, PhoneCall, Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { AreaChartComponent, DonutChart } from '@/components/charts/Charts';
import { trafficData, channelData, revenueData } from '@/data/analytics';
import { UpcomingEventsCard } from '@/components/ui/UpcomingEventsCard';
import { TodayEventBanner } from '@/components/ui/TodayEventBanner';
import { useCampaigns } from '@/hooks';
import { cn, formatCurrency, formatNumber } from '@/utils';
import type { KPICard as KPICardType } from '@/types';

const kpiCards: KPICardType[] = [
  { id: 'k1', title: 'Total Impressions', value: 654200, change: 18, changeLabel: 'vs last month', trend: 'up', icon: 'impressions', color: 'blue',   sparkline: [420000, 480000, 510000, 560000, 600000, 654200] },
  { id: 'k2', title: 'Conversions',       value: 1449,   change: 24, changeLabel: 'vs last month', trend: 'up', icon: 'conversions', color: 'emerald', sparkline: [900, 1000, 1100, 1200, 1300, 1449] },
  { id: 'k3', title: 'Total Spend',       value: '$28.7K',change: 5,  changeLabel: 'vs last month', trend: 'up', icon: 'spend',       color: 'amber',   sparkline: [22000, 24000, 25000, 26000, 27000, 28700] },
  { id: 'k4', title: 'Avg ROI',           value: '2.9x', change: 8,  changeLabel: 'vs last month', trend: 'up', icon: 'roi',         color: 'violet',  sparkline: [2.1, 2.3, 2.5, 2.6, 2.8, 2.9] },
];

const kpiIcons = [
  <Eye className="size-5" />,
  <Target className="size-5" />,
  <DollarSign className="size-5" />,
  <TrendingUp className="size-5" />,
];

const miniKpis = [
  { label: 'Total Leads',         value: '12,840', change: '+18%', up: true,  icon: <Users className="size-5 text-blue-500" />,         bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { label: 'Qualified Leads',     value: '3,210',  change: '+12%', up: true,  icon: <CheckCircle2 className="size-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Active Campaigns',    value: '14',     change: '+3',   up: true,  icon: <Megaphone className="size-5 text-violet-500" />,    bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { label: 'Messages Sent Today', value: '48,200', change: '+22%', up: true,  icon: <MessageSquare className="size-5 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { label: 'Email Open Rate',     value: '28.4%',  change: '+2.1%',up: true,  icon: <Mail className="size-5 text-amber-500" />,          bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { label: 'WhatsApp Delivery',   value: '97.8%',  change: '+0.3%',up: true,  icon: <MessageSquare className="size-5 text-green-500" />,  bg: 'bg-green-50 dark:bg-green-950/20' },
  { label: 'SMS Delivery',        value: '96.2%',  change: '-0.4%',up: false, icon: <MessageSquare className="size-5 text-cyan-500" />,   bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
  { label: 'AI Conversations',    value: '2,140',  change: '+34%', up: true,  icon: <Bot className="size-5 text-rose-500" />,             bg: 'bg-rose-50 dark:bg-rose-950/20' },
  { label: 'Revenue Generated',   value: '$84.2K', change: '+9%',  up: true,  icon: <DollarSign className="size-5 text-emerald-600" />,   bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Conversion Rate',     value: '4.8%',   change: '+0.6%',up: true,  icon: <Percent className="size-5 text-violet-500" />,       bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { label: 'Monthly Growth',      value: '+18.4%', change: '+3.2%',up: true,  icon: <TrendingUp className="size-5 text-blue-500" />,      bg: 'bg-blue-50 dark:bg-blue-950/20' },
];

const leadsBySource = [
  { name: 'Organic Search', value: 3840, color: '#6366f1' },
  { name: 'WhatsApp',       value: 2910, color: '#10b981' },
  { name: 'Email',          value: 2140, color: '#f59e0b' },
  { name: 'SMS',            value: 1820, color: '#3b82f6' },
  { name: 'Paid Ads',       value: 1240, color: '#8b5cf6' },
  { name: 'Referral',       value: 890,  color: '#ec4899' },
];

const campaignPerf = [
  { label: 'Jan', value: 420,  conversions: 38 },
  { label: 'Feb', value: 580,  conversions: 52 },
  { label: 'Mar', value: 740,  conversions: 71 },
  { label: 'Apr', value: 620,  conversions: 58 },
  { label: 'May', value: 890,  conversions: 94 },
  { label: 'Jun', value: 1040, conversions: 112 },
  { label: 'Jul', value: 980,  conversions: 108 },
];

const revenueTrend = [
  { label: 'Jan', mrr: 42000 },
  { label: 'Feb', mrr: 51000 },
  { label: 'Mar', mrr: 58000 },
  { label: 'Apr', mrr: 54000 },
  { label: 'May', mrr: 67000 },
  { label: 'Jun', mrr: 78000 },
  { label: 'Jul', mrr: 84200 },
];

const dailyActivity = [
  { label: 'Mon', value: 8420 },
  { label: 'Tue', value: 11200 },
  { label: 'Wed', value: 9800 },
  { label: 'Thu', value: 13400 },
  { label: 'Fri', value: 15800 },
  { label: 'Sat', value: 6200 },
  { label: 'Sun', value: 4100 },
];

const funnelStages = [
  { label: 'Leads',     value: 12840, pct: 100, color: 'bg-blue-500' },
  { label: 'Contacted', value: 8420,  pct: 66,  color: 'bg-indigo-500' },
  { label: 'Qualified', value: 3210,  pct: 25,  color: 'bg-violet-500' },
  { label: 'Proposal',  value: 1480,  pct: 12,  color: 'bg-amber-500' },
  { label: 'Won',       value: 618,   pct: 5,   color: 'bg-emerald-500' },
];

const recentActivity = [
  { icon: <Users className="size-3.5 text-blue-500" />,         bg: 'bg-blue-50 dark:bg-blue-950/20',      text: 'New lead: Rahul Sharma from Organic Search',        time: '2m ago' },
  { icon: <Megaphone className="size-3.5 text-violet-500" />,   bg: 'bg-violet-50 dark:bg-violet-950/20',  text: 'Campaign "Q3 Flash Sale" started — 48K recipients',  time: '14m ago' },
  { icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,bg: 'bg-emerald-50 dark:bg-emerald-950/20',text: 'Campaign "Onboarding Flow" completed — 72% CTR',     time: '1h ago' },
  { icon: <XCircle className="size-3.5 text-red-500" />,        bg: 'bg-red-50 dark:bg-red-950/20',        text: '142 SMS messages failed — carrier issue detected',   time: '2h ago' },
  { icon: <Bot className="size-3.5 text-rose-500" />,           bg: 'bg-rose-50 dark:bg-rose-950/20',      text: 'AI Voice Agent completed 84 calls — 31% converted',  time: '3h ago' },
  { icon: <Users className="size-3.5 text-blue-500" />,         bg: 'bg-blue-50 dark:bg-blue-950/20',      text: '12 new leads imported via CSV upload',               time: '4h ago' },
  { icon: <Flame className="size-3.5 text-amber-500" />,        bg: 'bg-amber-50 dark:bg-amber-950/20',    text: 'WhatsApp broadcast sent to 22K contacts',            time: '5h ago' },
  { icon: <PhoneCall className="size-3.5 text-indigo-500" />,   bg: 'bg-indigo-50 dark:bg-indigo-950/20',  text: 'AI conversation summary saved for Priya Mehta',      time: '6h ago' },
];

const statusVariant = {
  active: 'success' as const,
  draft: 'muted' as const,
  paused: 'warning' as const,
  completed: 'secondary' as const,
};

const channelLabel: Record<string, string> = {
  email: 'Email', social: 'Social', paid: 'Paid', content: 'Content', seo: 'SEO',
};

export function MarketingDashboard() {
  const { data: campaignsData } = useCampaigns({ limit: 20 });
  const mockCampaigns = campaignsData?.data ?? [];
  const activeCampaigns = mockCampaigns.filter((c: any) => c.status === 'active');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Dashboard"
        description="Unified view of leads, campaigns, channels and revenue"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Dashboard' }]}
        actions={
          <Button size="md">
            <Plus className="size-4" strokeWidth={2.5} /> New Campaign
          </Button>
        }
      />

      <TodayEventBanner />

      {/* Sparkline KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Mini KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {miniKpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card padding="sm">
              <div className="flex items-start justify-between mb-2">
                <div className={cn('flex size-8 items-center justify-center rounded-lg shrink-0', k.bg)}>{k.icon}</div>
                <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold', k.up ? 'text-emerald-600' : 'text-red-500')}>
                  {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{k.change}
                </span>
              </div>
              <p className="text-xl font-black text-foreground tabular-nums leading-none">{k.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-snug">{k.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <UpcomingEventsCard />

      {/* Campaign perf + Leads by source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Messages sent vs conversions — last 7 months</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={campaignPerf}
              series={[
                { key: 'value', label: 'Messages Sent', color: '#6366f1' },
                { key: 'conversions', label: 'Conversions', color: '#10b981' },
              ]}
              height={200}
            />
          </CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Leads by Source</CardTitle>
              <CardDescription>Traffic origin breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={leadsBySource} height={180} showLegend />
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Revenue trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Conversion Funnel</CardTitle></div></CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {funnelStages.map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.label}</span>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">{s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', s.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue attributed to marketing</CardDescription>
            </div>
            <Badge variant="success" dot>Growing</Badge>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={revenueTrend}
              series={[{ key: 'mrr', label: 'Revenue', color: '#8b5cf6' }]}
              height={180}
            />
          </CardContent>
        </Card>
      </div>

      {/* Website traffic + Channel mix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Website Traffic</CardTitle>
              <CardDescription>Visitors & conversions — last 7 months</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: 'Visitors', color: '#6366f1' }, { label: 'Conversions', color: '#10b981' }].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={trafficData}
              series={[
                { key: 'value', label: 'Visitors', color: '#6366f1' },
                { key: 'conversions', label: 'Conversions', color: '#10b981' },
              ]}
              height={230}
            />
          </CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Channel Mix</CardTitle>
              <CardDescription>Traffic by source</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={channelData} height={190} showLegend />
          </CardContent>
        </Card>
      </div>

      {/* Active campaigns */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>{activeCampaigns.length} running now</CardDescription>
          </div>
          <Link to="/mkt/campaigns">
            <Button variant="outline" size="sm">View All <ArrowRight className="size-3.5" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {mockCampaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3.5 rounded-lg border border-border hover:border-border-strong hover:bg-muted/20 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-muted shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">{channelLabel[campaign.channel]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{campaign.name}</p>
                    <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3" />{formatNumber(campaign.impressions)}</span>
                    <span className="flex items-center gap-1"><MousePointer className="size-3" />{formatNumber(campaign.clicks)}</span>
                    <span className="flex items-center gap-1"><Target className="size-3" />{campaign.conversions} conv.</span>
                  </div>
                </div>
                <div className="hidden md:block w-28 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Budget</span>
                    <span className="text-xs font-semibold text-foreground">{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                  <Progress value={Math.round((campaign.spent / campaign.budget) * 100)} size="sm" color={campaign.spent / campaign.budget > 0.9 ? 'red' : 'blue'} />
                  <p className="text-2xs text-muted-foreground mt-1">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</p>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{campaign.roi}x</p>
                  <p className="text-xs text-muted-foreground">ROI</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily activity + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Messages sent this week</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={dailyActivity}
              series={[{ key: 'value', label: 'Messages', color: '#f59e0b' }]}
              height={160}
            />
          </CardContent>
        </Card>

        <Card padding="none" className="lg:col-span-2">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">Recent Activity</p>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 px-5 py-3">
                <div className={cn('flex size-6 items-center justify-center rounded-full shrink-0 mt-0.5', a.bg)}>{a.icon}</div>
                <p className="flex-1 min-w-0 text-xs text-foreground leading-snug">{a.text}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
