import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  color?: "blue" | "violet" | "emerald" | "amber" | "red" | "rose";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const colorMap = {
  blue: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  rose: "bg-rose-500",
};

const sizeMap = {
  xs: "h-0.5",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

export function Progress({
  value,
  color = "rose",
  size = "sm",
  showLabel,
  label,
  animated = true,
  className,
  ...props
}: ProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showLabel && <span className="text-xs font-bold text-foreground">{value}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        className={cn(
          "relative overflow-hidden rounded-full bg-muted/70",
          sizeMap[size],
          className
        )}
        value={value}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full rounded-full",
            colorMap[color],
            animated && "transition-all duration-700 ease-out"
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
