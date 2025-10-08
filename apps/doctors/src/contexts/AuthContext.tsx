'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { SessionData, fetchSessionData, getLoginUrl } from '@/lib/session-sync'

interface AuthContextType {
  session: SessionData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  initialSession?: SessionData | null
}

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const [session, setSession] = useState<SessionData | null>(initialSession)
  const [loading, setLoading] = useState(!initialSession)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)

      const sessionData = await fetchSessionData()

      if (!sessionData) {
        // 🔓 DEV MODE: Don't redirect in development
        if (process.env.NODE_ENV !== 'development') {
          window.location.href = getLoginUrl()
        }
        return
      }

      setSession(sessionData)

    } catch (err) {
      console.error('Auth refresh error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')

      // 🔓 DEV MODE: Don't redirect in development
      if (process.env.NODE_ENV !== 'development') {
        setTimeout(() => {
          window.location.href = getLoginUrl()
        }, 1000)
      }

    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh on mount if no initial session
  useEffect(() => {
    if (!initialSession) {
      refresh()
    } else {
      setLoading(false)
    }
  }, [initialSession])

  // Auto-refresh before token expires
  useEffect(() => {
    if (!session?.session.expires_at) return

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = session.session.expires_at - now
    const refreshTime = Math.max(expiresIn - 300, 60) // Refresh 5 min before expiry, min 1 min

    const timer = setTimeout(refresh, refreshTime * 1000)

    return () => clearTimeout(timer)
  }, [session])

  return (
    <AuthContext.Provider value={{ session, loading, error, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { session, loading, error } = useAuth()

  if (loading) {
    return { session: null, loading: true, error: null }
  }

  if (!session || error) {
    // 🔓 DEV MODE: Don't redirect in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
      window.location.href = getLoginUrl()
    }
    return { session: null, loading: false, error: error || 'No session' }
  }

  return { session, loading: false, error: null }
}