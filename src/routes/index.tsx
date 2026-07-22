import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardRouter } from '@/pages/DashboardRouter';
import { EmployeesPage } from '@/pages/shared/EmployeesPage';
import SprintBoardPage from '@/pages/shared/SprintBoardPage';
import { WorkUpdatesPage } from '@/pages/shared/WorkUpdatesPage';
import { NotificationsPage } from '@/pages/shared/NotificationsPage';
import { AnalyticsPage } from '@/pages/shared/AnalyticsPage';
import { SettingsPage } from '@/pages/shared/SettingsPage';
import { ProjectsPage } from '@/pages/shared/ProjectsPage';
import { TasksPage } from '@/pages/shared/TasksPage';
import { ActivityPage } from '@/pages/shared/ActivityPage';
import { LeavePage } from '@/pages/shared/LeavePage';
import { OrgChartPage } from '@/pages/shared/OrgChartPage';
import { AttendancePage } from '@/pages/shared/AttendancePage';
import { CampaignsPage as SharedCampaignsPage } from '@/pages/shared/CampaignsPage';
import { SalesPipelinePage } from '@/pages/shared/SalesPipelinePage';
import { RoadmapPage } from '@/pages/shared/RoadmapPage';
import { CalendarPage } from '@/pages/shared/CalendarPage';
import { MeetingsPage, FilesPage, KnowledgeBasePage, HelpCenterPage } from '@/pages/shared/MiscPages';
import { RecruitmentPage } from '@/pages/shared/RecruitmentPage';
import { CampaignsPage } from '@/pages/marketing/CampaignsPage';
import { ContactsPage } from '@/pages/marketing/ContactsPage';
import { SmsPage } from '@/pages/marketing/SmsPage';
import { WhatsAppPage } from '@/pages/marketing/WhatsAppPage';
import { RcsPage } from '@/pages/marketing/RcsPage';
import { EmailPage } from '@/pages/marketing/EmailPage';
import { AutomationPage } from '@/pages/marketing/AutomationPage';
import { AiFallbackPage } from '@/pages/marketing/AiFallbackPage';
import { AiVoiceAgentPage } from '@/pages/marketing/AiVoiceAgentPage';
import { SocialMediaPage } from '@/pages/marketing/SocialMediaPage';
import { PipelinePage } from '@/pages/marketing/PipelinePage';
import { ReportsPage } from '@/pages/marketing/ReportsPage';
import { WalletPage } from '@/pages/marketing/WalletPage';
import { InvoicesPage } from '@/pages/finance/InvoicesPage';
import { ExpensesPage } from '@/pages/finance/ExpensesPage';
import { PaymentsPage } from '@/pages/finance/PaymentsPage';
import { PayrollPage } from '@/pages/finance/PayrollPage';
import { BudgetsPage } from '@/pages/finance/BudgetsPage';
import { ReportsPage as FinanceReportsPage } from '@/pages/finance/ReportsPage';
import { useAppStore } from '@/store/appStore';
import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';

function ProtectedRoute() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard',    element: <DashboardRouter /> },
          { path: 'analytics',   element: <AnalyticsPage /> },
          { path: 'activity',    element: <ActivityPage /> },
          { path: 'projects',    element: <ProjectsPage /> },
          { path: 'tasks',       element: <TasksPage /> },
          { path: 'sprint',      element: <SprintBoardPage /> },
          { path: 'work-updates',element: <WorkUpdatesPage /> },
          { path: 'employees',   element: <EmployeesPage /> },
          { path: 'org-chart',   element: <OrgChartPage /> },
          { path: 'leave',       element: <LeavePage /> },
          { path: 'attendance',  element: <AttendancePage /> },
          { path: 'recruitment', element: <RecruitmentPage /> },
          { path: 'marketing',   element: <SharedCampaignsPage /> },
          { path: 'sales',       element: <SalesPipelinePage /> },
          { path: 'roadmap',     element: <RoadmapPage /> },
          { path: 'calendar',    element: <CalendarPage /> },
          { path: 'meetings',    element: <MeetingsPage /> },
          { path: 'files',       element: <FilesPage /> },
          { path: 'knowledge',   element: <KnowledgeBasePage /> },
          { path: 'notifications',element: <NotificationsPage /> },
          { path: 'mkt/dashboard',  element: <Navigate to="/dashboard" replace /> },
          { path: 'mkt/social',      element: <SocialMediaPage /> },
          { path: 'mkt/campaigns',   element: <CampaignsPage /> },
          { path: 'mkt/contacts',    element: <ContactsPage /> },
          { path: 'mkt/sms',         element: <SmsPage /> },
          { path: 'mkt/whatsapp',    element: <WhatsAppPage /> },
          { path: 'mkt/rcs',         element: <RcsPage /> },
          { path: 'mkt/email',       element: <EmailPage /> },
          { path: 'mkt/automation',  element: <AutomationPage /> },
          { path: 'mkt/fallback',    element: <AiFallbackPage /> },
          { path: 'mkt/voice',       element: <AiVoiceAgentPage /> },
          { path: 'mkt/pipeline',    element: <PipelinePage /> },
          { path: 'mkt/reports',     element: <ReportsPage /> },
          { path: 'mkt/wallet',      element: <WalletPage /> },
          { path: 'finance/dashboard', element: <FinanceDashboard /> },
          { path: 'finance/invoices', element: <InvoicesPage /> },
          { path: 'finance/expenses', element: <ExpensesPage /> },
          { path: 'finance/payments', element: <PaymentsPage /> },
          { path: 'finance/payroll',  element: <PayrollPage /> },
          { path: 'finance/budgets',  element: <BudgetsPage /> },
          { path: 'finance/reports',  element: <FinanceReportsPage /> },
          { path: 'settings',    element: <SettingsPage /> },
          { path: 'help',        element: <HelpCenterPage /> },
        ],
      },
    ],
  },
]);
