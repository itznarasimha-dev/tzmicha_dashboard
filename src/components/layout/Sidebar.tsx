import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare, Layers, Calendar,
  Video, Clock, Umbrella, GitBranch, BarChart3, Bell,
  BookOpen, Files, Settings, Activity, HelpCircle,
  ClipboardList, Target, TrendingUp, Megaphone, ChevronLeft, ChevronRight, Briefcase,
  MessageSquare, Mail, Zap, Phone, Bot, Sparkles, Wallet, Share2,
  Receipt, CreditCard, Users2, PieChart, FileBarChart, Search, LogOut,
} from "lucide-react";
import { cn } from "@/utils";
import { useAppStore } from "@/store/appStore";
import { ROLE_LABELS } from "@/constants";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { useUnreadCount } from "@/hooks";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "@/types";

const W_OPEN  = 280;
const W_CLOSED = 72;

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  id: string; label: string; icon: React.ReactNode;
  path?: string; badge?: number | string; roles?: UserRole[]; isNew?: boolean; isPro?: boolean;
}
interface NavSection { id: string; label: string; items: NavItem[]; }

// ── Section label overrides per role ─────────────────────────────────────────
const SECTION_LABELS: Record<string, Partial<Record<UserRole | "admin", string>>> = {
  main:           { admin: "Overview" },
  work:           { admin: "Development", "frontend-dev": "My Work", "backend-dev": "My Work", "product-manager": "My Work", qa: "My Work", marketing: "My Work", sales: "My Work", hr: "My Work" },
  people:         { admin: "People", hr: "People" },
  growth:         { admin: "Growth", marketing: "Marketing", sales: "Sales" },
  mktchannels:    { marketing: "Channels", admin: "Channels" },
  financeSection: { finance: "Finance", admin: "Finance" },
  workspace:      { admin: "Workspace" },
  system:         { admin: "System" },
};

