import { useAppStore } from "@/store/appStore";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { FrontendDashboard } from "@/pages/developer/FrontendDashboard";
import { QADashboard } from "@/pages/qa/QADashboard";
import { MarketingDashboard } from "@/pages/marketing/MarketingDashboard";
import { HRDashboard } from "@/pages/hr/HRDashboard";

export function DashboardRouter() {
  const { currentUser } = useAppStore();

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;
    case "frontend-dev":
    case "backend-dev":
      return <FrontendDashboard />;
    case "qa":
      return <QADashboard />;
    case "marketing":
      return <MarketingDashboard />;
    case "hr":
      return <HRDashboard />;
    default:
      return <AdminDashboard />;
  }
}
