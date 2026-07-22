import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { router } from '@/routes';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function AppInitializer() {
  const { theme, isAuthenticated, loadMe } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) loadMe();
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AppInitializer />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