// ── Nav data ──────────────────────────────────────────────────────────────────
const allNavSections: NavSection[] = [
  { id: "main", label: "Overview", items: [
    { id: "dashboard-fin", label: "Dashboard",  icon: <LayoutDashboard size={16} />, path: "/finance/dashboard", roles: ["finance"] },
    { id: "dashboard",     label: "Dashboard",  icon: <LayoutDashboard size={16} />, path: "/dashboard", roles: ["admin","frontend_dev","backend_dev","qa","marketing","hr","product_manager","sales"] },
    { id: "analytics",     label: "Analytics",  icon: <BarChart3 size={16} />,       path: "/analytics" },
    { id: "activity",      label: "Activity",   icon: <Activity size={16} />,        path: "/activity", roles: ["admin"] },
  ]},
  { id: "work", label: "Development", items: [
    { id: "projects",     label: "Projects",     icon: <FolderKanban size={16} />, path: "/projects",     roles: ["admin","frontend-dev","backend-dev","qa","product-manager"] },
    { id: "tasks",        label: "Tasks",        icon: <CheckSquare size={16} />,  path: "/tasks",        roles: ["admin","frontend-dev","backend-dev","qa","product-manager"] },
    { id: "sprint",       label: "Sprint Board", icon: <Layers size={16} />,       path: "/sprint",       roles: ["admin","frontend-dev","backend-dev","qa","product-manager"] },
    { id: "work-updates", label: "Work Updates", icon: <ClipboardList size={16} />,path: "/work-updates" },
    { id: "leave",        label: "Leave",        icon: <Umbrella size={16} />,     path: "/leave" },
  ]},
  { id: "people", label: "People", items: [
    { id: "employees",   label: "Employees",   icon: <Users size={16} />,    path: "/employees",   roles: ["admin","hr"] },
    { id: "org-chart",   label: "Org Chart",   icon: <GitBranch size={16} />,path: "/org-chart",   roles: ["admin","hr"] },
    { id: "attendance",  label: "Attendance",  icon: <Clock size={16} />,    path: "/attendance",  roles: ["admin","hr"] },
    { id: "recruitment", label: "Recruitment", icon: <Briefcase size={16} />,path: "/recruitment", roles: ["admin","hr"] },
  ]},
  { id: "growth", label: "Growth", items: [
    { id: "campaigns", label: "Campaigns",      icon: <Megaphone size={16} />,  path: "/marketing", roles: ["admin"] },
    { id: "sales",     label: "Sales Pipeline", icon: <TrendingUp size={16} />, path: "/sales",     roles: ["admin","sales"] },
    { id: "roadmap",   label: "Roadmap",        icon: <Target size={16} />,     path: "/roadmap",   roles: ["admin","product-manager","frontend-dev","backend-dev"], isNew: true },
  ]},
  { id: "mktchannels", label: "Channels", items: [
    { id: "mkt-social",     label: "Social Media",     icon: <Share2 size={16} />,        path: "/mkt/social",     roles: ["marketing","admin"] },
    { id: "mkt-campaigns",  label: "Campaigns",        icon: <Megaphone size={16} />,     path: "/mkt/campaigns",  roles: ["marketing","admin"] },
    { id: "mkt-contacts",   label: "Contacts / Leads", icon: <Users size={16} />,         path: "/mkt/contacts",   roles: ["marketing","admin"] },
    { id: "mkt-sms",        label: "SMS",              icon: <MessageSquare size={16} />, path: "/mkt/sms",        roles: ["marketing","admin"] },
    { id: "mkt-whatsapp",   label: "WhatsApp",         icon: <MessageSquare size={16} />, path: "/mkt/whatsapp",   roles: ["marketing","admin"] },
    { id: "mkt-rcs",        label: "RCS",              icon: <Sparkles size={16} />,      path: "/mkt/rcs",        roles: ["marketing","admin"] },
    { id: "mkt-email",      label: "Email",            icon: <Mail size={16} />,          path: "/mkt/email",      roles: ["marketing","admin"] },
    { id: "mkt-automation", label: "Automation",       icon: <Zap size={16} />,           path: "/mkt/automation", roles: ["marketing","admin"] },
    { id: "mkt-fallback",   label: "AI Fallback",      icon: <Bot size={16} />,           path: "/mkt/fallback",   roles: ["marketing","admin"] },
    { id: "mkt-voice",      label: "AI Voice Agent",   icon: <Phone size={16} />,         path: "/mkt/voice",      roles: ["marketing","admin"] },
    { id: "mkt-pipeline",   label: "Pipeline",         icon: <TrendingUp size={16} />,    path: "/mkt/pipeline",   roles: ["marketing","admin"] },
    { id: "mkt-reports",    label: "Reports",          icon: <BookOpen size={16} />,      path: "/mkt/reports",    roles: ["marketing","admin"] },
    { id: "mkt-wallet",     label: "Wallet",           icon: <Wallet size={16} />,        path: "/mkt/wallet",     roles: ["marketing","admin"] },
  ]},
  { id: "financeSection", label: "Finance", items: [
    { id: "fin-invoices", label: "Invoices", icon: <Receipt size={16} />,      path: "/finance/invoices", roles: ["finance","admin"] },
    { id: "fin-expenses", label: "Expenses", icon: <CreditCard size={16} />,   path: "/finance/expenses", roles: ["finance","admin"] },
    { id: "fin-payments", label: "Payments", icon: <Wallet size={16} />,       path: "/finance/payments", roles: ["finance","admin"] },
    { id: "fin-payroll",  label: "Payroll",  icon: <Users2 size={16} />,       path: "/finance/payroll",  roles: ["finance","admin"] },
    { id: "fin-budgets",  label: "Budgets",  icon: <PieChart size={16} />,     path: "/finance/budgets",  roles: ["finance","admin"] },
    { id: "fin-reports",  label: "Reports",  icon: <FileBarChart size={16} />, path: "/finance/reports",  roles: ["finance","admin"] },
  ]},
  { id: "workspace", label: "Workspace", items: [
    { id: "calendar",      label: "Calendar",       icon: <Calendar size={16} />, path: "/calendar" },
    { id: "meetings",      label: "Meetings",       icon: <Video size={16} />,    path: "/meetings" },
    { id: "files",         label: "Files",          icon: <Files size={16} />,    path: "/files" },
    { id: "knowledge",     label: "Knowledge Base", icon: <BookOpen size={16} />, path: "/knowledge" },
    { id: "notifications", label: "Notifications",  icon: <Bell size={16} />,     path: "/notifications" },
  ]},
  { id: "system", label: "System", items: [
    { id: "settings", label: "Settings",    icon: <Settings size={16} />,   path: "/settings" },
    { id: "help",     label: "Help Center", icon: <HelpCircle size={16} />, path: "/help" },
  ]},
];

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItemRow({ item, collapsed, onNavigate }: {
  item: NavItem; collapsed: boolean; onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = item.path
    ? location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    : false;

  const inner = (
    <motion.div
      whileHover={{ x: collapsed ? 0 : 2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative flex items-center gap-3 rounded-lg cursor-pointer select-none transition-all duration-200",
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5",
        isActive
          ? "bg-white/[0.08] text-white"
          : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
      )}
    >


      {/* Icon */}
      <motion.span
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "shrink-0 transition-colors duration-200",
          isActive ? "text-[#0EA5A4]" : "text-white/35 group-hover:text-white/70"
        )}
      >
        {item.icon}
      </motion.span>

      {/* Label + badges */}
      {!collapsed && (
        <>
          <span className={cn(
            "flex-1 truncate text-[13px] transition-all duration-200",
            isActive ? "font-semibold text-white" : "font-medium"
          )}>
            {item.label}
          </span>

          {item.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#0EA5A4]/20 text-[#0EA5A4] border border-[#0EA5A4]/25 uppercase tracking-wider leading-none">
              New
            </span>
          )}
          {item.isPro && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase tracking-wider leading-none">
              Pro
            </span>
          )}
          {item.badge !== undefined && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0EA5A4] text-white text-[10px] font-bold px-1 leading-none shadow-[0_0_8px_rgba(14,165,164,0.4)]">
              {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed badge dot */}
      {collapsed && item.badge !== undefined && (
        <span className="absolute top-1 right-1 size-[6px] rounded-full bg-[#0EA5A4] shadow-[0_0_6px_rgba(14,165,164,0.7)]" />
      )}
    </motion.div>
  );

  const wrapped = item.path ? (
    <NavLink to={item.path} className="block" onClick={onNavigate}>{inner}</NavLink>
  ) : inner;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><div>{wrapped}</div></TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return <div>{wrapped}</div>;
}

