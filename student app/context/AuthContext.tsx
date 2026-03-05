/**
 * AuthContext — Simple authentication state for demo purposes.
 * Student-only — manages login/logout.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SignUpData {
  fullName: string;
  email: string;
  studentId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  signup: (data: SignUpData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const signup = (_data: SignUpData) => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
