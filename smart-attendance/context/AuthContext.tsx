/**
 * AuthContext — Simple authentication state for demo purposes.
 * Manages login/logout and role selection (student/lecturer).
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/constants/MockData';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
