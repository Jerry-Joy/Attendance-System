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
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { io, Socket } from 'socket.io-client';
import { api, getToken, API_ORIGIN, MappedLiveSession } from '../lib/api';
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

interface LiveSessionState {
  liveSessions: MappedLiveSession[];
  loading: boolean;
  connected: boolean;
  refresh: () => Promise<void>;
  rejoinCourseRooms: () => Promise<void>;
}

const LiveSessionContext = createContext<LiveSessionState | undefined>(undefined);

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [liveSessions, setLiveSessions] = useState<MappedLiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
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
      const mapped = sessions.map((s) => ({
        sessionId: s.sessionId,
        courseId: s.courseId,
        courseCode: s.courseCode,
        courseName: s.courseName,
        venue: s.venue || 'Unknown Venue',
        startedAt: s.startedAt,
        duration: s.duration,
        alreadyMarked: s.alreadyMarked,
      }));
      setLiveSessions(mapped);
      const activeIds = new Set(sessions.map((s) => s.sessionId));
      liveSessionIdsRef.current = activeIds;
      // Keep notifications only for still-active sessions.
      for (const id of Array.from(notifiedSessionIdsRef.current)) {
        if (!activeIds.has(id)) notifiedSessionIdsRef.current.delete(id);
      }
    } catch (error) {
      console.error('Failed to refresh live sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── Send local notification ──
  const sendLocalNotification = useCallback(
    async (data: { sessionId: string; courseCode: string; courseName: string; venue: string | null }) => {
      const key = data.sessionId || data.courseCode;
      const now = Date.now();
      const last = lastNotificationRef.current.get(key);
      
      // Throttle: Max one notification per session per 30 seconds
      if (last && now - last < 30_000) return;
      lastNotificationRef.current.set(key, now);

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `📍 ${data.courseCode} is Live!`,
            body: `Attendance is open for ${data.courseName}${data.venue ? ` at ${data.venue}` : ''}. Open the app to mark your attendance.`,
            sound: true,
          },
          trigger: null, // fire immediately
        });
        // console.log('✅ Notification sent:', data.courseCode);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    },
    [],
  );

  const joinCourseRooms = useCallback(async (socket: Socket) => {
    try {
      const courses = await api.getCourses();
      const courseIds = courses.map((c) => c.id);
      if (courseIds.length > 0) {
        socket.emit('course:join', { courseIds });
        // console.log('✅ Joined course rooms:', courseIds.length);
      }
    } catch (error) {
      console.error('Failed to join course rooms:', error);
    }
  }, []);

  // ── WebSocket connection ──
  const connectWs = useCallback(async () => {
    if (!isAuthenticated) return;
    if (connectingRef.current) return;

    const token = await getToken();
    if (!token) {
      connectingRef.current = false;
      return;
    }

    // If already connected, don't reconnect
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    // Clean up old socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    connectingRef.current = true;
    // console.log('🔌 Connecting to WebSocket:', API_ORIGIN);

    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('✅ WebSocket connected');
      setConnected(true);
      connectingRef.current = false;
      joinCourseRooms(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setConnected(false);
      connectingRef.current = false;
    });

    socket.on('session:started', (eventData) => {
      // console.log('📡 Received session:started', eventData);
      
      if (!eventData?.sessionId) return;
      
      // Prevent duplicate sessions
      if (liveSessionIdsRef.current.has(eventData.sessionId)) {
        // console.log('⚠️ Session already exists:', eventData.sessionId);
        return;
      }

      const newSession: MappedLiveSession = {
        sessionId: eventData.sessionId,
        courseId: eventData.courseId || '',
        courseCode: eventData.courseCode,
        courseName: eventData.courseName,
        venue: eventData.venue || 'Unknown Venue',
        startedAt: eventData.startedAt || new Date().toISOString(),
        duration: eventData.duration || 60,
        alreadyMarked: false,
      };

      liveSessionIdsRef.current.add(newSession.sessionId);
      setLiveSessions((prev) => [newSession, ...prev]);

      // Send notification if not already notified
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
      // console.log('📡 Received session:ended', eventData);
      
      if (eventData?.sessionId) {
        setLiveSessions((prev) => prev.filter((s) => s.sessionId !== eventData.sessionId));
        liveSessionIdsRef.current.delete(eventData.sessionId);
        notifiedSessionIdsRef.current.delete(eventData.sessionId);
        lastNotificationRef.current.delete(eventData.sessionId);
      }
    });

    socket.on('disconnect', (reason) => {
      // console.log('🔌 WebSocket disconnected:', reason);
      setConnected(false);
      connectingRef.current = false;
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }, [isAuthenticated, sendLocalNotification, joinCourseRooms]);

  // ── Connect on auth, cleanup on unmount ──
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      connectWs();
    } else {
      // Clean up when logged out
      setLiveSessions([]);
      setConnected(false);
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
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        // console.log('📱 App became active, refreshing...');
        refresh();
        
        // Reconnect WebSocket if disconnected
        if (!socketRef.current?.connected) {
          connectWs();
        }
      }
    });
    
    return () => subscription.remove();
  }, [isAuthenticated, refresh, connectWs]);

  // ── Request notification permissions on mount ──
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Notification permissions not granted');
      } else {
        // console.log('✅ Notification permissions granted');
      }
    })();
  }, []);

  // ── Rejoin course rooms (call after joining a new course) ──
  const rejoinCourseRooms = useCallback(async () => {
    if (socketRef.current?.connected) {
      // console.log('🔄 Rejoining course rooms...');
      await joinCourseRooms(socketRef.current);
      // Also refresh to get any new active sessions
      await refresh();
    }
  }, [joinCourseRooms, refresh]);

  return (
    <LiveSessionContext.Provider value={{ 
      liveSessions, 
      loading, 
      connected,
      refresh, 
      rejoinCourseRooms 
    }}>
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
