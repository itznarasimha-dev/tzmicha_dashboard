import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAttendance, useUsers } from "@/hooks";
import { format, startOfWeek, addDays } from "date-fns";

const statusVariant: Record<string, "success" | "danger" | "warning" | "muted"> = {
  present:  "success",
  absent:   "danger",
  late:     "warning",
  half_day: "warning",
  holiday:  "muted",
};
const statusLabel: Record<string, string> = {
  present: "P", absent: "A", late: "L", half_day: "H", holiday: "Ho",
};

// Build Mon–Fri of current week
const today = new Date();
const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), 0);
const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

export function AttendancePage() {
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 50 });
  const { data: attendanceData, isLoading: attLoading } = useAttendance({
    startDate: format(weekDays[0], "yyyy-MM-dd"),
    endDate: format(weekDays[4], "yyyy-MM-dd"),
    limit: 500,
  });

  const users = usersData?.data ?? [];
  const records: any[] = attendanceData?.data ?? [];

  // Build lookup: userId -> { dateStr -> status }
  const lookup: Record<string, Record<string, string>> = {};
  for (const r of records) {
    const uid = r.userId;
    const d = format(new Date(r.date), "yyyy-MM-dd");
    if (!lookup[uid]) lookup[uid] = {};
    lookup[uid][d] = r.status;
  }

  const todayStr = format(today, "yyyy-MM-dd");
  const presentToday = users.filter((u: any) => lookup[u.id]?.[todayStr] === "present").length;
  const absentToday  = users.filter((u: any) => lookup[u.id]?.[todayStr] === "absent").length;
  const lateToday    = users.filter((u: any) => lookup[u.id]?.[todayStr] === "late").length;

  const isLoading = usersLoading || attLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={`${presentToday}/${users.length} present today`}
        breadcrumbs={[{ label: "People" }, { label: "Attendance" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Present Today", value: presentToday, color: "text-emerald-600" },
          { label: "Absent",        value: absentToday,  color: "text-red-600" },
          { label: "Late",          value: lateToday,    color: "text-amber-600" },
          { label: "Total Staff",   value: users.length, color: "text-foreground" },
        ].map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <div>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>
              {format(weekDays[0], "MMM d")} – {format(weekDays[4], "MMM d, yyyy")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground w-48">Employee</th>
                    {weekDays.map((d) => (
                      <th key={d.toISOString()} className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">
                        {format(d, "EEE d")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={user.name} src={user.avatar} size="xs" />
                          <span className="text-[13px] font-medium text-foreground truncate">{user.name}</span>
                        </div>
                      </td>
                      {weekDays.map((d) => {
                        const ds = format(d, "yyyy-MM-dd");
                        const status = lookup[user.id]?.[ds];
                        return (
                          <td key={ds} className="text-center py-3 px-3">
                            {status ? (
                              <Badge variant={statusVariant[status] ?? "muted"} size="sm">
                                {statusLabel[status] ?? status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
            {Object.entries(statusLabel).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <Badge variant={statusVariant[k]} size="sm">{v}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{k.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
