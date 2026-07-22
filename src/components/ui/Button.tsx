import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40 select-none",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[#0EA5A4] text-white rounded-xl",
          "shadow-[0_2px_8px_-1px_rgba(14,165,164,0.35)]",
          "hover:bg-[#0c8f8e] hover:shadow-[0_4px_14px_-2px_rgba(14,165,164,0.45)]",
          "hover:scale-[1.02]",
        ].join(" "),
        secondary: [
          "bg-card text-[#334155] rounded-xl border border-[#D6DCE5]",
          "shadow-xs hover:shadow-card hover:border-[#b8c4d4] hover:bg-[#F8FAFC]",
        ].join(" "),
        outline: [
          "bg-transparent text-[#334155] rounded-xl border border-[#D6DCE5]",
          "hover:bg-[#F8FAFC] hover:border-[#b8c4d4]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[#64748B] rounded-xl",
          "hover:bg-muted hover:text-[#334155]",
        ].join(" "),
        destructive: [
          "bg-[#EF4444] text-white rounded-xl",
          "shadow-xs hover:bg-[#DC2626] hover:scale-[1.02]",
        ].join(" "),
        success: [
          "bg-[#16C47F] text-white rounded-xl",
          "shadow-xs hover:bg-[#0ea86b] hover:scale-[1.02]",
        ].join(" "),
        link: "text-[#0EA5A4] underline-offset-4 hover:underline rounded-none p-0 h-auto",
        premium: [
          "bg-[#111827] text-white rounded-xl",
          "shadow-xs hover:bg-[#1f2937] hover:scale-[1.02]",
        ].join(" "),
      },
      size: {
        xs:       "h-7 px-2.5 text-xs rounded-lg",
        sm:       "h-8 px-3.5 text-[13px]",
        md:       "h-9 px-4 text-sm",
        lg:       "h-10 px-5 text-[15px]",
        xl:       "h-11 px-6 text-base",
        icon:     "size-9 rounded-xl",
        "icon-sm":"size-8 rounded-xl",
        "icon-xs":"size-7 rounded-lg",
        "icon-lg":"size-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";
