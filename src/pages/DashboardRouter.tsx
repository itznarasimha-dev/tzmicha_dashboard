import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { FrontendDashboard } from '@/pages/developer/FrontendDashboard';
import { QADashboard } from '@/pages/qa/QADashboard';
import { MarketingDashboard } from '@/pages/marketing/MarketingDashboard';
import { HRDashboard } from '@/pages/hr/HRDashboard';

function ComingSoon({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <span className="text-3xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Coming Soon</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        The <span className="font-semibold text-foreground capitalize">{role.replace('_', ' ')}</span> dashboard is currently under construction. Check back soon!
      </p>
    </div>
  );
}

export function DashboardRouter() {
  const user = useAppStore(s => s.user);
  if (!user) return null;

  switch (user.role as string) {
    case 'admin':             return <AdminDashboard />;
    case 'frontend-dev':
    case 'frontend_dev':
    case 'backend-dev':
    case 'backend_dev':       return <FrontendDashboard />;
    case 'qa':                return <QADashboard />;
    case 'marketing':         return <MarketingDashboard />;
    case 'hr':                return <HRDashboard />;
    case 'product-manager':
    case 'product_manager':   return <ComingSoon role="Product Manager" />;
    case 'sales':             return <ComingSoon role="Sales" />;
    case 'finance':           return <Navigate to="/finance/dashboard" replace />;
    default:                  return <AdminDashboard />;
  }
}
