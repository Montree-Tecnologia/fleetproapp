import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
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
  UserCog,
  IdCard,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function Layout() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Fechado por padrão em mobile
  const [cadastrosOpen, setCadastrosOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dashboard item (outside cadastros group)
  const dashboardItem = { 
    to: '/', 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    permission: 'view_dashboard' as const 
  };

  // Cadastros items
  const cadastrosItems = [
    { to: '/vehicles', icon: Truck, label: 'Frota', permission: 'manage_vehicles' as const },
    { to: '/drivers', icon: IdCard, label: 'Motoristas', permission: 'manage_vehicles' as const },
    { to: '/refrigeration', icon: Snowflake, label: 'Refrigeração', permission: 'manage_refrigeration' as const },
    { to: '/suppliers', icon: Users, label: 'Fornecedores', permission: 'manage_suppliers' as const },
    { to: '/companies', icon: Building2, label: 'Empresas', permission: 'manage_companies' as const },
    { to: '/users', icon: UserCog, label: 'Usuários', permission: 'manage_users' as const },
  ];

  // Refuelings item (outside cadastros group)
  const refuelingsItem = { 
    to: '/refuelings', 
    icon: Fuel, 
    label: 'Abastecimentos', 
    permission: 'manage_refuelings' as const 
  };

  const filteredCadastrosItems = cadastrosItems.filter((item) => hasPermission(item.permission));

  // Check if any cadastros route is active
  const isCadastrosRouteActive = cadastrosItems.some(item => location.pathname === item.to);

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarOpen ? 'w-64' : 'lg:w-20 w-64'
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 h-screen z-50`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {(sidebarOpen || window.innerWidth >= 1024) && (
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
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          {hasPermission(dashboardItem.permission) && (
            <NavLink
              to={dashboardItem.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <dashboardItem.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{dashboardItem.label}</span>}
            </NavLink>
          )}

          {/* Abastecimentos (Refuelings) */}
          {hasPermission(refuelingsItem.permission) && (
            <NavLink
              to={refuelingsItem.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <refuelingsItem.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{refuelingsItem.label}</span>}
            </NavLink>
          )}

          {/* Cadastros Collapsible Group */}
          {filteredCadastrosItems.length > 0 && (
            <Collapsible
              open={cadastrosOpen}
              onOpenChange={setCadastrosOpen}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 px-3 py-2"
                >
                  {cadastrosOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  {sidebarOpen && (
                    <span className="ml-2 font-medium">CADASTROS</span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {filteredCadastrosItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        sidebarOpen ? 'ml-4' : ''
                      } ${
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
              </CollapsibleContent>
            </Collapsible>
          )}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Footer - Fixed Section */}
        <div className="p-2 space-y-1">
          {/* Settings Button */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Configurações</span>}
          </NavLink>

          <Separator className="bg-sidebar-border my-2" />

          {/* User Info - Only visible when sidebar is open */}
          {sidebarOpen && user && (
            <div className="px-3 py-2 space-y-1">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{user.company}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          )}

          <Separator className="bg-sidebar-border my-2" />

          {/* Logout Button */}
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
      <main className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-foreground truncate">
              Sistema de Gestão de Frotas
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
