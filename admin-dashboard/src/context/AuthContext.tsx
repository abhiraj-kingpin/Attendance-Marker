import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import type { AdminUser } from '../types';

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function login(email: string, password: string) {
    const { token: newToken, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAdmin: !!user?.isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
