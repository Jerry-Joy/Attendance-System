/**
 * AttendanceContext — Stores real attendance records captured via QR+GPS flow.
 * Records persist for the session lifetime (in-memory).
 * history.tsx merges these with mockAttendance for display.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface LiveAttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;        // e.g. "Wed, 19 Feb 2026"
  time: string;        // e.g. "10:32 AM"
  status: 'present';
  method: 'QR+GPS' | 'QR Only';
  venueName?: string;
  radius?: number;
  token: string;       // SA-xxx token for dedup
}

interface AttendanceState {
  records: LiveAttendanceRecord[];
  addRecord: (record: Omit<LiveAttendanceRecord, 'id'>) => void;
  hasToken: (token: string) => boolean;
}

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<LiveAttendanceRecord[]>([]);

  const addRecord = useCallback((record: Omit<LiveAttendanceRecord, 'id'>) => {
    setRecords((prev) => {
      // Prevent duplicate tokens
      if (prev.some((r) => r.token === record.token)) return prev;
      return [{ ...record, id: `live-${Date.now()}` }, ...prev];
    });
  }, []);

  const hasToken = useCallback(
    (token: string) => records.some((r) => r.token === token),
    [records],
  );

  return (
    <AttendanceContext.Provider value={{ records, addRecord, hasToken }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
}
