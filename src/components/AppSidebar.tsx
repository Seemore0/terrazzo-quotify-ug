import { LayoutDashboard, FileText, Users, BarChart3, Settings, Calculator, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'New Quote', url: '/', icon: Calculator },
  { title: 'Quotes', url: '/quotes', icon: FileText },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/admin', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const collapsed = state === 'collapsed';
  const isActive = (u: string) => u === '/' ? pathname === '/' : pathname.startsWith(u);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-md shrink-0">
            <Calculator className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">Terrazzo Pro</div>
              <div className="text-xs text-muted-foreground truncate">Quotation SaaS</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {user && !collapsed && (
          <div className="text-xs text-muted-foreground truncate px-2 pb-2">{user.email}</div>
        )}
        {user && (
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign out</span>}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
