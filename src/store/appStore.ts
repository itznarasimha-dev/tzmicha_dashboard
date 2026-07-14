import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole, Theme } from "@/types";
import { mockUsers } from "@/data/users";

interface AppState {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  toggleMobileMenu: () => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: mockUsers[0],
      setCurrentUser: (user) => set({ currentUser: user }),
      switchRole: (role) => {
        const user = mockUsers.find((u) => u.role === role) ?? mockUsers[0];
        set({ currentUser: user });
      },

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      mobileMenuOpen: false,
      setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
      toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),

      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else if (theme === "light") root.classList.remove("dark");
        else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          root.classList.toggle("dark", prefersDark);
        }
      },

      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
    }),
    {
      name: "tzmicha-app",
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed, currentUser: s.currentUser }),
    }
  )
);
