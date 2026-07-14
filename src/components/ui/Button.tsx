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
          "bg-rose-600 text-white rounded-lg",
          "shadow-[0_2px_10px_-2px_rgba(244,63,94,0.5)]",
          "hover:bg-rose-500 hover:shadow-[0_4px_16px_-2px_rgba(244,63,94,0.55)]",
        ].join(" "),
        secondary: [
          "bg-card text-foreground rounded-lg border border-border",
          "shadow-xs hover:shadow-card hover:border-border-strong",
        ].join(" "),
        outline: [
          "bg-transparent text-foreground rounded-lg border border-border",
          "hover:bg-muted hover:border-border-strong",
        ].join(" "),
        ghost: [
          "bg-transparent text-muted-foreground rounded-lg",
          "hover:bg-muted hover:text-foreground",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground rounded-lg",
          "shadow-xs hover:bg-destructive/90",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline rounded-none p-0 h-auto",
        premium: [
          "bg-foreground text-background rounded-lg",
          "shadow-xs hover:bg-foreground/90",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-[15px]",
        xl: "h-12 px-7 text-base",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-7 rounded-md",
        "icon-lg": "size-10 rounded-lg",
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
