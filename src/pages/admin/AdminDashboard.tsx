import {
  Users, TrendingUp, Zap, Bug, Plus, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { AreaChartComponent, DonutChart, BarChartComponent } from "@/components/charts/Charts";
import { mockActivity, trafficData, channelData, teamProductivityData } from "@/data/analytics";
import { mockProjects } from "@/data/projects";
import { mockUsers } from "@/data/users";
import { formatDate } from "@/utils";
import { useAppStore } from "@/store/appStore";
import type { KPICard as KPICardType } from "@/types";

const kpiCards: KPICardType[] = [
  { id: "k1", title: "Total Employees", value: 48, change: 12, changeLabel: "vs last month", trend: "up", icon: "users", color: "blue", sparkline: [32, 35, 38, 36, 40, 42, 44, 48] },
  { id: "k2", title: "Active Projects", value: 12, change: 3, changeLabel: "vs last month", trend: "up", icon: "projects", color: "violet", sparkline: [8, 9, 10, 9, 11, 10, 12, 12] },
  { id: "k3", title: "Sprint Velocity", value: "42 pts", change: 10.5, changeLabel: "vs last sprint", trend: "up", icon: "velocity", color: "emerald", sparkline: [28, 34, 31, 40, 38, 42] },
  { id: "k4", title: "Open Bugs", value: 7, change: -22, changeLabel: "vs last week", trend: "down", icon: "bugs", color: "amber", sparkline: [14, 12, 10, 9, 8, 7] },
];

const kpiIcons = [
  <Users className="size-5" />,
  <TrendingUp className="size-5" />,
  <Zap className="size-5" />,
  <Bug className="size-5" />,
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function AdminDashboard() {
  const { currentUser } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400">Command Center</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
          <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight leading-tight">
            {getGreeting()}, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sprint 12 ends in 3 days — here's your overview.
          </p>
        </div>
        <Button size="md">
          <Plus className="size-4" strokeWidth={2.5} />
          Quick Add
        </Button>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Platform Traffic</CardTitle>
              <CardDescription>Visitors & sessions — last 7 months</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Visitors", color: "#f43f5e" }, { label: "Sessions", color: "#64748b" }].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
              <Badge variant="success" dot>Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={trafficData}
              series={[
                { key: "value", label: "Visitors", color: "#f43f5e" },
                { key: "sessions", label: "Sessions", color: "#64748b" },
              ]}
              height={220}
            />
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Channel breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={channelData} height={190} showLegend />
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Projects */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>{mockProjects.filter(p => p.status === "active").length} in progress</CardDescription>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="icon-xs"><ArrowRight className="size-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-2 rounded-full shrink-0" style={{ background: project.color }} />
                      <span className="text-[13px] font-medium text-foreground group-hover:text-rose-600 transition-colors truncate">
                        {project.name}
                      </span>
                    </div>
                    <Badge variant={project.status === "active" ? "success" : project.status === "on-hold" ? "warning" : "muted"}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={project.progress} size="sm" color={project.status === "active" ? "blue" : "amber"} />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-8 text-right shrink-0">
                      {project.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due {formatDate(project.endDate ?? project.startDate)}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Productivity */}
        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Avg hours logged this week</CardDescription>
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
              height={240}
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed — full width */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Across all teams</CardDescription>
          </div>
          <Link to="/activity">
            <Button variant="ghost" size="icon-xs"><ArrowRight className="size-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={mockActivity} maxItems={6} />
        </CardContent>
      </Card>

      {/* Team Overview */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Team</CardTitle>
            <CardDescription>{mockUsers.length} members · {mockUsers.filter(u => u.status === "active").length} active now</CardDescription>
          </div>
          <Link to="/employees">
            <Button variant="secondary" size="sm">
              View all <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {mockUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.06 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/20 hover:bg-card hover:border-border-strong hover:shadow-card transition-all duration-150 cursor-pointer"
              >
                <Avatar name={user.name} src={user.avatar} size="md" showStatus status={user.status} />
                <div className="text-center w-full">
                  <p className="text-xs font-semibold text-foreground truncate">{user.name.split(" ")[0]}</p>
                  <p className="text-2xs text-muted-foreground truncate mt-0.5">{user.title.split(" ").slice(0, 2).join(" ")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
