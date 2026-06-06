import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Notification } from '../types';
import { useData } from './DataContext';

const NOTIFICATIONS_KEY = 'corescan_notifications';
const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) {
      const notifications = JSON.parse(raw);
      // Clean old notifications (older than 7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return notifications.filter((n: Notification) => n.timestamp > sevenDaysAgo);
    }
  } catch { /* ignore */ }
  return [];
}

function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch { /* ignore */ }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const { preferences, courses, activeSession } = useData();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check if notifications are enabled
    if (!preferences.notifications) return;

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });
  }, [preferences.notifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  // Remove single notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // Check for upcoming sessions and send reminders
  useEffect(() => {
    if (!preferences.notifications) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      courses.forEach(course => {
        if (!course.schedule) return;

        try {
          // Parse schedule: "Monday, 09:00 - 10:30"
          const parts = course.schedule.split(',');
          if (parts.length < 2) return;

          const dayName = parts[0].trim();
          const timeRange = parts[1].trim();
          const [startTime] = timeRange.split('-').map(t => t.trim());

          // Check if it's the right day
          if (dayName !== currentDay) return;

          // Parse start time
          const [hours, minutes] = startTime.split(':').map(Number);
          const scheduledMinutes = hours * 60 + minutes;

          // Check if we're 5-10 minutes before start
          const minutesUntilStart = scheduledMinutes - currentMinutes;

          if (minutesUntilStart === 5) {
            // Check if we already sent a reminder for this session today
            const todayKey = now.toDateString();
            const reminderKey = `reminder_${course.id}_${todayKey}`;
            
            if (!sessionStorage.getItem(reminderKey)) {
              addNotification({
                type: 'session_reminder',
                priority: 'medium',
                title: '⏰ Session Starting Soon',
                message: `${course.code} - ${course.name} starts in 5 minutes`,
                courseId: course.id,
                courseCode: course.code,
                metadata: {
                  scheduledTime: startTime,
                },
              });
              sessionStorage.setItem(reminderKey, 'sent');
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [courses, preferences.notifications, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
