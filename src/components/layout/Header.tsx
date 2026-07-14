import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, Bell, Sun, Moon, Monitor, Plus, ChevronDown,
  Settings, LogOut, Sparkles, Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { useAppStore } from "@/store/appStore";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants";
import { mockUsers } from "@/data/users";
import { mockNotifications } from "@/data/analytics";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/DropdownMenu";
import type { UserRole, Theme } from "@/types";

const W_OPEN = 232;
const W_CLOSED = 56;

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/activity": "Activity",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/sprint": "Sprint Board",
  "/qa": "QA & Testing",
  "/work-updates": "Work Updates",
  "/employees": "Employees",
  "/org-chart": "Org Chart",
  "/leave": "Leave",
  "/attendance": "Attendance",
  "/marketing": "Campaigns",
  "/sales": "Sales Pipeline",
  "/roadmap": "Roadmap",
  "/calendar": "Calendar",
  "/meetings": "Meetings",
  "/files": "Files",
  "/knowledge": "Knowledge Base",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/help": "Help Center",
};

export function Header() {
  const { currentUser, switchRole, theme, setTheme, sidebarCollapsed, setCommandOpen, toggleMobileMenu } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const pageTitle = routeLabels[location.pathname] ?? "Dashboard";

  return (
    <>
      {/* Mobile header — full width, no left offset */}
      <div
        className="fixed top-0 left-0 right-0 z-30 flex md:hidden h-[52px] items-center px-3 gap-2"
        style={{ background: "hsl(var(--surface))", borderBottom: "1px solid hsl(var(--border))" }}
      >
        <button
          onClick={toggleMobileMenu}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <Menu className="size-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex size-6 items-center justify-center rounded-md bg-rose-500 shrink-0">
            <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1L12 4V9L6.5 12L1 9V4L6.5 1Z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <h2 className="text-[14px] font-semibold text-foreground leading-none truncate">{pageTitle}</h2>
        </div>
        <button
          onClick={() => setCommandOpen(true)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="size-4" />
        </button>
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex size-[5px] rounded-full bg-red-500 ring-1 ring-card" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 h-8 pl-1 pr-1.5 rounded-md hover:bg-muted transition-colors">
              <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuLabel className="text-xs text-muted-foreground mt-1">Switch Role</DropdownMenuLabel>
            <div className="max-h-40 overflow-y-auto">
              {mockUsers.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => switchRole(u.role as UserRole)} className={cn(currentUser.id === u.id && "bg-primary-subtle")}>
                  <Avatar name={u.name} size="xs" />
                  <span className="text-xs truncate">{u.name}</span>
                  {currentUser.id === u.id && <div className="size-1.5 rounded-full bg-rose-500 ml-auto shrink-0" />}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="size-3.5" /> Settings</DropdownMenuItem>
            <DropdownMenuItem destructive><LogOut className="size-3.5" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop header */}
      <motion.header
        animate={{ left: sidebarCollapsed ? W_CLOSED : W_OPEN }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 z-30 hidden md:flex h-[52px] items-center px-5 gap-4"
        style={{ background: "hsl(var(--surface))", borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[14px] font-semibold text-foreground leading-none truncate">{pageTitle}</h2>
          <span className="w-px h-3.5 bg-border" />
          <span className="text-xs text-muted-foreground truncate">{ROLE_LABELS[currentUser.role]}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:border-border-strong transition-all duration-150"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="hidden lg:block text-[13px] w-28 text-left">Search...</span>
            <kbd className="hidden lg:flex items-center justify-center h-4 px-1 rounded border border-border bg-background text-2xs font-mono text-muted-foreground">⌘K</kbd>
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={() => setCommandOpen(true)}
            className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <Sparkles className="size-3.5 text-rose-500 shrink-0" />
            <span>Ask AI</span>
          </button>

          <button className="flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 transition-colors duration-150">
            <Plus className="size-3.5 shrink-0" strokeWidth={2.5} />
            <span className="hidden sm:block">New</span>
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150">
                {theme === "light" ? <Sun className="size-[15px]" /> : theme === "dark" ? <Moon className="size-[15px]" /> : <Monitor className="size-[15px]" />}
              </button>
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

          <button
            onClick={() => navigate("/notifications")}
            className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <Bell className="size-[15px]" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex size-[5px] rounded-full bg-red-500 ring-1 ring-card" />}
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 h-8 pl-1.5 pr-2.5 rounded-md hover:bg-muted transition-all duration-150 group">
                <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" showStatus status={currentUser.status} />
                <div className="hidden md:flex flex-col items-start">
                  <p className="text-[12px] font-semibold text-foreground leading-none">{currentUser.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{ROLE_LABELS[currentUser.role]}</p>
                </div>
                <ChevronDown className="size-3 text-muted-foreground/60 hidden md:block group-hover:text-muted-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar name={currentUser.name} src={currentUser.avatar} size="md" showStatus status={currentUser.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </div>
                <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mt-2.5", ROLE_COLORS[currentUser.role])}>
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
              <DropdownMenuLabel className="mt-1 text-xs text-muted-foreground">Switch Role — Demo</DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {mockUsers.map((u) => (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() => switchRole(u.role as UserRole)}
                    className={cn(currentUser.id === u.id && "bg-primary-subtle")}
                  >
                    <Avatar name={u.name} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{u.name}</p>
                      <p className="text-2xs text-muted-foreground truncate">{ROLE_LABELS[u.role]}</p>
                    </div>
                    {currentUser.id === u.id && <div className="size-1.5 rounded-full bg-rose-500 shrink-0" />}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="size-3.5" /> Settings</DropdownMenuItem>
              <DropdownMenuItem destructive><LogOut className="size-3.5" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  );
}
