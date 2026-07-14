import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/utils";

// ─── Premium Tooltip ──────────────────────────────────────────────────────────

function PremiumTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-border bg-card/95 px-3.5 py-2.5 text-xs"
      style={{ boxShadow: "var(--shadow-lg)", backdropFilter: "blur(12px)" }}
    >
      {label && <p className="font-semibold text-foreground mb-2 text-[13px]">{label}</p>}
      <div className="space-y-1.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}</span>
            <span className="font-semibold text-foreground ml-auto pl-4">
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const axisStyle = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
};

// ─── Area Chart ───────────────────────────────────────────────────────────────

interface SeriesConfig {
  key: string;
  color?: string;
  label?: string;
}

interface AreaChartProps {
  data: Record<string, string | number>[];
  series: SeriesConfig[];
  height?: number;
  className?: string;
  xKey?: string;
}

export function AreaChartComponent({ data, series, height = 240, className, xKey = "label" }: AreaChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? "#3b82f6";
              return (
                <linearGradient key={s.key} id={`area-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="hsl(var(--border))"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            dx={-4}
          />
          <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
          {series.map((s) => {
            const color = s.color ?? "#3b82f6";
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#area-grad-${s.key})`}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: Record<string, string | number>[];
  series: SeriesConfig[];
  height?: number;
  className?: string;
  xKey?: string;
  stacked?: boolean;
  horizontal?: boolean;
}

export function BarChartComponent({ data, series, height = 240, className, xKey = "label", stacked, horizontal }: BarChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 4, bottom: 0, left: horizontal ? 0 : -16 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="hsl(var(--border))"
            strokeOpacity={0.6}
            vertical={horizontal}
            horizontal={!horizontal}
          />
          {horizontal ? (
            <>
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey={xKey} type="category" tick={axisStyle} axisLine={false} tickLine={false} width={72} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-4} />
            </>
          )}
          <Tooltip content={<PremiumTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
          {series.map((s) => {
            const color = s.color ?? "#3b82f6";
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label ?? s.key}
                fill={color}
                radius={stacked ? [0, 0, 0, 0] : [5, 5, 0, 0]}
                stackId={stacked ? "stack" : undefined}
                maxBarSize={36}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  className?: string;
  showLegend?: boolean;
}

export function DonutChart({ data, height = 200, innerRadius = 58, className, showLegend = true }: DonutChartProps) {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="shrink-0" style={{ height, width: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={innerRadius + 30}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PremiumTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground truncate">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-foreground shrink-0">{d.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────

interface LineChartProps {
  data: Record<string, string | number>[];
  series: SeriesConfig[];
  height?: number;
  className?: string;
  xKey?: string;
}

export function LineChartComponent({ data, series, height = 240, className, xKey = "label" }: LineChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-4} />
          <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
          {series.map((s) => {
            const color = s.color ?? "#3b82f6";
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
