import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Building2,
  BookOpen,
  Users,
  Calendar,
  QrCode,
  MapPin,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

export default function Profile() {
  const navigate = useNavigate()
  const { logout, lecturer } = useAuth()
  const { courses, pastSessions, preferences, updatePreferences } = useData()

  const totalStudents = courses.reduce((a, c) => a + c.studentCount, 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl">
            {lecturer?.avatarInitials ?? '??'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{lecturer?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{lecturer?.title}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">{lecturer?.department}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">{lecturer?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">{lecturer?.department}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">Lecturer ID: {lecturer?.id}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <BookOpen className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">{courses.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Courses</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Users className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">{totalStudents}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">{pastSessions.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sessions</p>
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">QR Auto-Refresh</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Refresh QR code every 30 seconds</p>
              </div>
            </div>
            <Toggle checked={preferences.qrAutoRefresh} onChange={(v) => updatePreferences({ qrAutoRefresh: v })} />
          </div>

          <div className="border-t border-slate-50 dark:border-slate-700" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">GPS Verification Required</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Require GPS for attendance</p>
              </div>
            </div>
            <Toggle checked={preferences.gpsRequired} onChange={(v) => updatePreferences({ gpsRequired: v })} />
          </div>

          <div className="border-t border-slate-50 dark:border-slate-700" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Notifications</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Get alerts when students check in</p>
              </div>
            </div>
            <Toggle checked={preferences.notifications} onChange={(v) => updatePreferences({ notifications: v })} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Privacy & Security</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm transition-colors border border-red-100 dark:border-red-500/20"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">SmartAttend v1.0.0</p>
    </div>
  )
}

/* Toggle Component */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-600'
        }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  )
}
