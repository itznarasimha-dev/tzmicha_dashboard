import {
  Users, Umbrella, UserCheck, ClipboardList, ArrowRight,
  Plus, CheckCircle2, XCircle, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { BarChartComponent } from "@/components/charts/Charts";
import { UpcomingEventsCard } from "@/components/ui/UpcomingEventsCard";
import { TodayEventBanner } from "@/components/ui/TodayEventBanner";
import { useLeaveRequests, useUsers, useUpdateLeaveStatus } from "@/hooks";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants";
import { cn, formatDate } from "@/utils";
import type { KPICard as KPICardType } from "@/types";

const kpiIcons = [
  <Users className="size-5" />,
  <Umbrella className="size-5" />,
  <ClipboardList className="size-5" />,
  <UserCheck className="size-5" />,
];

export function HRDashboard() {
  const { data: leaveData } = useLeaveRequests({ limit: 20 });
  const { data: usersData } = useUsers({ limit: 100 });
  const { mutate: updateLeaveStatus } = useUpdateLeaveStatus();
  const leaveRequests = leaveData?.data ?? [];
  const employees = usersData?.data ?? [];
  const pendingLeave = leaveRequests.filter((r: any) => r.status === 'pending');
  const onLeaveToday = leaveRequests.filter((r: any) => {
    const today = new Date();
    return r.status === 'approved' && new Date(r.startDate) <= today && new Date(r.endDate) >= today;
  });

  // Dept distribution from real users
  const deptMap: Record<string, number> = {};
  employees.forEach((e: any) => { if (e.department) deptMap[e.department] = (deptMap[e.department] ?? 0) + 1; });
  const deptData = Object.entries(deptMap).map(([label, value]) => ({ label, value }));

  const kpiCards: KPICardType[] = [
    { id: 'k1', title: 'Total Employees', value: employees.length, change: 0, changeLabel: 'active', trend: 'neutral', icon: 'employees', color: 'blue' },
    { id: 'k2', title: 'On Leave Today', value: onLeaveToday.length, change: 0, changeLabel: 'approved', trend: 'neutral', icon: 'leave', color: 'amber' },
    { id: 'k3', title: 'Pending Requests', value: pendingLeave.length, change: 0, changeLabel: 'awaiting approval', trend: pendingLeave.length > 0 ? 'up' : 'neutral', icon: 'pending', color: 'violet' },
    { id: 'k4', title: 'Departments', value: deptData.length, change: 0, changeLabel: 'teams', trend: 'neutral', icon: 'onboarding', color: 'emerald' },
  ];

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
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">People Operations</span>
            <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
              {pendingLeave.length} pending approvals
            </span>
          </div>
          <h1 className="text-[1.75rem] font-bold text-foreground tracking-tight leading-tight">HR Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{employees.length} employees · {pendingLeave.length} pending requests · {onLeaveToday.length} on leave today</p>
        </div>
        <Button size="md">
          <Plus className="size-4" strokeWidth={2.5} /> Add Employee
        </Button>
      </motion.div>

      {/* Today's Holiday / Company Event Banner */}
      <TodayEventBanner />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} card={card} icon={kpiIcons[i]} index={i} />
        ))}
      </div>

      {/* Leave Requests + Dept Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>{pendingLeave.length} awaiting your approval</CardDescription>
            </div>
            <Link to="/leave">
              <Button variant="ghost" size="icon-xs"><ArrowRight className="size-3.5" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaveRequests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong transition-all duration-150"
                >
                  <Avatar name={req.user?.name ?? req.employeeName ?? 'User'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{req.user?.name ?? req.employeeName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="capitalize">{req.type}</span> leave · {formatDate(req.startDate)} – {formatDate(req.endDate)} · {req.days} days
                    </p>
                  </div>
                  <Badge
                    variant={req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"}
                    dot
                  >
                    {req.status}
                  </Badge>
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon-xs" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => updateLeaveStatus({ id: req.id, status: 'approved' })}>
                        <CheckCircle2 className="size-4" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => updateLeaveStatus({ id: req.id, status: 'rejected' })}>
                        <XCircle className="size-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div>
              <CardTitle>By Department</CardTitle>
              <CardDescription>Headcount distribution</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={deptData}
              series={[{ key: "value", label: "Employees", color: "#6366f1" }]}
              height={210}
              horizontal
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events — synced from Calendar */}
      <UpcomingEventsCard />

      {/* Employee Directory */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Quick overview of all team members</CardDescription>
          </div>
          <Link to="/employees">
            <Button variant="outline" size="sm">View All <ArrowRight className="size-3.5" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {employees.slice(0, 6).map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong hover:bg-muted/20 transition-all duration-150 cursor-pointer group"
              >
                <Avatar name={emp.name} src={emp.avatar} size="sm" showStatus status={emp.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.title}</p>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {emp.location ?? "Remote"}
                </div>
                <span className={cn("hidden sm:inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", ROLE_COLORS[emp.role])}>
                  {ROLE_LABELS[emp.role]}
                </span>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Since {formatDate(emp.startDate, "MMM yyyy")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
