import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
        secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground bg-transparent",
        blue: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
        violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
