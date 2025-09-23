/**
 * @fileoverview Authentication middleware for Next.js apps
 * Validates user sessions and enforces role-based access control
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  UserRole,
  AppName,
  APP_ALLOWED_ROLES,
  AuthError,
  UserProfile
} from '../types'
import {
  getSupabaseConfig,
  getDomainConfig,
  getSessionConfig
} from '../utils/config'
import {
  getLoginUrl,
  isCorrectAppForRole,
  getCorrectAppUrl
} from '../utils/redirect'

/**
 * Create Supabase server client for middleware
 */
function createMiddlewareClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseConfig()
  const sessionConfig = getSessionConfig()
  const domainConfig = getDomainConfig()

  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        request.cookies.set({
          name,
          value,
          ...options,
          domain: domainConfig.cookie,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: options.maxAge || sessionConfig.maxAge
        })
        supabaseResponse.cookies.set({
          name,
          value,
          ...options,
          domain: domainConfig.cookie,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: options.maxAge || sessionConfig.maxAge
        })
      },
      remove(name, options) {
        request.cookies.set({
          name,
          value: '',
          ...options,
          domain: domainConfig.cookie,
          path: '/',
          maxAge: 0
        })
        supabaseResponse.cookies.set({
          name,
          value: '',
          ...options,
          domain: domainConfig.cookie,
          path: '/',
          maxAge: 0
        })
      }
    }
  })

  return { supabase, response: supabaseResponse }
}

/**
 * Extract user profile from Supabase user
 */
function extractUserProfile(user: any): UserProfile {
  const role = user.user_metadata?.role as UserRole

  if (!role) {
    throw new AuthError(
      'INVALID_ROLE',
      'User does not have a valid role assigned',
      403
    )
  }

  return {
    id: user.id,
    email: user.email!,
    role,
    first_name: user.user_metadata?.first_name,
    last_name: user.user_metadata?.last_name,
    company_name: user.user_metadata?.company_name,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  }
}

/**
 * Determine the current app from the request
 */
function getCurrentApp(request: NextRequest): AppName {
  const host = request.headers.get('host') || ''

  if (host.includes('patients')) return 'patients'
  if (host.includes('doctors')) return 'doctors'
  if (host.includes('companies')) return 'companies'
  if (host.includes('admin')) return 'admin'

  // Check port for development
  if (host.includes('3003')) return 'patients'
  if (host.includes('3002')) return 'doctors'
  if (host.includes('3004')) return 'companies'
  if (host.includes('3005')) return 'admin'

  return 'web-app'
}

/**
 * Main authentication middleware
 */
export async function authMiddleware(
  request: NextRequest,
  options?: {
    requireAuth?: boolean
    allowedRoles?: UserRole[]
    publicPaths?: string[]
  }
) {
  const pathname = request.nextUrl.pathname
  const currentApp = getCurrentApp(request)

  // Check if path is public
  if (options?.publicPaths?.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Create Supabase client
  const { supabase, response } = createMiddlewareClient(request)

  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()

  // If auth is not required and no session, allow access
  if (!options?.requireAuth && !session) {
    return response
  }

  // If auth is required but no session, redirect to login
  if (options?.requireAuth && !session) {
    const loginUrl = getLoginUrl(request.url)
    return NextResponse.redirect(new URL(loginUrl))
  }

  // If we have a session, validate it
  if (session) {
    try {
      // Get user details
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        // Session is invalid, redirect to login
        const loginUrl = getLoginUrl(request.url)
        return NextResponse.redirect(new URL(loginUrl))
      }

      // Extract user profile
      const profile = extractUserProfile(user)

      // Check if user has access to current app
      const allowedRoles = options?.allowedRoles || APP_ALLOWED_ROLES[currentApp]

      if (!allowedRoles.includes(profile.role)) {
        // User doesn't have access to this app, redirect to their correct app
        const correctUrl = getCorrectAppUrl(profile.role, pathname)
        return NextResponse.redirect(new URL(correctUrl))
      }

      // Check if user is in the correct app for their role
      if (!isCorrectAppForRole(currentApp, profile.role)) {
        // Redirect to the correct app while preserving the path
        const correctUrl = getCorrectAppUrl(profile.role, pathname)
        return NextResponse.redirect(new URL(correctUrl))
      }

      // Add user info to headers for downstream use
      response.headers.set('x-user-id', profile.id)
      response.headers.set('x-user-role', profile.role)
      response.headers.set('x-user-email', profile.email)

      return response
    } catch (error) {
      console.error('Auth middleware error:', error)

      // On error, redirect to login
      const loginUrl = getLoginUrl(request.url)
      return NextResponse.redirect(new URL(loginUrl))
    }
  }

  return response
}

/**
 * Create app-specific middleware with predefined options
 */
export function createAppMiddleware(appName: AppName) {
  const allowedRoles = APP_ALLOWED_ROLES[appName]

  return async (request: NextRequest) => {
    // Define public paths for each app
    const publicPaths: Record<AppName, string[]> = {
      'web-app': ['/auth', '/api/health', '/', '/terms', '/privacy'],
      'patients': ['/api/health'],
      'doctors': ['/api/health'],
      'companies': ['/api/health'],
      'admin': ['/api/health']
    }

    return authMiddleware(request, {
      requireAuth: appName !== 'web-app', // Only web-app allows unauthenticated access
      allowedRoles,
      publicPaths: publicPaths[appName]
    })
  }
}