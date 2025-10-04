/**
 * @fileoverview React hooks and context for authentication
 */

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react'
import { User } from '@supabase/supabase-js'
import {
  AuthState,
  UserProfile,
  UserRole,
  AuthError
} from '../types'
import { isUserRole, ROLES } from '../roles'
import {
  getSupabaseClient,
  signOutGlobally
} from '../client/supabase'
import {
  getRedirectUrl,
  storeLastPath,
  getLastPath,
  clearLastPath
} from '../utils/redirect'

/**
 * Authentication context
 */
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithOAuth: (provider: 'google') => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  redirectToRole: (returnUrl?: string) => void
  updateLastPath: (path: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Extract user profile from Supabase user
 */
function normalizeRole(role: unknown): UserRole | null {
  if (typeof role === 'string') {
    if (role === ROLES.COMPANY_ADMIN) {
      return ROLES.ORGANIZATION_ADMIN
    }

    if (isUserRole(role)) {
      return role
    }
  }

  console.error('User does not have a role assigned')
  return null
}

function extractUserProfile(user: User): UserProfile | null {
  const role = normalizeRole(user.user_metadata?.role)

  if (!role) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role,
    first_name: user.user_metadata?.first_name,
    last_name: user.user_metadata?.last_name,
    company_name: user.user_metadata?.company_name,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    last_path: getLastPath(user.id) ?? '/dashboard'
  }
}

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: React.ReactNode
  onAuthStateChange?: (state: AuthState) => void
}

/**
 * Check if dev bypass is enabled
 */
const isDevBypass = typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === 'true'

/**
 * Authentication provider component
 */
export function AuthProvider({
  children,
  onAuthStateChange
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  })
  const [isClient, setIsClient] = useState(false)

  // Initialize client safely after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize Supabase client only on client side and not in dev bypass
  const supabase = useMemo(() => {
    if (!isClient || isDevBypass) return null

    try {
      return getSupabaseClient()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      setState(prev => ({
        ...prev,
        error: error as Error,
        loading: false
      }))
      return null
    }
  }, [isClient])

  // Load initial session
  useEffect(() => {
    // Handle dev bypass mode
    if (isDevBypass && isClient) {
      const params = new URLSearchParams(window.location.search)
      const role = params.get('as') === 'patient' ? ROLES.PATIENT : ROLES.DOCTOR

      // Create mock user for dev mode
      const mockUser = {
        id: `dev-${role}-1`,
        email: `${role}@dev.local`,
        user_metadata: { role },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any

      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: mockUser.email,
        role,
        first_name: 'Dev',
        last_name: role === ROLES.DOCTOR ? 'Doctor' : 'Patient',
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
        last_path: '/dashboard'
      }

      setState({
        user: mockUser,
        profile: mockProfile,
        session: { access_token: 'dev-token', user: mockUser } as any,
        loading: false,
        error: null
      })
      return
    }

    if (!supabase) return

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          const profile = extractUserProfile(session.user)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Failed to load session:', error)
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: error as Error
        })
      }
    }

    loadSession()
  }, [supabase, isClient])

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase || isDevBypass) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        if (session) {
          const profile = extractUserProfile(session.user)
          const newState = {
            user: session.user,
            profile,
            session,
            loading: false,
            error: null
          }
          setState(newState)
          onAuthStateChange?.(newState)
        } else {
          const newState = {
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          }
          setState(newState)
          onAuthStateChange?.(newState)
        }

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          // Clear stored paths on sign out
          if (state.user) {
            clearLastPath(state.user.id)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, onAuthStateChange, state.user])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    if (isDevBypass) {
      console.log('Dev bypass mode - skipping sign in')
      return
    }

    if (!supabase) {
      throw new AuthError('CONFIGURATION_ERROR', 'Supabase client not initialized')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
      throw error
    }
  }, [supabase])

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    if (isDevBypass) {
      console.log('Dev bypass mode - skipping magic link')
      return
    }

    if (!supabase) {
      throw new AuthError('CONFIGURATION_ERROR', 'Supabase client not initialized')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Don't create new users
        }
      })

      if (error) throw error
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
      throw error
    }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    if (isDevBypass) {
      console.log('Dev bypass mode - skipping sign out')
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null
      })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Clear last path before signing out
      if (state.user) {
        clearLastPath(state.user.id)
      }

      await signOutGlobally()

      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
      throw error
    }
  }, [state.user])

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google') => {
    if (isDevBypass) {
      console.log('Dev bypass mode - skipping OAuth sign in')
      return
    }

    if (!supabase) {
      throw new AuthError('CONFIGURATION_ERROR', 'Supabase client not initialized')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      })

      if (error) throw error
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
      throw error
    }
  }, [supabase])

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (isDevBypass) {
      console.log('Dev bypass mode - skipping refresh')
      return
    }

    if (!supabase) return

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error) throw error

      if (session) {
        const profile = extractUserProfile(session.user)
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null
        })
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      setState(prev => ({
        ...prev,
        error: error as Error
      }))
    }
  }, [supabase])

  // Redirect to user's role-appropriate app
  const redirectToRole = useCallback((returnUrl?: string) => {
    if (!state.profile) {
      console.warn('Cannot redirect: no user profile')
      return
    }

    const redirectUrl = getRedirectUrl(
      state.profile.role,
      returnUrl,
      state.profile.last_path
    )

    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    }
  }, [state.profile])

  // Update last visited path for the user
  const updateLastPath = useCallback((path: string) => {
    if (!state.user) return

    storeLastPath(state.user.id, path)

    // Update local state
    setState(prev => ({
      ...prev,
      profile: prev.profile ? {
        ...prev.profile,
        last_path: path
      } : null
    }))
  }, [state.user])

  const value: AuthContextValue = {
    ...state,
    signIn,
    signInWithMagicLink,
    signInWithOAuth,
    signOut,
    refreshSession,
    redirectToRole,
    updateLastPath
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(
  redirectUrl?: string
): AuthContextValue {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login if not authenticated
      const loginUrl = `/auth/login${redirectUrl ? `?returnUrl=${encodeURIComponent(redirectUrl)}` : ''}`
      window.location.href = loginUrl
    }
  }, [auth.loading, auth.user, redirectUrl])

  return auth
}

/**
 * Hook to require a specific role
 */
export function useRequireRole(
  allowedRoles: UserRole[],
  redirectUrl?: string
): AuthContextValue {
  const auth = useRequireAuth(redirectUrl)

  useEffect(() => {
    if (!auth.loading && auth.profile) {
      if (!allowedRoles.includes(auth.profile.role)) {
        // Redirect to correct app for user's role
        auth.redirectToRole()
      }
    }
  }, [auth, allowedRoles])

  return auth
}
