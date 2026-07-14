import * as React from "react";
import { cn } from "@/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "ghost" | "bordered";
}

export function Card({ className, hover, padding = "md", variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border",
        variant === "default" && "shadow-card",
        variant === "ghost" && "bg-transparent border-transparent shadow-none",
        variant === "bordered" && "shadow-none",
        hover && "transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer",
        padding === "none" && "",
        padding === "sm" && "p-4",
        padding === "md" && "p-5",
        padding === "lg" && "p-6",
        padding === "xl" && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-[14px] font-bold text-foreground leading-snug tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[11px] text-muted-foreground mt-0.5 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-4 mt-4 border-t border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-2xs font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-3", className)}>
      {children}
    </p>
  );
}
