import * as React from "react";
import { cn } from "@/utils";

const inputBase = [
  "flex w-full rounded-xl border border-[#DDE5EE] bg-white px-3.5 py-2 text-[13px] text-[#334155]",
  "placeholder:text-[#CBD5E1]",
  "shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]",
  "transition-all duration-200",
  "focus-visible:outline-none",
  "focus-visible:border-[#4F7CFF]",
  "focus-visible:shadow-[0_0_0_3px_rgba(79,124,255,0.14),0_1px_2px_0_rgba(0,0,0,0.04)]",
  "hover:border-[#b8c4d4]",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F8FAFC]",
].join(" ");

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-[#334155]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{leftIcon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputBase,
              "h-10",
              error && "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.14)]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-[#94A3B8]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-[#334155]">{label}</label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            inputBase,
            "min-h-[100px] py-3 resize-none",
            error && "border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.14)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-[#334155]">{label}</label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            inputBase,
            "h-10",
            error && "border-[#EF4444]",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
