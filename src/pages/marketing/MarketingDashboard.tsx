import {
  TrendingUp, DollarSign, ArrowRight,
  Plus, Eye, MousePointer, Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { AreaChartComponent, DonutChart } from "@/components/charts/Charts";
import { mockCampaigns, trafficData, channelData, revenueData } from "@/data/analytics";
import { cn, formatCurrency, formatNumber } from "@/utils";
import type { KPICard as KPICardType } from "@/types";

const kpiCards: KPICardType[] = [
  { id: "k1", title: "Total Impressions", value: 654200, change: 18, changeLabel: "vs last month", trend: "up", icon: "impressions", color: "blue", sparkline: [420000, 480000, 510000, 560000, 600000, 654200] },
  { id: "k2", title: "Conversions", value: 1449, change: 24, changeLabel: "vs last month", trend: "up", icon: "conversions", color: "emerald", sparkline: [900, 1000, 1100, 1200, 1300, 1449] },
  { id: "k3", title: "Total Spend", value: "$28.7K", change: 5, changeLabel: "vs last month", trend: "up", icon: "spend", color: "amber", sparkline: [22000, 24000, 25000, 26000, 27000, 28700] },
  { id: "k4", title: "Avg ROI", value: "2.9x", change: 8, changeLabel: "vs last month", trend: "up", icon: "roi", color: "violet", sparkline: [2.1, 2.3, 2.5, 2.6, 2.8, 2.9] },
];

const kpiIcons = [
  <Eye className="size-5" />,
  <Target className="size-5" />,
  <DollarSign className="size-5" />,
  <TrendingUp className="size-5" />,
];

const statusVariant = {
  active: "success" as const,
  draft: "muted" as const,
  paused: "warning" as const,
  completed: "secondary" as const,
};

const channelLabel: Record<string, string> = {
  email: "Email",
  social: "Social",
  paid: "Paid",
  content: "Content",
  seo: "SEO",
};

export function MarketingDashboard() {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">Marketing Hub</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {activeCampaigns.length} campaigns live
            </span>
          </div>
          <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight leading-tight">Marketing Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Q1 2024 · $28.7K spent · 654K impressions</p>
        </div>
        <Button size="md">
          <Plus className="size-4" strokeWidth={2.5} /> New Campaign
        </Button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Traffic + Channel Mix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Website Traffic</CardTitle>
              <CardDescription>Visitors & conversions — last 7 months</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Visitors", color: "#6366f1" }, { label: "Conversions", color: "#10b981" }].map((s) => (
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
                { key: "value", label: "Visitors", color: "#6366f1" },
                { key: "conversions", label: "Conversions", color: "#10b981" },
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

      {/* Campaigns */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>{activeCampaigns.length} running now</CardDescription>
          </div>
          <Link to="/marketing">
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
                    <span className="text-xs font-semibold text-foreground">
                      {Math.round((campaign.spent / campaign.budget) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.round((campaign.spent / campaign.budget) * 100)}
                    size="sm"
                    color={campaign.spent / campaign.budget > 0.9 ? "red" : "blue"}
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                  </p>
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

      {/* Revenue */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Revenue Impact</CardTitle>
            <CardDescription>MRR growth attributed to marketing — last 6 months</CardDescription>
          </div>
          <Badge variant="success" dot>Growing</Badge>
        </CardHeader>
        <CardContent>
          <AreaChartComponent
            data={revenueData}
            series={[{ key: "mrr", label: "MRR", color: "#8b5cf6" }]}
            height={200}
          />
        </CardContent>
      </Card>
    </div>
  );
}
