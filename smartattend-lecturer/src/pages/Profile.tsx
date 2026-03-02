import { useState } from 'react'
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
import { mockLecturer, mockCourses } from '../data/mockData'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [qrAutoRefresh, setQrAutoRefresh] = useState(true)
  const [gpsRequired, setGpsRequired] = useState(true)
  const [notifications, setNotifications] = useState(true)

  const totalStudents = mockCourses.reduce((a, c) => a + c.studentCount, 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl">
            {mockLecturer.avatarInitials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{mockLecturer.name}</h2>
            <p className="text-sm text-slate-500">{mockLecturer.title}</p>
            <p className="text-sm text-slate-400">{mockLecturer.department}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{mockLecturer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{mockLecturer.department}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Lecturer ID: {mockLecturer.id}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <BookOpen className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800">{mockCourses.length}</p>
          <p className="text-xs text-slate-500">Courses</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <Users className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800">{totalStudents}</p>
          <p className="text-xs text-slate-500">Students</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
          <p className="text-xl font-bold text-slate-800">30</p>
          <p className="text-xs text-slate-500">Sessions</p>
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">QR Auto-Refresh</p>
                <p className="text-xs text-slate-400">Refresh QR code every 30 seconds</p>
              </div>
            </div>
            <Toggle checked={qrAutoRefresh} onChange={setQrAutoRefresh} />
          </div>

          <div className="border-t border-slate-50" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">GPS Verification Required</p>
                <p className="text-xs text-slate-400">Require GPS for attendance</p>
              </div>
            </div>
            <Toggle checked={gpsRequired} onChange={setGpsRequired} />
          </div>

          <div className="border-t border-slate-50" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Notifications</p>
                <p className="text-xs text-slate-400">Get alerts when students check in</p>
              </div>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Privacy & Security</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-colors border border-red-100"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <p className="text-center text-xs text-slate-400 mt-6">SmartAttend v1.0.0</p>
    </div>
  )
}

/* Toggle Component */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-slate-200'
        }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  )
}
