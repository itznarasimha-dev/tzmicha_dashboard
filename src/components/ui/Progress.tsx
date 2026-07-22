import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  color?: "blue" | "violet" | "emerald" | "amber" | "red" | "cyan" | "purple";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const colorMap = {
  blue:    "bg-[#4F7CFF]",
  violet:  "bg-[#7B61FF]",
  emerald: "bg-[#16C47F]",
  amber:   "bg-[#F59E0B]",
  red:     "bg-[#EF4444]",
  cyan:    "bg-[#22C7E8]",
  purple:  "bg-[#8B5CF6]",
};

const sizeMap = {
  xs: "h-0.5",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

export function Progress({ value, color = "blue", size = "sm", showLabel, label, animated = true, className, ...props }: ProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-[#64748B]">{label}</span>}
          {showLabel && <span className="text-xs font-bold text-[#334155]">{value}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        className={cn("relative overflow-hidden rounded-full bg-[#F1F5F9]", sizeMap[size], className)}
        value={value}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full rounded-full", colorMap[color], animated && "transition-all duration-700 ease-out")}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
