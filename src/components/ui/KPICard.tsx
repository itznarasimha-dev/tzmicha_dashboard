import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatNumber } from "@/utils";
import type { KPICard as KPICardType } from "@/types";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const colorConfig: Record<string, { accent: string; bg: string; text: string }> = {
  blue:    { accent: "#0EA5A4", bg: "#E6F7F7", text: "#0EA5A4" },
  violet:  { accent: "#14B8A6", bg: "#CCFBF1", text: "#0F766E" },
  emerald: { accent: "#22C55E", bg: "#DCFCE7", text: "#16A34A" },
  amber:   { accent: "#F59E0B", bg: "#FFFBEB", text: "#D97706" },
  red:     { accent: "#EF4444", bg: "#FEF2F2", text: "#EF4444" },
};

interface KPICardProps {
  card: KPICardType;
  icon?: React.ReactNode;
  index?: number;
}

export function KPICard({ card, icon, index = 0 }: KPICardProps) {
  const c = colorConfig[card.color] ?? colorConfig.blue;
  const isUp   = card.trend === "up";
  const isDown = card.trend === "down";
  const sparkData = card.sparkline?.map((v, i) => ({ v, i })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="rounded-[20px] bg-white border border-[#EEF2F7] shadow-[0_1px_4px_0_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.09)] transition-all duration-200 cursor-default flex flex-col overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4 flex-1">
        {/* Icon + label row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{card.title}</p>
          {icon && (
            <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.accent }}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <motion.p
          key={String(card.value)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[2.2rem] font-black tracking-tight leading-none text-[#111827]"
        >
          {typeof card.value === "number" ? formatNumber(card.value) : card.value}
        </motion.p>

        {/* Trend badge */}
        <div className="flex items-center gap-2 mt-3">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold",
            isUp   && "bg-[#ECFDF5] text-[#16C47F]",
            isDown && "bg-[#FEF2F2] text-[#EF4444]",
            !isUp && !isDown && "bg-[#F1F5F9] text-[#64748B]"
          )}>
            {isUp   && <TrendingUp className="size-3" />}
            {isDown && <TrendingDown className="size-3" />}
            {!isUp && !isDown && <Minus className="size-3" />}
            {isUp ? "+" : isDown ? "-" : ""}{Math.abs(card.change)}%
          </span>
          <span className="text-[11px] text-[#94A3B8]">{card.changeLabel}</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`kg-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={c.accent} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={c.accent} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={c.accent} strokeWidth={2} fill={`url(#kg-${card.id})`} dot={false} activeDot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
