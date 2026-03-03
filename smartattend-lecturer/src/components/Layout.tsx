import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  LogOut,
  Menu,
  X,
  History,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mockLecturer } from '../data/mockData'

const navItems = [
  { to: '/courses', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/session-history', icon: History, label: 'Sessions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — light theme with indigo accents */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          bg-white border-r border-slate-200 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand + collapse toggle */}
        <div className={`${collapsed ? 'px-3' : 'px-5'} py-5 border-b border-slate-100 transition-all duration-300`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <h1 className="text-slate-800 font-bold text-lg tracking-tight whitespace-nowrap">SmartAttend</h1>
                </div>
              )}
            </div>
            {/* Collapse toggle (desktop) */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-4 space-y-1 transition-all duration-300`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `
                flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-0 py-3' : 'px-4 py-2.5'} rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-brand-600' : ''}`} />
                  {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg z-[60]">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-slate-100 transition-all duration-300`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2`}>
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0 group relative">
              {mockLecturer.avatarInitials}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg z-[60]">
                  {mockLecturer.name}
                </span>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-semibold truncate">{mockLecturer.name}</p>
                  <p className="text-slate-400 text-xs truncate">{mockLecturer.department}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center mt-2 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors group relative"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg z-[60]">
                Logout
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — desktop breadcrumb + user profile */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Portal</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">Lecturer Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{mockLecturer.name}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{mockLecturer.title}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
              {mockLecturer.avatarInitials}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-200">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">SmartAttend</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
