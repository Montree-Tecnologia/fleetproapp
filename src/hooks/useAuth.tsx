import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, type UserData } from '@/services/authApi';
import { ApiError } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  primaryCompanyId: string | null;
  hasAccessToAllCompanies: boolean;
  linkedCompanyIds: string[];
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('fleet_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser({ email, password });
      
      if (response.success && response.data) {
        const { token, user, linkedCompanyIds } = response.data;
        
        // Verificar se o usuário está ativo
        if (!user.active) {
          throw new Error('INACTIVE_USER');
        }
        
        // Mapear dados do usuário para o formato local
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          primaryCompanyId: user.primaryCompanyId,
          hasAccessToAllCompanies: user.hasAccessToAllCompanies,
          linkedCompanyIds: linkedCompanyIds,
          active: user.active,
        };
        
        // Armazenar token e usuário
        localStorage.setItem('fleet_token', token.token);
        localStorage.setItem('fleet_user', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Erro de autenticação:', error.message);
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleet_user');
    localStorage.removeItem('fleet_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
