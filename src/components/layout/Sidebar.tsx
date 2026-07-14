import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare, Layers, Calendar,
  Video, Clock, Umbrella, GitBranch, BarChart3, Bell,
  BookOpen, Files, Settings, Activity, HelpCircle,
  ClipboardList, Target, TrendingUp, Bug, Megaphone, ChevronLeft,
} from "lucide-react";
import { cn } from "@/utils";
import { useAppStore } from "@/store/appStore";
import { ROLE_LABELS } from "@/constants";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import type { UserRole } from "@/types";

const W_OPEN = 232;
const W_CLOSED = 56;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number | string;
  roles?: UserRole[];
  isNew?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const allNavSections: NavSection[] = [
  {
    id: "main",
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} />, path: "/dashboard" },
      { id: "analytics", label: "Analytics", icon: <BarChart3 size={15} />, path: "/analytics" },
      { id: "activity", label: "Activity", icon: <Activity size={15} />, path: "/activity", roles: ["admin"] },
    ],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { id: "projects", label: "Projects", icon: <FolderKanban size={15} />, path: "/projects", roles: ["admin", "frontend-dev", "backend-dev", "qa", "product-manager"] },
      { id: "tasks", label: "Tasks", icon: <CheckSquare size={15} />, path: "/tasks", roles: ["admin", "frontend-dev", "backend-dev", "qa", "product-manager"] },
      { id: "sprint", label: "Sprint Board", icon: <Layers size={15} />, path: "/sprint", roles: ["admin", "frontend-dev", "backend-dev", "qa", "product-manager"] },
      { id: "qa", label: "QA & Testing", icon: <Bug size={15} />, path: "/qa", roles: ["admin", "qa", "frontend-dev", "backend-dev"] },
      { id: "work-updates", label: "Work Updates", icon: <ClipboardList size={15} />, path: "/work-updates" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "employees", label: "Employees", icon: <Users size={15} />, path: "/employees", roles: ["admin", "hr"] },
      { id: "org-chart", label: "Org Chart", icon: <GitBranch size={15} />, path: "/org-chart", roles: ["admin", "hr"] },
      { id: "leave", label: "Leave", icon: <Umbrella size={15} />, path: "/leave", roles: ["admin", "hr"] },
      { id: "attendance", label: "Attendance", icon: <Clock size={15} />, path: "/attendance", roles: ["admin", "hr"] },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      { id: "campaigns", label: "Campaigns", icon: <Megaphone size={15} />, path: "/marketing", roles: ["admin", "marketing"] },
      { id: "sales", label: "Sales Pipeline", icon: <TrendingUp size={15} />, path: "/sales", roles: ["admin", "sales"] },
      { id: "roadmap", label: "Roadmap", icon: <Target size={15} />, path: "/roadmap", roles: ["admin", "product-manager", "frontend-dev", "backend-dev"], isNew: true },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "calendar", label: "Calendar", icon: <Calendar size={15} />, path: "/calendar" },
      { id: "meetings", label: "Meetings", icon: <Video size={15} />, path: "/meetings" },
      { id: "files", label: "Files", icon: <Files size={15} />, path: "/files" },
      { id: "knowledge", label: "Knowledge Base", icon: <BookOpen size={15} />, path: "/knowledge" },
      { id: "notifications", label: "Notifications", icon: <Bell size={15} />, path: "/notifications", badge: 3 },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "settings", label: "Settings", icon: <Settings size={15} />, path: "/settings" },
      { id: "help", label: "Help Center", icon: <HelpCircle size={15} />, path: "/help" },
    ],
  },
];

function NavItemRow({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const isActive = item.path
    ? location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    : false;

  const inner = (
    <div className={cn("nav-item group", isActive && "active", collapsed && "justify-center px-0 w-9 mx-auto")}>
      <span className={cn(
        "shrink-0 transition-colors duration-100",
        isActive ? "text-white" : "text-white/32 group-hover:text-white/65"
      )}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 uppercase tracking-wider">New</span>
          )}
          {item.badge !== undefined && (
            <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 leading-none">
              {item.badge}
            </span>
          )}
        </>
      )}
    </div>
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

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { currentUser, toggleSidebar } = useAppStore();

  const sections = allNavSections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || i.roles.includes(currentUser.role)) }))
    .filter((s) => s.items.length > 0);

  return (
    <>
      {/* Brand */}
      <div className={cn("flex items-center h-[52px] shrink-0", collapsed ? "justify-center px-0" : "px-4")}>
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500 shrink-0">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
              <path d="M6.5 4L9 5.5V8L6.5 9.5L4 8V5.5L6.5 4Z" fill="white" fillOpacity="0.35" />
            </svg>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
              >
                <p className="text-[13px] font-bold text-white/90 leading-none tracking-tight">TZMicha</p>
                <p className="text-[10px] mt-0.5 tracking-widest uppercase font-medium" style={{ color: "rgba(255,255,255,0.28)" }}>IT Solutions</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-px mx-3" style={{ background: "hsl(var(--sidebar-border))" }} />

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar overscroll-none">
        <div className={cn("space-y-4", collapsed ? "px-2" : "px-3")}>
          {sections.map((section) => (
            <div key={section.id}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] select-none"
                    style={{ color: "rgba(255,255,255,0.22)" }}
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="w-4 h-px mx-auto mb-2.5" style={{ background: "hsl(var(--sidebar-border))" }} />
              )}
              <div className="space-y-px">
                {section.items.map((item) => (
                  <NavItemRow key={item.id} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px mx-3" style={{ background: "hsl(var(--sidebar-border))" }} />

      {/* User footer */}
      <div className={cn("shrink-0 p-2.5", collapsed && "flex justify-center")}>
        {collapsed ? (
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
        ) : (
          <div
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-100"
            style={{ background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-none truncate" style={{ color: "rgba(255,255,255,0.78)" }}>{currentUser.name}</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{ROLE_LABELS[currentUser.role]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      <div className={cn("shrink-0 px-2.5 pb-1 hidden md:flex", collapsed && "justify-center")}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2 py-1.5 transition-colors duration-150",
            collapsed && "w-9 justify-center px-0"
          )}
          style={{ color: "rgba(255,255,255,0.28)" }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "hsl(347 77% 50%)";
            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.28)";
          }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.22 }} className="shrink-0">
            <ChevronLeft size={14} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
                className="text-[11px] font-medium whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? W_CLOSED : W_OPEN }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 bottom-0 z-40 flex-col overflow-hidden select-none hidden md:flex"
        style={{ background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -W_OPEN }}
            animate={{ x: 0 }}
            exit={{ x: -W_OPEN }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden select-none md:hidden"
            style={{ width: W_OPEN, background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
          >
            <SidebarContent collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