// ── Sidebar Content ───────────────────────────────────────────────────────────
function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user: currentUser, toggleSidebar, setCommandOpen, logout } = useAppStore();
  const { data: unreadCount = 0 } = useUnreadCount();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const sections = allNavSections
    .map((s) => ({
      ...s,
      label: SECTION_LABELS[s.id]?.[currentUser.role] ?? SECTION_LABELS[s.id]?.admin ?? s.label,
      items: s.items
        .map(i => i.id === "notifications" ? { ...i, badge: unreadCount > 0 ? unreadCount : undefined } : i)
        .filter((i) => {
          if (!i.roles) return true;
          const role = currentUser.role as string;
          return i.roles.some(r => r === role || r.replace(/-/g, "_") === role || r.replace(/_/g, "-") === role);
        }),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className={cn(
        "flex items-center shrink-0 h-[64px]",
        collapsed ? "justify-center px-0" : "px-5"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div
            className="flex size-9 items-center justify-center rounded-xl shrink-0"
            style={{
              background: "linear-gradient(135deg, #0EA5A4 0%, #14B8A6 100%)",
              boxShadow: "0 4px 14px rgba(14,165,164,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
              <path d="M6.5 4L9 5.5V8L6.5 9.5L4 8V5.5L6.5 4Z" fill="white" fillOpacity="0.25" />
            </svg>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="min-w-0"
              >
                <p className="text-[15px] font-bold text-white leading-none tracking-tight">TZMicha</p>
                <p className="text-[10px] mt-[3px] font-semibold tracking-[0.16em] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
                  IT Solutions
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* ── Search ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pt-3 pb-1 shrink-0 overflow-hidden"
          >
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center gap-2.5 h-9 px-3 rounded-lg transition-all duration-200 group"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
            >
              <Search size={13} className="text-white/30 shrink-0" />
              <span className="flex-1 text-left text-[12px] text-white/25">Search...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-white/20 font-mono">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar overscroll-none">
        <div className={cn("space-y-5", collapsed ? "px-3" : "px-3")}>
          {sections.map((section) => (
            <div key={section.id}>
              {/* Section label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] select-none"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Collapsed section divider */}
              {collapsed && (
                <div className="w-4 h-px mx-auto mb-2" style={{ background: "rgba(255,255,255,0.08)" }} />
              )}

              <div className="space-y-[2px]">
                {section.items.map((item) => (
                  <NavItemRow key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* ── User footer ── */}
      <div className={cn("shrink-0 p-3", collapsed && "flex flex-col items-center gap-2")}>
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">
                  <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold text-xs">{currentUser.name}</p>
                <p className="text-muted-foreground text-xs">{ROLE_LABELS[currentUser.role]}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex size-8 items-center justify-center rounded-lg transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"; }}
                >
                  <Settings size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold leading-none truncate" style={{ color: "rgba(255,255,255,0.88)" }}>
                {currentUser.name}
              </p>
              <p className="text-[11px] truncate mt-[3px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                {ROLE_LABELS[currentUser.role]}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={e => { e.stopPropagation(); navigate("/settings"); }}
                className="flex size-6 items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: "rgba(255,255,255,0.22)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Settings size={12} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); logout(); navigate("/login"); }}
                className="flex size-6 items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: "rgba(255,255,255,0.22)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.8)"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <div className={cn("shrink-0 px-3 pb-4 hidden md:flex", collapsed && "justify-center")}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 w-full",
            collapsed && "w-10 justify-center px-0"
          )}
          style={{ color: "rgba(255,255,255,0.2)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)";
          }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="shrink-0">
            <ChevronLeft size={14} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.14 }}
                className="text-[11.5px] font-medium whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

// ── Sidebar Shell ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, user } = useAppStore();
  if (!user) return null;

  const sidebarStyle: React.CSSProperties = {
    background: "#111827",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
  };

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? W_CLOSED : W_OPEN }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 bottom-0 z-40 overflow-hidden select-none hidden md:block"
        style={sidebarStyle}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -W_OPEN }}
            animate={{ x: 0 }}
            exit={{ x: -W_OPEN }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-40 overflow-hidden select-none md:hidden"
            style={{ width: W_OPEN, ...sidebarStyle }}
          >
            <SidebarContent collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
