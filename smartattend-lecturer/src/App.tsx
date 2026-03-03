import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Courses from './pages/Courses'
import CreateCourse from './pages/CreateCourse'
import ManageStudents from './pages/ManageStudents'
import StartSession from './pages/StartSession'
import ActiveSession from './pages/ActiveSession'
import LiveMonitor from './pages/LiveMonitor'
import SessionSummary from './pages/SessionSummary'
import Reports from './pages/Reports'
import SessionHistory from './pages/SessionHistory'
import Profile from './pages/Profile'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/create" element={<CreateCourse />} />
        <Route path="/courses/:id/students" element={<ManageStudents />} />
        <Route path="/courses/:id/start-session" element={<StartSession />} />
        <Route path="/active-session" element={<ActiveSession />} />
        <Route path="/live-monitor" element={<LiveMonitor />} />
        <Route path="/session-summary" element={<SessionSummary />} />
        <Route path="/session-history" element={<SessionHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  )
}
