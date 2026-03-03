import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  CheckCircle,
  History,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mockLecturer } from '../data/mockData'

const navItems = [
  { to: '/courses', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/session-history', icon: History, label: 'Session History' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-[72px]' : 'w-[272px]'}
          bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className={`${collapsed ? 'px-3' : 'px-6'} py-6 border-b border-white/10 transition-all duration-300`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-lg tracking-tight whitespace-nowrap">SmartAttend</h1>
                <p className="text-blue-200/80 text-[11px] font-medium tracking-wide uppercase whitespace-nowrap">Lecturer Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} py-5 space-y-1 transition-all duration-300`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `
                flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-0 py-3' : 'px-4 py-3'} rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg z-[60]">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex justify-center px-2 pb-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User card + logout */}
        <div className={`${collapsed ? 'px-2' : 'px-4'} py-4 border-t border-white/10 transition-all duration-300`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2`}>
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-sm shrink-0 group relative">
              {mockLecturer.avatarInitials}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg z-[60]">
                  {mockLecturer.name}
                </span>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{mockLecturer.name}</p>
                  <p className="text-blue-200/70 text-xs truncate">{mockLecturer.department}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {/* Logout button when collapsed */}
          {collapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center mt-2 p-2 rounded-xl text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors group relative"
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
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-500" />
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
