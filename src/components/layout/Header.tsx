import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Sun, Moon, Monitor, ChevronDown, Settings, LogOut, Menu, X, Check, CheckCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/utils";
import { useAppStore } from "@/store/appStore";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants";
import { useUnreadCount, useTodayHoliday, useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/DropdownMenu";
import type { Theme } from "@/types";

const W_OPEN  = 280;
const W_CLOSED = 72;

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard", "/analytics": "Analytics", "/activity": "Activity",
  "/projects": "Projects", "/tasks": "Tasks", "/sprint": "Sprint Board",
  "/work-updates": "Work Updates", "/employees": "Employees", "/org-chart": "Org Chart",
  "/leave": "Leave", "/attendance": "Attendance", "/recruitment": "Recruitment",
  "/marketing": "Campaigns", "/sales": "Sales Pipeline", "/roadmap": "Roadmap",
  "/calendar": "Calendar", "/meetings": "Meetings", "/files": "Files",
  "/knowledge": "Knowledge Base", "/notifications": "Notifications",
  "/settings": "Settings", "/help": "Help Center",
  "/finance/dashboard": "Finance Dashboard", "/finance/invoices": "Invoices",
  "/finance/expenses": "Expenses", "/finance/payments": "Payments",
  "/finance/payroll": "Payroll", "/finance/budgets": "Budgets", "/finance/reports": "Reports",
  "/mkt/social": "Social Media", "/mkt/campaigns": "Campaigns", "/mkt/contacts": "Contacts",
  "/mkt/sms": "SMS", "/mkt/whatsapp": "WhatsApp", "/mkt/rcs": "RCS",
  "/mkt/email": "Email", "/mkt/automation": "Automation", "/mkt/fallback": "AI Fallback",
  "/mkt/voice": "AI Voice Agent", "/mkt/pipeline": "Pipeline",
  "/mkt/reports": "Reports", "/mkt/wallet": "Wallet",
};

function IconBtn({ onClick, active, children }: { onClick?: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-xl transition-all duration-150",
        active
          ? "bg-[#E6F7F7] text-[#0EA5A4]"
          : "text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9]"
      )}
    >
      {children}
    </button>
  );
}

