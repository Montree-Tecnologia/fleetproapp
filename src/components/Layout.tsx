import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Truck,
  Fuel,
  Snowflake,
  Users,
  LogOut,
  Menu,
  Building2,
  Settings
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', permission: 'view_dashboard' as const },
    { to: '/vehicles', icon: Truck, label: 'Frota', permission: 'manage_vehicles' as const },
    { to: '/refuelings', icon: Fuel, label: 'Abastecimentos', permission: 'manage_refuelings' as const },
    { to: '/refrigeration', icon: Snowflake, label: 'Refrigeração', permission: 'manage_refrigeration' as const },
    { to: '/suppliers', icon: Users, label: 'Fornecedores', permission: 'manage_suppliers' as const },
    { to: '/companies', icon: Building2, label: 'Empresas', permission: 'manage_companies' as const },
    { to: '/settings', icon: Settings, label: 'Configurações', permission: 'view_settings' as const },
  ];

  const navItems = allNavItems.filter((item) => hasPermission(item.permission));

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'manager') return 'secondary';
    return 'outline';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Administrador';
    if (role === 'manager') return 'Gestor';
    return 'Operador';
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-sidebar-primary" />
              <span className="font-bold text-sidebar-foreground">FleetPro</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User Section */}
        <div className="p-4">
          {sidebarOpen && user && (
            <div className="mb-3 space-y-2">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{user.company}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Sistema de Gestão de Frotas
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
