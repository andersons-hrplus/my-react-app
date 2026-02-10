import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (isDark: boolean) => {
      console.log('Applying theme:', isDark ? 'dark' : 'light')
      
      // Force remove and add classes to ensure DOM update
      root.classList.remove('dark', 'light')
      
      if (isDark) {
        root.classList.add('dark')
        setActualTheme('dark')
      } else {
        root.classList.add('light')
        setActualTheme('light')
      }
      
      // Set colorScheme for system integration
      root.style.colorScheme = isDark ? 'dark' : 'light'
      
      // Log final DOM state for debugging
      console.log('DOM classes after update:', root.className)
      console.log('Color scheme set to:', root.style.colorScheme)
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addListener(handleChange)
      
      return () => mediaQuery.removeListener(handleChange)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme)
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}