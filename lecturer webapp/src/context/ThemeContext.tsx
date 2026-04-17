import { createContext, useContext, useState, useLayoutEffect, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const THEME_KEY = 'smartattend_theme'
const THEME_EXPLICIT_KEY = 'smartattend_theme_explicit'

const ThemeContext = createContext<ThemeState | undefined>(undefined)

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    const explicit = localStorage.getItem(THEME_EXPLICIT_KEY) === 'true'
    if (explicit && (stored === 'dark' || stored === 'light')) return stored
  } catch { /* ignore */ }
  // Default to light for clearer contrast unless the user explicitly chose dark.
  return 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Synchronous DOM update — prevents flash and ensures toggle is immediate
  useLayoutEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch { /* ignore */ }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      try {
        localStorage.setItem(THEME_EXPLICIT_KEY, 'true')
      } catch { /* ignore */ }
      return prev === 'dark' ? 'light' : 'dark'
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
