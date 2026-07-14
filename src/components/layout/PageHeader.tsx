import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6", className)}>
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">{eyebrow}</p>
        )}

        {/* Title */}
        <h1 className="text-[1.625rem] font-bold text-foreground tracking-tight leading-tight">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{description}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 pt-1">{actions}</div>
      )}
    </div>
  );
}
