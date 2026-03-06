/**
 * AttendanceContext — Manages attendance marking via the real backend API
 * and fetches history from GET /api/attendance/history.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, mapHistoryRecord, MappedHistoryRecord } from '@/lib/api';

export interface LiveAttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present';
  method: 'QR+GPS';
  venueName?: string;
  radius?: number;
  token: string;
}

interface AttendanceState {
  records: LiveAttendanceRecord[];
  history: MappedHistoryRecord[];
  historyLoading: boolean;
  addRecord: (record: Omit<LiveAttendanceRecord, 'id'>) => void;
  hasToken: (token: string) => boolean;
  markOnServer: (data: { token: string; courseId: string; latitude?: number; longitude?: number }) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<LiveAttendanceRecord[]>([]);
  const [history, setHistory] = useState<MappedHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const addRecord = useCallback((record: Omit<LiveAttendanceRecord, 'id'>) => {
    setRecords((prev) => {
      if (prev.some((r) => r.token === record.token)) return prev;
      return [{ ...record, id: `live-${Date.now()}` }, ...prev];
    });
  }, []);

  const hasToken = useCallback(
    (token: string) => records.some((r) => r.token === token),
    [records],
  );

  const markOnServer = useCallback(async (data: { token: string; courseId: string; latitude?: number; longitude?: number }) => {
    await api.markAttendance(data);
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const raw = await api.getHistory();
      setHistory(raw.map(mapHistoryRecord));
    } catch {
      // keep previous history on error
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return (
    <AttendanceContext.Provider value={{ records, history, historyLoading, addRecord, hasToken, markOnServer, fetchHistory }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
}
