import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { AreaChartComponent, BarChartComponent, DonutChart, LineChartComponent } from "@/components/charts/Charts";
import { trafficData, channelData, revenueData, velocityData, teamProductivityData, bugTrendData } from "@/data/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp, Users, BarChart3, Zap, Bug, Briefcase, Umbrella, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/appStore";
import { useProjects, useTasks, useLeaveRequests, useCampaigns, useDeals, useUsers, useRecruitmentStats } from "@/hooks";
import { cn } from "@/utils";
import type { UserRole } from "@/types";

function StatCard({ label, value, icon, color, bg, loading }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; bg: string; loading?: boolean;
}) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading
            ? <Skeleton className="h-7 w-16 mt-1.5" />
            : <p className="text-2xl font-bold text-foreground mt-1.5 leading-none">{value}</p>
          }
        </div>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", bg, color)}>{icon}</div>
      </div>
    </Card>
  );
}

// ── Admin / Product Manager ───────────────────────────────────────────────────
function AdminAnalytics() {
  const { data: projectsData, isLoading: pL } = useProjects({ limit: 100 });
  const { data: tasksData, isLoading: tL } = useTasks({ limit: 100 });
  const { data: usersData, isLoading: uL } = useUsers({ limit: 100 });
  const { data: leaveData, isLoading: lL } = useLeaveRequests({ limit: 100 });

  const projects = projectsData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const users = usersData?.data ?? [];
  const leaves = leaveData?.data ?? [];

  const tasksByStatus = [
    { name: 'Done',        value: tasks.filter((t: any) => t.status === 'done').length,        color: '#10b981' },
    { name: 'In Progress', value: tasks.filter((t: any) => t.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'In Review',   value: tasks.filter((t: any) => t.status === 'in_review').length,   color: '#8b5cf6' },
    { name: 'Blocked',     value: tasks.filter((t: any) => t.status === 'blocked').length,     color: '#ef4444' },
    { name: 'Todo',        value: tasks.filter((t: any) => t.status === 'todo').length,        color: '#6366f1' },
    { name: 'Backlog',     value: tasks.filter((t: any) => t.status === 'backlog').length,     color: '#94a3b8' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Projects"  value={projects.filter((p: any) => p.status === 'active').length} icon={<BarChart3 className="size-4" />} color="text-rose-600 dark:text-rose-400"    bg="bg-rose-50 dark:bg-rose-950/30"    loading={pL} />
        <StatCard label="Total Employees"  value={users.filter((u: any) => u.status === 'active').length}    icon={<Users className="size-4" />}     color="text-blue-600 dark:text-blue-400"   bg="bg-blue-50 dark:bg-blue-950/30"    loading={uL} />
        <StatCard label="Tasks Completed"  value={tasks.filter((t: any) => t.status === 'done').length}      icon={<Zap className="size-4" />}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={tL} />
        <StatCard label="Pending Leave"    value={leaves.filter((l: any) => l.status === 'pending').length}  icon={<Umbrella className="size-4" />}  color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/30"  loading={lL} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card padding="lg" className="xl:col-span-2">
                <CardHeader><div><CardTitle>Platform Traffic</CardTitle><CardDescription>Monthly visitors & sessions</CardDescription></div></CardHeader>
                <CardContent><AreaChartComponent data={trafficData} series={[{ key: "value", label: "Visitors", color: "#f43f5e" }, { key: "sessions", label: "Sessions", color: "#64748b" }]} height={220} /></CardContent>
              </Card>
              <Card padding="lg">
                <CardHeader><div><CardTitle>Task Distribution</CardTitle><CardDescription>By status — live</CardDescription></div></CardHeader>
                <CardContent>{tL ? <Skeleton className="h-44" /> : <DonutChart data={tasksByStatus} height={180} showLegend />}</CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card padding="lg">
                <CardHeader><div><CardTitle>Revenue Growth</CardTitle><CardDescription>MRR over 6 months</CardDescription></div></CardHeader>
                <CardContent><AreaChartComponent data={revenueData} series={[{ key: "mrr", label: "MRR", color: "#10b981" }]} height={220} /></CardContent>
              </Card>
              <Card padding="lg">
                <CardHeader><div><CardTitle>Team Productivity</CardTitle><CardDescription>Hours logged this week</CardDescription></div></CardHeader>
                <CardContent><BarChartComponent data={teamProductivityData} series={[{ key: "frontend", label: "Frontend", color: "#f43f5e" }, { key: "backend", label: "Backend", color: "#64748b" }, { key: "qa", label: "QA", color: "#10b981" }]} height={200} /></CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engineering">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            <Card padding="lg">
              <CardHeader><div><CardTitle>Sprint Velocity</CardTitle><CardDescription>Story points per sprint</CardDescription></div></CardHeader>
              <CardContent><LineChartComponent data={velocityData} series={[{ key: "value", label: "Velocity", color: "#f43f5e" }]} height={240} /></CardContent>
            </Card>
            <Card padding="lg">
              <CardHeader><div><CardTitle>Bug Trend</CardTitle><CardDescription>Opened vs closed — last 6 weeks</CardDescription></div></CardHeader>
              <CardContent><BarChartComponent data={bugTrendData} series={[{ key: "opened", label: "Opened", color: "#ef4444" }, { key: "closed", label: "Closed", color: "#10b981" }]} height={240} /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            <Card padding="lg">
              <CardHeader><div><CardTitle>Traffic & Conversions</CardTitle><CardDescription>Monthly performance</CardDescription></div></CardHeader>
              <CardContent><AreaChartComponent data={trafficData} series={[{ key: "value", label: "Visitors", color: "#f43f5e" }, { key: "conversions", label: "Conversions", color: "#10b981" }]} height={240} /></CardContent>
            </Card>
            <Card padding="lg">
              <CardHeader><div><CardTitle>Channel Mix</CardTitle><CardDescription>Traffic by source</CardDescription></div></CardHeader>
              <CardContent><DonutChart data={channelData} height={200} showLegend /></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Developer (Frontend / Backend) ────────────────────────────────────────────
function DevAnalytics() {
  const { data: tasksData, isLoading: tL } = useTasks({ limit: 100 });
  const { data: projectsData, isLoading: pL } = useProjects({ limit: 20 });
  const tasks = tasksData?.data ?? [];
  const projects = projectsData?.data ?? [];

  const done       = tasks.filter((t: any) => t.status === 'done').length;
  const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
  const blocked    = tasks.filter((t: any) => t.status === 'blocked').length;

  const tasksByStatus = [
    { name: 'Done',        value: done,                                    color: '#10b981' },
    { name: 'In Progress', value: inProgress,                              color: '#f59e0b' },
    { name: 'Blocked',     value: blocked,                                 color: '#ef4444' },
    { name: 'Other',       value: tasks.length - done - inProgress - blocked, color: '#94a3b8' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"      value={tasks.length}                                          icon={<Zap className="size-4" />}       color="text-blue-600 dark:text-blue-400"      bg="bg-blue-50 dark:bg-blue-950/30"      loading={tL} />
        <StatCard label="Completed"        value={done}                                                  icon={<Zap className="size-4" />}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={tL} />
        <StatCard label="In Progress"      value={inProgress}                                            icon={<BarChart3 className="size-4" />} color="text-amber-600 dark:text-amber-400"    bg="bg-amber-50 dark:bg-amber-950/30"    loading={tL} />
        <StatCard label="Active Projects"  value={projects.filter((p: any) => p.status === 'active').length} icon={<TrendingUp className="size-4" />} color="text-violet-600 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-950/30" loading={pL} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Sprint Velocity</CardTitle><CardDescription>Story points per sprint</CardDescription></div></CardHeader>
          <CardContent><LineChartComponent data={velocityData} series={[{ key: "value", label: "Velocity", color: "#6366f1" }]} height={240} /></CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader><div><CardTitle>My Task Distribution</CardTitle><CardDescription>Live from sprint board</CardDescription></div></CardHeader>
          <CardContent>{tL ? <Skeleton className="h-44" /> : <DonutChart data={tasksByStatus} height={180} showLegend />}</CardContent>
        </Card>
      </div>
      <Card padding="lg">
        <CardHeader><div><CardTitle>Team Productivity</CardTitle><CardDescription>Hours logged this week</CardDescription></div></CardHeader>
        <CardContent><BarChartComponent data={teamProductivityData} series={[{ key: "frontend", label: "Frontend", color: "#6366f1" }, { key: "backend", label: "Backend", color: "#8b5cf6" }]} height={200} /></CardContent>
      </Card>
    </div>
  );
}

// ── QA ────────────────────────────────────────────────────────────────────────
function QAAnalytics() {
  const { data: tasksData, isLoading: tL } = useTasks({ limit: 100 });
  const tasks = tasksData?.data ?? [];
  const blocked  = tasks.filter((t: any) => t.status === 'blocked').length;
  const done     = tasks.filter((t: any) => t.status === 'done').length;
  const inReview = tasks.filter((t: any) => t.status === 'in_review').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={tasks.length} icon={<Zap className="size-4" />}       color="text-blue-600 dark:text-blue-400"      bg="bg-blue-50 dark:bg-blue-950/30"      loading={tL} />
        <StatCard label="In Review"   value={inReview}     icon={<BarChart3 className="size-4" />} color="text-violet-600 dark:text-violet-400"  bg="bg-violet-50 dark:bg-violet-950/30"  loading={tL} />
        <StatCard label="Blocked"     value={blocked}      icon={<Bug className="size-4" />}       color="text-red-600 dark:text-red-400"        bg="bg-red-50 dark:bg-red-950/30"        loading={tL} />
        <StatCard label="Done"        value={done}         icon={<Zap className="size-4" />}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={tL} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Bug Trend</CardTitle><CardDescription>Opened vs closed — last 6 weeks</CardDescription></div></CardHeader>
          <CardContent><BarChartComponent data={bugTrendData} series={[{ key: "opened", label: "Opened", color: "#ef4444" }, { key: "closed", label: "Closed", color: "#10b981" }]} height={240} /></CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader><div><CardTitle>Sprint Velocity</CardTitle><CardDescription>Story points per sprint</CardDescription></div></CardHeader>
          <CardContent><LineChartComponent data={velocityData} series={[{ key: "value", label: "Velocity", color: "#f59e0b" }]} height={240} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Marketing ─────────────────────────────────────────────────────────────────
function MarketingAnalytics() {
  const { data: campaignsData, isLoading: cL } = useCampaigns({ limit: 100 });
  const campaigns = campaignsData?.data ?? [];
  const active           = campaigns.filter((c: any) => c.status === 'active').length;
  const totalImpressions = campaigns.reduce((s: number, c: any) => s + (c.impressions ?? 0), 0);
  const totalConversions = campaigns.reduce((s: number, c: any) => s + (c.conversions ?? 0), 0);
  const totalSpend       = campaigns.reduce((s: number, c: any) => s + (c.spent ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns"  value={active}                                                                    icon={<Megaphone className="size-4" />}  color="text-rose-600 dark:text-rose-400"      bg="bg-rose-50 dark:bg-rose-950/30"      loading={cL} />
        <StatCard label="Total Impressions" value={totalImpressions >= 1000 ? `${(totalImpressions/1000).toFixed(0)}K` : totalImpressions} icon={<TrendingUp className="size-4" />} color="text-blue-600 dark:text-blue-400"   bg="bg-blue-50 dark:bg-blue-950/30"    loading={cL} />
        <StatCard label="Conversions"       value={totalConversions}                                                          icon={<Zap className="size-4" />}        color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={cL} />
        <StatCard label="Total Spend"       value={`$${(totalSpend / 1000).toFixed(1)}K`}                                    icon={<BarChart3 className="size-4" />}  color="text-amber-600 dark:text-amber-400"    bg="bg-amber-50 dark:bg-amber-950/30"    loading={cL} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Traffic & Conversions</CardTitle><CardDescription>Monthly performance</CardDescription></div></CardHeader>
          <CardContent><AreaChartComponent data={trafficData} series={[{ key: "value", label: "Visitors", color: "#6366f1" }, { key: "conversions", label: "Conversions", color: "#10b981" }]} height={240} /></CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader><div><CardTitle>Channel Mix</CardTitle><CardDescription>Traffic by source</CardDescription></div></CardHeader>
          <CardContent><DonutChart data={channelData} height={200} showLegend /></CardContent>
        </Card>
      </div>
      <Card padding="lg">
        <CardHeader><div><CardTitle>Revenue Impact</CardTitle><CardDescription>MRR growth attributed to marketing</CardDescription></div></CardHeader>
        <CardContent><AreaChartComponent data={revenueData} series={[{ key: "mrr", label: "MRR", color: "#8b5cf6" }]} height={200} /></CardContent>
      </Card>
    </div>
  );
}

// ── HR ────────────────────────────────────────────────────────────────────────
function HRAnalytics() {
  const { data: usersData,   isLoading: uL } = useUsers({ limit: 100 });
  const { data: leaveData,   isLoading: lL } = useLeaveRequests({ limit: 100 });
  const { data: recruitStats, isLoading: rL } = useRecruitmentStats();

  const users  = usersData?.data ?? [];
  const leaves = leaveData?.data ?? [];

  const deptMap: Record<string, number> = {};
  users.forEach((u: any) => { if (u.department) deptMap[u.department] = (deptMap[u.department] ?? 0) + 1; });
  const deptData = Object.entries(deptMap).map(([label, value]) => ({ label, value }));

  const roleMap: Record<string, number> = {};
  users.forEach((u: any) => { if (u.role) roleMap[u.role] = (roleMap[u.role] ?? 0) + 1; });
  const roleData = Object.entries(roleMap).map(([name, value], i) => ({
    name: name.replace(/_/g, ' '), value,
    color: ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316'][i % 8],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Employees"  value={users.filter((u: any) => u.status === 'active').length}   icon={<Users className="size-4" />}     color="text-blue-600 dark:text-blue-400"      bg="bg-blue-50 dark:bg-blue-950/30"      loading={uL} />
        <StatCard label="On Leave"          value={leaves.filter((l: any) => l.status === 'approved').length} icon={<Umbrella className="size-4" />}  color="text-amber-600 dark:text-amber-400"    bg="bg-amber-50 dark:bg-amber-950/30"    loading={lL} />
        <StatCard label="Pending Requests"  value={leaves.filter((l: any) => l.status === 'pending').length}  icon={<BarChart3 className="size-4" />} color="text-violet-600 dark:text-violet-400"  bg="bg-violet-50 dark:bg-violet-950/30"  loading={lL} />
        <StatCard label="Open Positions"    value={recruitStats?.openPositions ?? 0}                          icon={<Briefcase className="size-4" />} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={rL} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Headcount by Department</CardTitle><CardDescription>Live from employee directory</CardDescription></div></CardHeader>
          <CardContent>{uL ? <Skeleton className="h-44" /> : <BarChartComponent data={deptData} series={[{ key: "value", label: "Employees", color: "#6366f1" }]} height={220} horizontal />}</CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader><div><CardTitle>Role Distribution</CardTitle><CardDescription>Team composition</CardDescription></div></CardHeader>
          <CardContent>{uL ? <Skeleton className="h-44" /> : <DonutChart data={roleData} height={200} showLegend />}</CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Sales ─────────────────────────────────────────────────────────────────────
function SalesAnalytics() {
  const { data: dealsData, isLoading: dL } = useDeals({ limit: 100 });
  const deals = dealsData?.data ?? [];
  const won        = deals.filter((d: any) => d.stage === 'closed_won').length;
  const lost       = deals.filter((d: any) => d.stage === 'closed_lost').length;
  const active     = deals.filter((d: any) => !['closed_won','closed_lost'].includes(d.stage)).length;
  const totalValue = deals.filter((d: any) => d.stage === 'closed_won').reduce((s: number, d: any) => s + (d.value ?? 0), 0);

  const stageData = ['lead','qualified','proposal','negotiation','closed_won','closed_lost'].map((stage, i) => ({
    name: stage.replace(/_/g, ' '),
    value: deals.filter((d: any) => d.stage === stage).length,
    color: ['#6366f1','#8b5cf6','#f59e0b','#06b6d4','#10b981','#ef4444'][i],
  })).filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Deals"  value={active}                              icon={<TrendingUp className="size-4" />} color="text-blue-600 dark:text-blue-400"      bg="bg-blue-50 dark:bg-blue-950/30"      loading={dL} />
        <StatCard label="Won"           value={won}                                 icon={<Zap className="size-4" />}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" loading={dL} />
        <StatCard label="Lost"          value={lost}                                icon={<BarChart3 className="size-4" />} color="text-red-600 dark:text-red-400"        bg="bg-red-50 dark:bg-red-950/30"        loading={dL} />
        <StatCard label="Revenue Won"   value={`$${(totalValue / 1000).toFixed(1)}K`} icon={<TrendingUp className="size-4" />} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/30"   loading={dL} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padding="lg">
          <CardHeader><div><CardTitle>Pipeline by Stage</CardTitle><CardDescription>Live deal distribution</CardDescription></div></CardHeader>
          <CardContent>{dL ? <Skeleton className="h-44" /> : <DonutChart data={stageData} height={200} showLegend />}</CardContent>
        </Card>
        <Card padding="lg">
          <CardHeader><div><CardTitle>Revenue Growth</CardTitle><CardDescription>MRR trend</CardDescription></div></CardHeader>
          <CardContent><AreaChartComponent data={revenueData} series={[{ key: "mrr", label: "MRR", color: "#10b981" }]} height={200} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const user = useAppStore(s => s.user);
  const role = user?.role as string | undefined;

  const descriptionMap: Record<string, string> = {
    admin: 'Platform-wide metrics and performance insights',
    product_manager: 'Product & engineering performance insights',
    frontend_dev: 'Engineering analytics — your tasks & sprints',
    backend_dev: 'Engineering analytics — your tasks & sprints',
    qa: 'QA metrics — bugs, test coverage & velocity',
    marketing: 'Campaign performance & traffic analytics',
    hr: 'People analytics — headcount, leave & recruitment',
    sales: 'Pipeline analytics — deals, revenue & conversion',
  };

  function renderContent() {
    switch (role) {
      case 'admin':
      case 'product_manager': return <AdminAnalytics />;
      case 'frontend_dev':
      case 'backend_dev':     return <DevAnalytics />;
      case 'qa':              return <QAAnalytics />;
      case 'marketing':       return <MarketingAnalytics />;
      case 'hr':              return <HRAnalytics />;
      case 'sales':           return <SalesAnalytics />;
      default:                return <AdminAnalytics />;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={descriptionMap[role ?? ''] ?? 'Performance insights'}
        breadcrumbs={[{ label: "Analytics" }]}
        actions={<Badge variant="success" dot>Live data</Badge>}
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {renderContent()}
      </motion.div>
    </div>
  );
}