export function Header() {
  const { user: currentUser, logout, theme, setTheme, sidebarCollapsed, setCommandOpen, toggleMobileMenu } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: todayHoliday } = useTodayHoliday();
  const { data: notifData } = useNotifications({ limit: 8 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const notifications = notifData?.data ?? [];

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showHolidayToast, setShowHolidayToast] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pageTitle = routeLabels[location.pathname] ?? "Dashboard";

  function openNotifPanel() {
    setShowNotifPanel(v => {
      if (!v && unreadCount > 0) markAllAsRead();
      return !v;
    });
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (todayHoliday) {
      const key = `holiday-toast-${todayHoliday.id}-${new Date().toDateString()}`;
      if (!sessionStorage.getItem(key)) {
        setShowHolidayToast(true);
        sessionStorage.setItem(key, "1");
        const t = setTimeout(() => setShowHolidayToast(false), 8000);
        return () => clearTimeout(t);
      }
    }
  }, [todayHoliday]);

  if (!currentUser) return null;

  return (
    <>
      {/* Holiday toast */}
      <AnimatePresence>
        {showHolidayToast && todayHoliday && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[66px] right-4 z-50 w-80 rounded-2xl border border-[#EEF2F7] bg-white shadow-[0_20px_52px_-8px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#0EA5A4,#14B8A6)" }} />
            <div className="flex items-start gap-3 p-4">
              <span className="text-2xl shrink-0">🎉</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#111827]">Happy {todayHoliday.name}!</p>
                <p className="text-xs text-[#64748B] mt-0.5">Today ({format(parseISO(todayHoliday.date), "dd MMM yyyy")}) is a Public Holiday.</p>
              </div>
              <button onClick={() => setShowHolidayToast(false)} className="flex size-6 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors shrink-0">
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile header ── */}
      <div className="fixed top-0 left-0 right-0 z-30 flex md:hidden h-[56px] items-center px-3 gap-2 bg-white border-b border-[#E5E7EB]">
        <button onClick={toggleMobileMenu} className="flex size-9 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
          <Menu className="size-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex size-6 items-center justify-center rounded-lg shrink-0" style={{ background: "linear-gradient(135deg,#0EA5A4,#14B8A6)" }}>
            <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <h2 className="text-[14px] font-semibold text-[#111827] leading-none truncate">{pageTitle}</h2>
        </div>
        <IconBtn onClick={() => setCommandOpen(true)}><Search className="size-4" /></IconBtn>
        <div className="relative">
          <IconBtn onClick={() => navigate("/notifications")}>
            <Bell className="size-4" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 size-[5px] rounded-full bg-[#0EA5A4] ring-1 ring-white" />}
          </IconBtn>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 h-9 pl-1 pr-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5 border-b border-[#EEF2F7]">
              <p className="text-sm font-semibold text-[#111827]">{currentUser.name}</p>
              <p className="text-xs text-[#64748B]">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="size-3.5" /> Settings</DropdownMenuItem>
            <DropdownMenuItem destructive onClick={() => { logout(); navigate("/login"); }}><LogOut className="size-3.5" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Desktop header ── */}
      <motion.header
        animate={{ left: sidebarCollapsed ? W_CLOSED : W_OPEN }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 z-30 hidden md:flex h-[58px] items-center px-6 gap-4 bg-white border-b border-[#E5E7EB]"
      >
        {/* Page title */}
        <h2 className="text-[15px] font-bold text-[#111827] leading-none truncate">{pageTitle}</h2>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2.5 h-9 px-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#94A3B8] hover:bg-[#F1F5F9] hover:border-[#DDE5EE] hover:text-[#64748B] transition-all duration-150"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="hidden lg:block text-[13px] w-24 text-left">Search...</span>
            <kbd className="hidden lg:flex items-center justify-center h-[18px] px-1.5 rounded-md border border-[#E5E7EB] bg-white text-2xs font-mono text-[#94A3B8]">⌘K</kbd>
          </button>

          <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <IconBtn onClick={openNotifPanel} active={showNotifPanel}>
              <Bell className="size-[15px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#0EA5A4] text-white text-[9px] font-bold ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </IconBtn>

            <AnimatePresence>
              {showNotifPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-11 w-80 rounded-2xl border border-[#EEF2F7] bg-white shadow-[0_20px_52px_-8px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF2F7]">
                    <p className="text-[13px] font-bold text-[#111827]">
                      Notifications
                      {unreadCount > 0 && <span className="ml-1.5 text-[11px] font-normal text-[#94A3B8]">· {unreadCount} unread</span>}
                    </p>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAsRead()} className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#334155] transition-colors px-2 py-1 rounded-lg hover:bg-[#F1F5F9]">
                        <CheckCheck className="size-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EEF2F7]">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1F5F9]">
                          <Bell className="size-4 text-[#CBD5E1]" />
                        </div>
                        <p className="text-xs text-[#94A3B8]">All caught up!</p>
                      </div>
                    ) : notifications.map((n: any) => (
                      <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-default", !n.read && "bg-[#F5F9FF]")}>
                        <span className={cn("mt-1.5 size-2 rounded-full shrink-0", {
                          "bg-[#0EA5A4]": n.type === "info",
                          "bg-[#16C47F]": n.type === "success",
                          "bg-[#F59E0B]": n.type === "warning",
                          "bg-[#EF4444]": n.type === "error",
                        })} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#111827] leading-snug">{n.title}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                        {!n.read && (
                          <button onClick={() => markAsRead(n.id)} className="shrink-0 flex size-6 items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors mt-0.5">
                            <Check className="size-3 text-[#94A3B8]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-[#EEF2F7]">
                    <button
                      onClick={() => { setShowNotifPanel(false); navigate("/notifications"); }}
                      className="flex items-center gap-1.5 text-xs text-[#0EA5A4] hover:text-[#0c8f8e] font-semibold transition-colors"
                    >
                      View all notifications <ArrowRight className="size-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconBtn>
                {theme === "light" ? <Sun className="size-[15px]" /> : theme === "dark" ? <Moon className="size-[15px]" /> : <Monitor className="size-[15px]" />}
              </IconBtn>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                <DropdownMenuRadioItem value="light"><Sun className="size-3.5" /> Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark"><Moon className="size-3.5" /> Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system"><Monitor className="size-3.5" /> System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-[#E5E7EB] mx-1" />

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-xl hover:bg-[#F1F5F9] border border-transparent hover:border-[#E5E7EB] transition-all duration-150 group">
                <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
                <div className="hidden md:flex flex-col items-start">
                  <p className="text-[12px] font-semibold text-[#111827] leading-none">{currentUser.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-none">{ROLE_LABELS[currentUser.role] ?? currentUser.role}</p>
                </div>
                <ChevronDown className="size-3 text-[#CBD5E1] hidden md:block group-hover:text-[#94A3B8] transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-3 border-b border-[#EEF2F7]">
                <div className="flex items-center gap-3">
                  <Avatar name={currentUser.name} src={currentUser.avatar} size="md" showStatus status={currentUser.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate">{currentUser.name}</p>
                    <p className="text-xs text-[#64748B] truncate">{currentUser.email}</p>
                  </div>
                </div>
                <span className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium mt-2.5", ROLE_COLORS[currentUser.role] ?? "bg-[#F1F5F9] text-[#64748B]")}>
                  {ROLE_LABELS[currentUser.role] ?? currentUser.role}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="size-3.5" /> Settings</DropdownMenuItem>
              <DropdownMenuItem destructive onClick={() => { logout(); navigate("/login"); }}><LogOut className="size-3.5" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  );
}
