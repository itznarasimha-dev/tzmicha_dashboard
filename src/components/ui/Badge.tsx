import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[#EEF4FF] text-[#4F7CFF]",
        secondary:   "bg-[#F1F5F9] text-[#64748B]",
        success:     "bg-[#ECFDF5] text-[#16C47F]",
        warning:     "bg-[#FFFBEB] text-[#D97706]",
        danger:      "bg-[#FEF2F2] text-[#EF4444]",
        muted:       "bg-muted text-muted-foreground",
        outline:     "border border-border text-foreground bg-transparent",
        blue:        "bg-[#EEF4FF] text-[#4F7CFF]",
        violet:      "bg-[#F3F0FF] text-[#7B61FF]",
        indigo:      "bg-[#EEF2FF] text-[#6366F1]",
        cyan:        "bg-[#ECFEFF] text-[#0891B2]",
        purple:      "bg-[#F5F3FF] text-[#8B5CF6]",
        pending:     "bg-[#F3F0FF] text-[#7B61FF]",
        draft:       "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]",
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
