import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lecturer } from '../types'
import { mockLecturer } from '../data/mockData'

/* ── Demo credentials (to be replaced by real backend) ──── */
const DEMO_ID = 'LEC001'
const DEMO_PASSWORD = 'password'

interface SignupPayload {
  id: string
  name: string
  email: string
  department: string
  password: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  lecturer: Lecturer | null
  login: (id: string, password: string) => { success: boolean; error?: string }
  signup: (data: SignupPayload) => { success: boolean; error?: string }
  logout: () => void
}

const AUTH_KEY = 'smartattend_auth'

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lecturer, setLecturer] = useState<Lecturer | null>(null)

  /* Restore session from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === 'true') {
      setIsAuthenticated(true)
      setLecturer({ ...mockLecturer, id: DEMO_ID })
    }
    setIsLoading(false)
  }, [])

  const login = (id: string, password: string): { success: boolean; error?: string } => {
    if (id.trim().toUpperCase() === DEMO_ID && password === DEMO_PASSWORD) {
      setIsAuthenticated(true)
      setLecturer({ ...mockLecturer, id: DEMO_ID })
      localStorage.setItem(AUTH_KEY, 'true')
      return { success: true }
    }
    return { success: false, error: 'Invalid Lecturer ID or password' }
  }

  const signup = (data: SignupPayload): { success: boolean; error?: string } => {
    if (!data.id || !data.name || !data.email || !data.password) {
      return { success: false, error: 'All fields are required' }
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }
    // For demo purposes, accept any valid signup and create the lecturer
    const newLecturer: Lecturer = {
      id: data.id.toUpperCase(),
      name: data.name,
      title: 'Lecturer',
      department: data.department,
      avatarInitials: data.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      email: data.email,
    }
    setIsAuthenticated(true)
    setLecturer(newLecturer)
    localStorage.setItem(AUTH_KEY, 'true')
    return { success: true }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setLecturer(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, lecturer, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
