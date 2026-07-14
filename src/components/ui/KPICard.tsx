import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatNumber } from "@/utils";
import type { KPICard as KPICardType } from "@/types";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const colorConfig = {
  blue: {
    band: "bg-indigo-600",
    bandText: "text-white",
    accent: "#6366f1",
    iconOpacity: "opacity-10",
  },
  violet: {
    band: "bg-violet-600",
    bandText: "text-white",
    accent: "#8b5cf6",
    iconOpacity: "opacity-10",
  },
  emerald: {
    band: "bg-emerald-700",
    bandText: "text-white",
    accent: "#10b981",
    iconOpacity: "opacity-10",
  },
  amber: {
    band: "bg-amber-500",
    bandText: "text-white",
    accent: "#f59e0b",
    iconOpacity: "opacity-10",
  },
  red: {
    band: "bg-rose-600",
    bandText: "text-white",
    accent: "#f43f5e",
    iconOpacity: "opacity-10",
  },
};

interface KPICardProps {
  card: KPICardType;
  icon: React.ReactNode;
  index?: number;
}

export function KPICard({ card, icon, index = 0 }: KPICardProps) {
  const c = colorConfig[card.color];
  const isUp = card.trend === "up";
  const isDown = card.trend === "down";
  const sparkData = card.sparkline?.map((v, i) => ({ v, i })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-all duration-300 cursor-default flex flex-col min-h-[220px]"
    >
      {/* Colored top band */}
      <div className={cn("px-5 py-3.5 flex items-center justify-between shrink-0", c.band)}>
        <p className={cn("text-[11px] font-black uppercase tracking-[0.12em]", c.bandText)}>
          {card.title}
        </p>
        <span className="text-white/60 scale-90">{icon}</span>
      </div>

      {/* Body */}
      <div className="bg-card flex-1 flex flex-col relative overflow-hidden">

        {/* Content */}
        <div className="px-5 pt-4 pb-2 flex-1 relative z-10">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">KPI</p>

          <div className="flex items-start justify-between gap-2">
            <div>
              <motion.p
                key={String(card.value)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[2.6rem] font-black tracking-tight leading-none text-foreground"
              >
                {typeof card.value === "number" ? formatNumber(card.value) : card.value}
              </motion.p>
              <p className="text-[12px] text-muted-foreground mt-1.5 font-medium leading-snug">
                {card.changeLabel}
              </p>
            </div>

            {/* Large decorative icon bottom-right */}
            <div className="shrink-0 mt-1" style={{ color: c.accent, opacity: 0.18 }}>
              <span style={{ transform: "scale(2.8)", display: "block", transformOrigin: "top right" }}>
                {icon}
              </span>
            </div>
          </div>

          {/* Trend badge */}
          <div className="mt-3">
            <span className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold",
              isUp && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
              isDown && "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
              !isUp && !isDown && "bg-muted text-muted-foreground"
            )}>
              {isUp && <TrendingUp className="size-3" />}
              {isDown && <TrendingDown className="size-3" />}
              {!isUp && !isDown && <Minus className="size-3" />}
              {isUp ? "+" : isDown ? "-" : ""}{Math.abs(card.change)}%
            </span>
          </div>
        </div>

        {/* Full-width sparkline filling bottom */}
        {sparkData.length > 0 && (
          <div className="h-16 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`kg-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.accent} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={c.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={c.accent}
                  strokeWidth={2.5}
                  fill={`url(#kg-${card.id})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
