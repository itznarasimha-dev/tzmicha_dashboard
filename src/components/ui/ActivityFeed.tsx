import { GitCommit, Bug, Rocket, Umbrella, Megaphone, CheckSquare, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { ActivityItem } from "@/types";

const typeConfig = {
  commit: { icon: <GitCommit className="size-3" />, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  deploy: { icon: <Rocket className="size-3" />, bg: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
  bug: { icon: <Bug className="size-3" />, bg: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" },
  task: { icon: <CheckSquare className="size-3" />, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  leave: { icon: <Umbrella className="size-3" />, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  review: { icon: <CheckSquare className="size-3" />, bg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400" },
  campaign: { icon: <Megaphone className="size-3" />, bg: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" },
  general: { icon: <User className="size-3" />, bg: "bg-muted text-muted-foreground" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, className, maxItems = 8 }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.slice(0, maxItems).map((item, i) => {
        const config = typeConfig[item.type];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 py-3 border-b border-border last:border-0 group hover:bg-muted/30 -mx-1 px-1 rounded-lg transition-colors duration-150 cursor-pointer"
          >
            {/* Avatar with type badge */}
            <div className="relative shrink-0 mt-0.5">
              <Avatar name={item.user.name} src={item.user.avatar} size="sm" />
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-card",
                config.bg
              )}>
                {config.icon}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground leading-snug">
                <span className="font-semibold">{item.user.name}</span>
                {" "}
                <span className="text-muted-foreground">{item.action}</span>
                {" "}
                <span className="font-medium text-primary">{item.target}</span>
              </p>
              <p className="text-2xs text-muted-foreground mt-1">{formatRelativeTime(item.timestamp)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
