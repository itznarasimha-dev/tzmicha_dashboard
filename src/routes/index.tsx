import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardRouter } from "@/pages/DashboardRouter";
import { EmployeesPage } from "@/pages/shared/EmployeesPage";
import { SprintBoardPage } from "@/pages/shared/SprintBoardPage";
import { WorkUpdatesPage } from "@/pages/shared/WorkUpdatesPage";
import { NotificationsPage } from "@/pages/shared/NotificationsPage";
import { AnalyticsPage } from "@/pages/shared/AnalyticsPage";
import { SettingsPage } from "@/pages/shared/SettingsPage";

// Lazy placeholder for pages not yet built
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <span className="text-muted-foreground">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </span>
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1.5">This page is coming soon.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardRouter /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "activity", element: <ComingSoon title="Activity Log" /> },
      { path: "projects", element: <ComingSoon title="Projects" /> },
      { path: "tasks", element: <ComingSoon title="Tasks" /> },
      { path: "sprint", element: <SprintBoardPage /> },
      { path: "qa", element: <ComingSoon title="QA & Testing" /> },
      { path: "work-updates", element: <WorkUpdatesPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "org-chart", element: <ComingSoon title="Org Chart" /> },
      { path: "leave", element: <ComingSoon title="Leave Management" /> },
      { path: "attendance", element: <ComingSoon title="Attendance" /> },
      { path: "marketing", element: <ComingSoon title="Campaigns" /> },
      { path: "sales", element: <ComingSoon title="Sales Pipeline" /> },
      { path: "roadmap", element: <ComingSoon title="Roadmap" /> },
      { path: "calendar", element: <ComingSoon title="Calendar" /> },
      { path: "meetings", element: <ComingSoon title="Meetings" /> },
      { path: "files", element: <ComingSoon title="Files" /> },
      { path: "knowledge", element: <ComingSoon title="Knowledge Base" /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "help", element: <ComingSoon title="Help Center" /> },
    ],
  },
]);
