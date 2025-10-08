import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Refuelings from "./pages/Refuelings";
import Refrigeration from "./pages/Refrigeration";
import Suppliers from "./pages/Suppliers";
import Companies from "./pages/Companies";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function ProtectedRoute({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode; 
  requiredPermission: Permission;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(requiredPermission) ? <>{children}</> : <Navigate to="/" />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="refuelings" element={<Refuelings />} />
              <Route path="refrigeration" element={<Refrigeration />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route 
                path="companies" 
                element={
                  <ProtectedRoute requiredPermission="manage_companies">
                    <Companies />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requiredPermission="view_settings">
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
