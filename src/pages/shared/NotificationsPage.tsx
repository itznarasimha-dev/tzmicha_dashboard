import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, Check, BellOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockNotifications } from "@/data/analytics";
import { cn, formatRelativeTime } from "@/utils";

const typeConfig = {
  info: { icon: <Info className="size-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", dot: "bg-blue-500" },
  success: { icon: <CheckCircle2 className="size-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-500" },
  warning: { icon: <AlertTriangle className="size-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500" },
  error: { icon: <XCircle className="size-4" />, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", dot: "bg-red-500" },
};

export function NotificationsPage() {
  const unread = mockNotifications.filter((n) => !n.read);
  const read = mockNotifications.filter((n) => n.read);

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <PageHeader
        title="Notifications"
        description={`${unread.length} unread · ${mockNotifications.length} total`}
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm">
            <Check className="size-3.5" /> Mark all read
          </Button>
        }
      />

      {unread.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">
            Unread · {unread.length}
          </p>
          <div className="space-y-1.5">
            {unread.map((n, i) => {
              const config = typeConfig[n.type];
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card padding="md" className="hover:shadow-elevated transition-all duration-150 cursor-pointer border-l-2" style={{ borderLeftColor: config.dot.replace("bg-", "").includes("blue") ? "#3b82f6" : config.dot.replace("bg-", "").includes("emerald") ? "#10b981" : config.dot.replace("bg-", "").includes("amber") ? "#f59e0b" : "#ef4444" }}>
                    <div className="flex items-start gap-3">
                      <div className={cn("flex size-8 items-center justify-center rounded-md shrink-0", config.bg, config.color)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-2xs text-muted-foreground mt-1.5">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      <span className={cn("size-2 rounded-full shrink-0 mt-1.5", config.dot)} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">Earlier</p>
          <div className="space-y-1.5">
            {read.map((n, i) => {
              const config = typeConfig[n.type];
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card padding="md" className="opacity-50 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={cn("flex size-8 items-center justify-center rounded-md shrink-0", config.bg, config.color)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-2xs text-muted-foreground mt-1.5">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {mockNotifications.length === 0 && (
        <Card padding="xl" className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-4">
            <BellOff className="size-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">All caught up</p>
          <p className="text-xs text-muted-foreground mt-1">No notifications right now</p>
        </Card>
      )}
    </div>
  );
}
