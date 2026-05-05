/**
 * LiveSessionContext — Connects to the backend WebSocket, joins course rooms,
 * listens for session:started events, fires local notifications, and exposes
 * the list of currently-live sessions for the home screen.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { io, Socket } from 'socket.io-client';
import { api, getToken, API_ORIGIN } from '@/lib/api';
import { useAuth } from './AuthContext';

// ── Configure notification handler (show even when app is foregrounded) ──
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface LiveSession {
  sessionId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  venue: string | null;
  startedAt: string;
  duration: number;
  alreadyMarked: boolean;
}

interface LiveSessionState {
  liveSessions: LiveSession[];
  loading: boolean;
  refresh: () => Promise<void>;
  rejoinCourseRooms: () => Promise<void>;
}

const LiveSessionContext = createContext<LiveSessionState | undefined>(undefined);

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const liveSessionIdsRef = useRef<Set<string>>(new Set());
  const notifiedSessionIdsRef = useRef<Set<string>>(new Set());
  const connectingRef = useRef(false);
  const lastNotificationRef = useRef<Map<string, number>>(new Map());

  // ── Fetch active sessions from REST API ──
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const sessions = await api.getActiveSessions();
      setLiveSessions(sessions.map((s) => ({ ...s })));
      const activeIds = new Set(sessions.map((s) => s.sessionId));
      liveSessionIdsRef.current = activeIds;
      // Keep notifications only for still-active sessions.
      for (const id of Array.from(notifiedSessionIdsRef.current)) {
        if (!activeIds.has(id)) notifiedSessionIdsRef.current.delete(id);
      }
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // ── Send local notification ──
  const sendLocalNotification = useCallback(
    async (data: { sessionId: string; courseCode: string; courseName: string; venue: string | null }) => {
      const key = data.sessionId || data.courseCode;
      const now = Date.now();
      const last = lastNotificationRef.current.get(key);
      if (last && now - last < 30_000) return;
      lastNotificationRef.current.set(key, now);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 ${data.courseCode} is Live!`,
          body: `Attendance is open for ${data.courseName}${data.venue ? ` at ${data.venue}` : ''}. Open the app to mark your attendance.`,
          sound: true,
        },
        trigger: null, // fire immediately
      });
    },
    [],
  );

  const joinCourseRooms = useCallback(async (socket: Socket) => {
    try {
      const courses = await api.getCourses();
      const courseIds = courses.map((c) => c.id);
      if (courseIds.length > 0) {
        socket.emit('course:join', { courseIds });
      }
    } catch { /* ignore */ }
  }, []);

  // ── WebSocket connection ──
  const connectWs = useCallback(async () => {
    if (!isAuthenticated) return;
    if (connectingRef.current) return;
    connectingRef.current = true;

    const token = await getToken();
    if (!token) {
      connectingRef.current = false;
      return;
    }

    if (socketRef.current) {
      if (socketRef.current.connected) {
        connectingRef.current = false;
        return;
      }
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    connectingRef.current = true;
    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;
    const clearConnecting = () => {
      connectingRef.current = false;
    };

    socket.on('connect', () => {
      clearConnecting();
      joinCourseRooms(socket);
    });

    socket.on('connect_error', () => {
      clearConnecting();
    });

    socket.on('session:started', (eventData) => {
      if (!eventData?.sessionId) return;
      if (liveSessionIdsRef.current.has(eventData.sessionId)) return;

      const newSession: LiveSession = {
        sessionId: eventData.sessionId,
        courseId: eventData.courseId || '',
        courseCode: eventData.courseCode,
        courseName: eventData.courseName,
        venue: eventData.venue,
        startedAt: new Date().toISOString(),
        duration: eventData.duration,
        alreadyMarked: false,
      };

      liveSessionIdsRef.current.add(newSession.sessionId);
      setLiveSessions((prev) => [newSession, ...prev]);

      if (!notifiedSessionIdsRef.current.has(newSession.sessionId)) {
        notifiedSessionIdsRef.current.add(newSession.sessionId);
        sendLocalNotification({
          sessionId: newSession.sessionId,
          courseCode: eventData.courseCode,
          courseName: eventData.courseName,
          venue: eventData.venue,
        });
      }
    });

    socket.on('session:ended', (eventData) => {
      setLiveSessions((prev) => prev.filter((s) => s.sessionId !== eventData.sessionId));
      if (eventData?.sessionId) {
        liveSessionIdsRef.current.delete(eventData.sessionId);
        notifiedSessionIdsRef.current.delete(eventData.sessionId);
      }
    });

    socket.on('disconnect', () => {
      clearConnecting();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    });
  }, [isAuthenticated, sendLocalNotification, joinCourseRooms]);

  // ── Connect on auth, cleanup on unmount ──
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      connectWs();
    } else {
      setLiveSessions([]);
      liveSessionIdsRef.current.clear();
      notifiedSessionIdsRef.current.clear();
      lastNotificationRef.current.clear();
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, refresh, connectWs]);

  // ── Refresh when app comes to foreground ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        refresh();
        if (!socketRef.current?.connected) {
          connectWs();
        }
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, refresh, connectWs]);

  // ── Request notification permissions on mount ──
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  // ── Rejoin course rooms (call after joining a new course) ──
  const rejoinCourseRooms = useCallback(async () => {
    if (socketRef.current?.connected) {
      await joinCourseRooms(socketRef.current);
    }
  }, [joinCourseRooms]);

  return (
    <LiveSessionContext.Provider value={{ liveSessions, loading, refresh, rejoinCourseRooms }}>
      {children}
    </LiveSessionContext.Provider>
  );
}

export function useLiveSessions() {
  const context = useContext(LiveSessionContext);
  if (!context)
    throw new Error('useLiveSessions must be used within LiveSessionProvider');
  return context;
}
