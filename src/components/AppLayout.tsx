import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { StatusChip } from './StatusChip';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const { hasAccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only the very first launch sees the welcome screen; guests are never asked again.
    if (!hasAccess) navigate('/welcome', { replace: true });
  }, [hasAccess, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-background sticky top-0 z-30 px-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <StatusChip />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
