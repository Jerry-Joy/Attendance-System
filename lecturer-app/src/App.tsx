/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CreateCourse from './pages/CreateCourse';
import ManageStudents from './pages/ManageStudents';
import History from './pages/History';
import Reports from './pages/Reports';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import CreateSession from './pages/CreateSession';
import ActiveSession from './pages/ActiveSession';
import LiveMonitor from './pages/LiveMonitor';
import SessionSummary from './pages/SessionSummary';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/" element={<AuthGate><Layout /></AuthGate>}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetails />} />
              <Route path="courses/:id/students" element={<ManageStudents />} />
              <Route path="history" element={<History />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Session flow — outside regular layout but require auth */}
            <Route path="/courses/create" element={<AuthGate><CreateCourse /></AuthGate>} />
            <Route path="/session/create" element={<AuthGate><CreateSession /></AuthGate>} />
            <Route path="/session/active" element={<AuthGate><ActiveSession /></AuthGate>} />
            <Route path="/session/live-monitor" element={<AuthGate><LiveMonitor /></AuthGate>} />
            <Route path="/session/summary" element={<AuthGate><SessionSummary /></AuthGate>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
