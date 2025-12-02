import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, logoutUser, fetchUserProfile, type UserData } from '@/services/authApi';
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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fleet_token');
      
      if (storedToken) {
        try {
          // Buscar dados atualizados do usuário da API
          const response = await fetchUserProfile();
          
          if (response.success && response.data) {
            const profileData = response.data;
            
            // Verificar se o usuário está ativo
            if (!profileData.active) {
              localStorage.removeItem('fleet_user');
              localStorage.removeItem('fleet_token');
              setIsLoading(false);
              return;
            }
            
            // Recuperar linkedCompanyIds do localStorage (vem apenas no login)
            const storedUser = localStorage.getItem('fleet_user');
            let linkedCompanyIds: string[] = [];
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                linkedCompanyIds = parsedUser.linkedCompanyIds || [];
              } catch {
                linkedCompanyIds = [];
              }
            }
            
            const userData: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role,
              primaryCompanyId: profileData.primaryCompanyId,
              hasAccessToAllCompanies: profileData.hasAccessToAllCompanies,
              linkedCompanyIds,
              active: profileData.active,
            };
            
            localStorage.setItem('fleet_user', JSON.stringify(userData));
            setUser(userData);
          } else {
            // Token inválido ou expirado
            localStorage.removeItem('fleet_user');
            localStorage.removeItem('fleet_token');
          }
        } catch (error) {
          console.error('Erro ao recuperar perfil do usuário:', error);
          localStorage.removeItem('fleet_user');
          localStorage.removeItem('fleet_token');
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
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

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('fleet_user');
      localStorage.removeItem('fleet_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
