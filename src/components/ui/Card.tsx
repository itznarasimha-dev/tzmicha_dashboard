import * as React from "react";
import { cn } from "@/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "ghost" | "bordered" | "elevated";
}

export function Card({ className, hover, padding = "md", variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card border border-[#EEF2F7]",
        variant === "default"  && "shadow-[0_1px_4px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.03)]",
        variant === "elevated" && "shadow-[0_4px_16px_-2px_rgba(0,0,0,0.07),0_2px_6px_-2px_rgba(0,0,0,0.04)]",
        variant === "ghost"    && "bg-transparent border-transparent shadow-none",
        variant === "bordered" && "shadow-none",
        hover && [
          "transition-all duration-200 cursor-pointer",
          "hover:-translate-y-0.5",
          "hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.10),0_4px_8px_-4px_rgba(0,0,0,0.05)]",
          "hover:border-[#DDE5EE]",
        ].join(" "),
        padding === "none" && "",
        padding === "sm"   && "p-4",
        padding === "md"   && "p-5",
        padding === "lg"   && "p-6",
        padding === "xl"   && "p-8",
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
    <div className={cn("flex items-start justify-between gap-3 mb-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-[14px] font-bold text-[#111827] leading-snug tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[12px] text-[#94A3B8] mt-0.5 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-4 mt-4 border-t border-[#EEF2F7]", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8] mb-3", className)}>
      {children}
    </p>
  );
}
