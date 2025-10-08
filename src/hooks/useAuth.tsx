import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  company: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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
      company: 'Transportadora Matriz'
    }
  },
  'gestor@frota.com': {
    password: 'gestor123',
    user: {
      id: '2',
      name: 'João Silva',
      email: 'gestor@frota.com',
      role: 'manager',
      company: 'Transportadora Matriz'
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

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = mockUsers[email];
    
    if (mockUser && mockUser.password === password) {
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
