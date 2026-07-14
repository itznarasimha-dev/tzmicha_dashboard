import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, getInitials, getAvatarColor } from "@/utils";

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
AvatarRoot.displayName = "AvatarRoot";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square size-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex size-full items-center justify-center rounded-full text-white text-xs font-semibold", className)}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "active" | "inactive" | "on-leave";
}

const sizeMap = {
  xs: "size-6 text-2xs",
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
  xl: "size-14 text-lg",
};

const statusColors = {
  active: "bg-emerald-500",
  inactive: "bg-muted-foreground",
  "on-leave": "bg-amber-500",
};

export function Avatar({ src, name, size = "md", className, showStatus, status = "active" }: AvatarProps) {
  const colorClass = getAvatarColor(name);
  return (
    <div className="relative inline-flex">
      <AvatarRoot className={cn(sizeMap[size], className)}>
        {src && <AvatarImage src={src} alt={name} />}
        <AvatarFallback className={colorClass}>{getInitials(name)}</AvatarFallback>
      </AvatarRoot>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            statusColors[status],
            size === "xs" ? "size-1.5" : size === "sm" ? "size-2" : "size-2.5"
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ users, max = 4 }: { users: { name: string; src?: string }[]; max?: number }) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} src={u.src} size="sm" className="ring-2 ring-background" />
      ))}
      {remaining > 0 && (
        <div className="flex size-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs font-medium text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  );
}
