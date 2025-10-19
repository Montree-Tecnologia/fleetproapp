import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Refuelings from "./pages/Refuelings";
import Refrigeration from "./pages/Refrigeration";
import Suppliers from "./pages/Suppliers";
import Companies from "./pages/Companies";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Route path={path}>{() => children}</Route>;
}

function ProtectedRoute({ 
  children, 
  requiredPermission,
  path
}: { 
  children: React.ReactNode; 
  requiredPermission: Permission;
  path: string;
}) {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (!hasPermission(requiredPermission)) {
    return <Redirect to="/" />;
  }
  
  return <Route path={path}>{() => children}</Route>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <PrivateRoute path="/">
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/vehicles">
            <Layout><Vehicles /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/drivers">
            <Layout><Drivers /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/refuelings">
            <Layout><Refuelings /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/refrigeration">
            <Layout><Refrigeration /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/suppliers">
            <Layout><Suppliers /></Layout>
          </PrivateRoute>
          <PrivateRoute path="/settings">
            <Layout><Settings /></Layout>
          </PrivateRoute>
          <ProtectedRoute path="/companies" requiredPermission="manage_companies">
            <Layout><Companies /></Layout>
          </ProtectedRoute>
          <ProtectedRoute path="/users" requiredPermission="manage_users">
            <Layout><Users /></Layout>
          </ProtectedRoute>
          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
