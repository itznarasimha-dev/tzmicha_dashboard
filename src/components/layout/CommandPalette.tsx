import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  Search, LayoutDashboard, Users, FolderKanban, Settings,
  BarChart3, Layers, Bug, ClipboardList, X, ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const commands = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, path: "/dashboard", group: "Navigation" },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="size-4" />, path: "/analytics", group: "Navigation" },
  { id: "employees", label: "Employees", icon: <Users className="size-4" />, path: "/employees", group: "Navigation" },
  { id: "projects", label: "Projects", icon: <FolderKanban className="size-4" />, path: "/projects", group: "Navigation" },
  { id: "sprint", label: "Sprint Board", icon: <Layers className="size-4" />, path: "/sprint", group: "Navigation" },
  { id: "tasks", label: "Tasks", icon: <Bug className="size-4" />, path: "/tasks", group: "Navigation" },
  { id: "work-updates", label: "Work Updates", icon: <ClipboardList className="size-4" />, path: "/work-updates", group: "Navigation" },
  { id: "settings", label: "Settings", icon: <Settings className="size-4" />, path: "/settings", group: "Navigation" },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  return (
    <AnimatePresence>
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] mx-4 rounded-2xl border border-border bg-card overflow-hidden"
            style={{ boxShadow: "var(--shadow-2xl)" }}
          >
            <Command className="flex flex-col">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <Command.Input
                  placeholder="Search pages, people, tasks..."
                  className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setCommandOpen(false)}
                  className="flex size-6 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Results */}
              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="size-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try searching for pages, people, or tasks</p>
                </Command.Empty>

                {/* AI suggestion */}
                <div className="mb-2">
                  <Command.Item
                    value="ask-ai"
                    onSelect={() => setCommandOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] cursor-pointer",
                      "aria-selected:bg-primary-subtle aria-selected:text-primary",
                      "text-muted-foreground transition-colors"
                    )}
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg gradient-brand shrink-0">
                      <Sparkles className="size-3.5 text-white" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Ask AI Assistant</p>
                      <p className="text-2xs text-muted-foreground">Get instant answers about your workspace</p>
                    </div>
                    <ArrowRight className="size-3.5 ml-auto shrink-0" />
                  </Command.Item>
                </div>

                <Command.Group
                  heading="Navigation"
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]"
                >
                  {commands.map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.label}
                      onSelect={() => {
                        navigate(cmd.path);
                        setCommandOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] cursor-pointer",
                        "aria-selected:bg-muted",
                        "text-foreground transition-colors"
                      )}
                    >
                      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                        {cmd.icon}
                      </span>
                      <span className="font-medium">{cmd.label}</span>
                      <ArrowRight className="size-3.5 ml-auto text-muted-foreground shrink-0 opacity-0 group-aria-selected:opacity-100" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
                {[
                  { keys: ["↑", "↓"], label: "navigate" },
                  { keys: ["↵"], label: "select" },
                  { keys: ["esc"], label: "close" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {item.keys.map((k) => (
                        <kbd key={k} className="flex items-center justify-center rounded-md border border-border bg-card px-1.5 h-5 text-2xs font-mono text-muted-foreground min-w-5">
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-2xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
