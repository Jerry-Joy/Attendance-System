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
import { api, getToken } from '@/lib/api';
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
}

const LiveSessionContext = createContext<LiveSessionState | undefined>(undefined);

const API_BASE = 'http://192.168.100.153:3001';

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Fetch active sessions from REST API ──
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const sessions = await api.getActiveSessions();
      setLiveSessions(sessions.map((s) => ({ ...s })));
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // ── Send local notification ──
  const sendLocalNotification = useCallback(
    async (courseCode: string, courseName: string, venue: string | null) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 ${courseCode} is Live!`,
          body: `Attendance is open for ${courseName}${venue ? ` at ${venue}` : ''}. Open the app to mark your attendance.`,
          sound: true,
        },
        trigger: null, // fire immediately
      });
    },
    [],
  );

  // ── WebSocket connection ──
  const connectWs = useCallback(async () => {
    if (!isAuthenticated) return;

    const token = await getToken();
    if (!token) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      // Socket.IO handshake via WebSocket — use the EIO4 protocol
      const wsUrl = `${API_BASE.replace('http', 'ws')}/socket.io/?EIO=4&transport=websocket`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Socket.IO handshake: send auth token
        // EIO4 open packet is handled automatically — we send a CONNECT packet with auth
        ws.send(`40{"token":"${token}"}`);
      };

      ws.onmessage = (event) => {
        const data = String(event.data);

        // Socket.IO CONNECT ACK (packet type 40)
        if (data.startsWith('40')) {
          // Connected — join course rooms
          joinCourseRooms(ws);
          return;
        }

        // Socket.IO EVENT (packet type 42)
        if (data.startsWith('42')) {
          try {
            const payload = JSON.parse(data.substring(2));
            const [eventName, eventData] = payload;

            if (eventName === 'session:started') {
              // Add to live sessions
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

              setLiveSessions((prev) => {
                if (prev.some((s) => s.sessionId === newSession.sessionId)) return prev;
                return [newSession, ...prev];
              });

              // Fire local notification
              sendLocalNotification(
                eventData.courseCode,
                eventData.courseName,
                eventData.venue,
              );
            }

            if (eventName === 'session:ended') {
              setLiveSessions((prev) =>
                prev.filter((s) => s.sessionId !== eventData.sessionId),
              );
            }
          } catch { /* ignore parse errors */ }
        }

        // Socket.IO PING (packet type 2) — respond with PONG (3)
        if (data === '2') {
          ws.send('3');
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Attempt reconnect after 5 seconds
        reconnectTimer.current = setTimeout(connectWs, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch { /* connection failed, will retry */ }
  }, [isAuthenticated, sendLocalNotification]);

  const joinCourseRooms = async (ws: WebSocket) => {
    try {
      const courses = await api.getCourses();
      const courseIds = courses.map((c) => c.id);
      if (courseIds.length > 0) {
        // Socket.IO emit: 42["course:join", {courseIds}]
        ws.send(`42${JSON.stringify(['course:join', { courseIds }])}`);
      }
    } catch { /* ignore */ }
  };

  // ── Connect on auth, cleanup on unmount ──
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      connectWs();
    } else {
      setLiveSessions([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isAuthenticated]);

  // ── Refresh when app comes to foreground ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        refresh();
        // Reconnect WS if needed
        if (!wsRef.current) connectWs();
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

  return (
    <LiveSessionContext.Provider value={{ liveSessions, loading, refresh }}>
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
