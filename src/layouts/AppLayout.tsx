import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useAppStore } from "@/store/appStore";

const W_OPEN = 232;
const W_CLOSED = 56;

export function AppLayout() {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const location = useLocation();

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar />
      <Header />
      <CommandPalette />

      {/* Desktop main — animated left padding */}
      <motion.main
        animate={{ paddingLeft: sidebarCollapsed ? W_CLOSED : W_OPEN }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="pt-[52px] h-full overflow-y-auto overflow-x-hidden overscroll-none hidden md:block"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 py-7 max-w-[1560px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* Mobile main — no sidebar offset */}
      <main className="pt-[52px] h-full overflow-y-auto overflow-x-hidden overscroll-none md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="px-3 py-4 max-w-[1560px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
