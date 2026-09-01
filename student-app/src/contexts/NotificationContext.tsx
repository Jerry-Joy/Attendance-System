import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type NotificationType = 
  | 'session_start' 
  | 'session_ending' 
  | 'attendance_success' 
  | 'attendance_missed' 
  | 'course_joined' 
  | 'course_update'
  | 'announcement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  courseCode?: string;
  courseName?: string;
  timestamp: number;
  read: boolean;
  actionable: boolean;
  actionData?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = '@notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { student, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // User-scoped storage key
  const userId = student?.id;
  const storageKey = userId ? `@notifications_${userId}` : null;

  // Clean legacy shared storage key on startup
  useEffect(() => {
    AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
  }, []);

  // Load user's notifications when student logs in or switches
  useEffect(() => {
    let isMounted = true;

    const loadUserNotifications = async () => {
      if (!isAuthenticated || !storageKey) {
        if (isMounted) setNotifications([]);
        return;
      }

      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (isMounted) {
          if (stored) {
            setNotifications(JSON.parse(stored));
          } else {
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error('Failed to load user notifications:', error);
        if (isMounted) setNotifications([]);
      }
    };

    loadUserNotifications();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, storageKey]);

  // Save notifications to user-scoped storage whenever they change
  useEffect(() => {
    if (!isAuthenticated || !storageKey) return;

    const saveUserNotifications = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(notifications));
      } catch (error) {
        console.error('Failed to save user notifications:', error);
      }
    };

    saveUserNotifications();
  }, [notifications, isAuthenticated, storageKey]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (storageKey) {
      AsyncStorage.removeItem(storageKey).catch(() => {});
    }
  }, [storageKey]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
