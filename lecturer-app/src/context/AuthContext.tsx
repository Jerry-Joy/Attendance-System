import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Lecturer } from '../types';
import { api, setToken, getToken, mapUser, ApiError } from '../lib/api';

interface SignupPayload {
  name: string;
  email: string;
  department: string;
  staffId: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  lecturer: Lecturer | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);

  /* Restore session from saved JWT on mount */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .getMe()
      .then((user) => {
        const mapped = mapUser(user);
        setLecturer(mapped);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.login(email, password);
        setToken(res.accessToken);
        const mapped = mapUser(res.user);
        setLecturer(mapped);
        setIsAuthenticated(true);
        return { success: true };
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Login failed';
        return { success: false, error: message };
      }
    },
    [],
  );

  const signup = useCallback(
    async (data: SignupPayload): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.signup({
          email: data.email,
          fullName: data.name,
          password: data.password,
          role: 'LECTURER',
          staffId: data.staffId || undefined,
        });
        setToken(res.accessToken);
        const mapped = mapUser(res.user);
        mapped.department = data.department;
        setLecturer(mapped);
        setIsAuthenticated(true);
        return { success: true };
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Signup failed';
        return { success: false, error: message };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setLecturer(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, lecturer, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
