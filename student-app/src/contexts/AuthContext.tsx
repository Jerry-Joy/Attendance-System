import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, mapUser, StudentProfile, ApiError } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  student: StudentProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; fullName: string; password: string; studentId: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);

  // Check for existing token on app launch
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (token) {
        // Verify token is still valid by fetching user profile
        const user = await api.getMe();
        setStudent(mapUser(user));
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token invalid or expired, clear it
      await setToken(null);
      setIsAuthenticated(false);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      await setToken(response.accessToken);
      setStudent(mapUser(response.user));
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { email: string; fullName: string; password: string; studentId: string }) => {
    setIsLoading(true);
    try {
      const response = await api.signup({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        role: 'STUDENT',
        studentId: data.studentId,
      });
      await setToken(response.accessToken);
      setStudent(mapUser(response.user));
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await setToken(null);
    setIsAuthenticated(false);
    setStudent(null);
  };

  const refreshProfile = async () => {
    try {
      const user = await api.getMe();
      setStudent(mapUser(user));
    } catch (error) {
      // If refresh fails, user might be logged out
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      student, 
      login, 
      signup, 
      logout,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
