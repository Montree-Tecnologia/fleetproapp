import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  company: string;
  companyId: string;
  companyCnpj: string;
  linkedCompanyIds: string[]; // IDs das empresas que o usuário tem acesso
  active?: boolean;
  isFirstAccess?: boolean; // Indica se é o primeiro acesso
  matrizConfigured?: boolean; // Indica se a matriz já foi configurada
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for authentication
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@frota.com': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Administrador',
      email: 'admin@frota.com',
      role: 'admin',
      company: 'Transportadora Matriz',
      companyId: 'matriz-1',
      companyCnpj: '',
      linkedCompanyIds: ['matriz-1'], // Apenas sua matriz
      active: true,
      isFirstAccess: true,
      matrizConfigured: false,
    }
  },
  'gestor@frota.com': {
    password: 'gestor123',
    user: {
      id: '2',
      name: 'João Silva',
      email: 'gestor@frota.com',
      role: 'manager',
      company: 'Transportadora Matriz',
      companyId: 'matriz-1',
      companyCnpj: '',
      linkedCompanyIds: ['matriz-1'], // Acesso limitado a algumas empresas
      active: true,
      isFirstAccess: false,
      matrizConfigured: true,
    }
  },
  'novoadmin@frota.com': {
    password: '123456',
    user: {
      id: '3',
      name: 'Maria Oliveira',
      email: 'novoadmin@frota.com',
      role: 'admin',
      company: 'Minha Transportadora',
      companyId: 'matriz-novo',
      companyCnpj: '',
      linkedCompanyIds: ['matriz-novo'],
      active: true,
      isFirstAccess: true,
      matrizConfigured: false,
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('fleet_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('fleet_user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = mockUsers[email];
    
    if (mockUser && mockUser.password === password) {
      // Verificar se o usuário está ativo
      if (mockUser.user.active === false) {
        return false; // Usuário inativo não pode fazer login
      }
      
      setUser(mockUser.user);
      localStorage.setItem('fleet_user', JSON.stringify(mockUser.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleet_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateUser }}>
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
