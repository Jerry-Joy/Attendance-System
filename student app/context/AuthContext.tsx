/**
 * AuthContext — Real authentication with JWT via backend API.
 * Student-only — manages login/signup/logout with token persistence.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, setToken, getToken, mapUser, StudentProfile } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  student: StudentProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; email: string; studentId: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!student;

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const user = await api.getMe();
          setStudent(mapUser(user));
        }
      } catch {
        await setToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    await setToken(res.accessToken);
    setStudent(mapUser(res.user));
  }, []);

  const signup = useCallback(async (data: { fullName: string; email: string; studentId: string; password: string }) => {
    const res = await api.signup({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: 'STUDENT',
      studentId: data.studentId,
    });
    await setToken(res.accessToken);
    setStudent(mapUser(res.user));
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    setStudent(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, student, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
