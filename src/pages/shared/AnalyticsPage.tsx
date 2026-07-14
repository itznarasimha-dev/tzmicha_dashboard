import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { AreaChartComponent, BarChartComponent, DonutChart, LineChartComponent } from "@/components/charts/Charts";
import { trafficData, channelData, revenueData, velocityData, teamProductivityData } from "@/data/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Users, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";

const summaryStats = [
  { label: "Total Visitors", value: "89K", change: "+18%", icon: <Users className="size-4" />, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { label: "Conversions", value: "2,900", change: "+24%", icon: <TrendingUp className="size-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "MRR", value: "$71K", change: "+12%", icon: <BarChart3 className="size-4" />, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/30" },
  { label: "Sprint Velocity", value: "42 pts", change: "+10%", icon: <Zap className="size-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Platform-wide metrics and performance insights"
        breadcrumbs={[{ label: "Analytics" }]}
        actions={<Badge variant="success" dot>Live data</Badge>}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5 leading-none">{stat.value}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">{stat.change} this month</p>
                </div>
                <div className={`flex size-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card padding="lg">
                <CardHeader>
                  <div>
                    <CardTitle>Platform Traffic</CardTitle>
                    <CardDescription>Monthly visitors & sessions</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    {[{ label: "Visitors", color: "#f43f5e" }, { label: "Sessions", color: "#64748b" }].map((s) => (
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
                      { key: "value", label: "Visitors", color: "#f43f5e" },
                      { key: "sessions", label: "Sessions", color: "#64748b" },
                    ]}
                    height={240}
                  />
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardHeader>
                  <div>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>MRR over 6 months</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent
                    data={revenueData}
                    series={[{ key: "mrr", label: "MRR", color: "#10b981" }]}
                    height={240}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card padding="lg">
                <CardHeader>
                  <div>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Channel breakdown</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <DonutChart data={channelData} height={180} showLegend />
                </CardContent>
              </Card>

              <Card className="xl:col-span-2" padding="lg">
                <CardHeader>
                  <div>
                    <CardTitle>Team Productivity</CardTitle>
                    <CardDescription>Hours logged by team this week</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={teamProductivityData}
                    series={[
                      { key: "frontend", label: "Frontend", color: "#f43f5e" },
                      { key: "backend", label: "Backend", color: "#64748b" },
                      { key: "qa", label: "QA", color: "#10b981" },
                    ]}
                    height={200}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engineering">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Sprint Velocity</CardTitle>
                  <CardDescription>Story points per sprint</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={velocityData}
                  series={[{ key: "value", label: "Velocity", color: "#f43f5e" }]}
                  height={240}
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Team Productivity</CardTitle>
                  <CardDescription>Daily hours this week</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={teamProductivityData}
                  series={[
                    { key: "frontend", label: "Frontend", color: "#f43f5e" },
                    { key: "backend", label: "Backend", color: "#64748b" },
                  ]}
                  height={240}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Traffic & Conversions</CardTitle>
                  <CardDescription>Monthly performance</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <AreaChartComponent
                  data={trafficData}
                  series={[
                    { key: "value", label: "Visitors", color: "#f43f5e" },
                    { key: "conversions", label: "Conversions", color: "#10b981" },
                  ]}
                  height={240}
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
                <DonutChart data={channelData} height={200} showLegend />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
