import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { mockUsers } from "@/data/users";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants";
import { cn } from "@/utils";

function OrgNode({ userId, depth = 0 }: { userId: string; depth?: number }) {
  const user = mockUsers.find((u) => u.id === userId);
  const reports = mockUsers.filter((u) => u.managerId === userId);
  if (!user) return null;

  return (
    <div className={cn("flex flex-col items-center", depth > 0 && "mt-6")}>
      <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-150 cursor-pointer w-36 text-center">
        <Avatar name={user.name} src={user.avatar} size="md" showStatus status={user.status} />
        <div>
          <p className="text-xs font-bold text-foreground leading-tight">{user.name}</p>
          <p className="text-2xs text-muted-foreground mt-0.5 leading-tight">{user.title}</p>
        </div>
        <span className={cn("text-2xs px-1.5 py-0.5 rounded font-semibold", ROLE_COLORS[user.role])}>
          {ROLE_LABELS[user.role]}
        </span>
      </div>

      {reports.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="relative flex gap-6">
            {reports.length > 1 && (
              <div className="absolute top-0 left-[calc(50%-50%)] right-[calc(50%-50%)] h-px bg-border"
                style={{ left: "calc(50% - " + ((reports.length - 1) * 88) + "px / 2)", right: "calc(50% - " + ((reports.length - 1) * 88) + "px / 2)" }} />
            )}
            {reports.map((r) => (
              <div key={r.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-border" />
                <OrgNode userId={r.id} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChartPage() {
  const root = mockUsers.find((u) => !u.managerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Org Chart"
        description={`${mockUsers.length} team members`}
        breadcrumbs={[{ label: "People" }, { label: "Org Chart" }]}
      />
      <Card padding="lg" className="overflow-x-auto">
        <div className="min-w-max flex justify-center py-4">
          {root && <OrgNode userId={root.id} />}
        </div>
      </Card>
    </div>
  );
}
