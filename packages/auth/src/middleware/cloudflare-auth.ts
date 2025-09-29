/**
 * @fileoverview Cloudflare Pages middleware for authentication
 * Uses Cloudflare KV for shared sessions across subdomains
 */

import type { AppName } from '../types'
import { APP_ALLOWED_ROLES, ROLE_APP_MAPPING } from '../types'
import { parseSessionFromCookie, validateKVSession } from '../utils/cloudflare-sso'

/**
 * Cloudflare Pages Function middleware
 * This runs on the edge for all requests
 */
export async function onRequest(context: {
  request: Request
  env: any
  next: () => Promise<Response>
  params: any
}) {
  const { request, env, next } = context
  const url = new URL(request.url)

  // Skip auth for public paths
  const publicPaths = ['/api/health', '/_next', '/static', '/favicon.ico']
  if (publicPaths.some(path => url.pathname.startsWith(path))) {
    return next()
  }

  // Get current app from hostname
  const hostname = url.hostname
  let currentApp: AppName = 'web-app'

  if (hostname.includes('patients')) currentApp = 'patients'
  else if (hostname.includes('doctors')) currentApp = 'doctors'
  else if (hostname.includes('companies')) currentApp = 'companies'
  else if (hostname.includes('admin')) currentApp = 'admin'

  // Check for auth paths on web-app
  if (currentApp === 'web-app' && url.pathname.startsWith('/auth')) {
    return next() // Allow access to auth pages
  }

  // Get session from cookie
  const cookieHeader = request.headers.get('cookie')
  const sessionId = parseSessionFromCookie(cookieHeader)

  if (!sessionId) {
    // No session, redirect to login
    if (currentApp === 'web-app') {
      return next() // Allow access to web-app landing
    }

    const loginUrl = `https://autamedica-web-app.pages.dev/auth/login?returnUrl=${encodeURIComponent(url.toString())}`
    return Response.redirect(loginUrl, 302)
  }

  // Validate session with KV
  const profile = await validateKVSession(sessionId)

  if (!profile) {
    // Invalid session, redirect to login
    const loginUrl = `https://autamedica-web-app.pages.dev/auth/login?returnUrl=${encodeURIComponent(url.toString())}`
    return Response.redirect(loginUrl, 302)
  }

  // Check if user has access to current app
  const allowedRoles = APP_ALLOWED_ROLES[currentApp]
  if (!allowedRoles.includes(profile.role)) {
    // User doesn't have access, redirect to their correct app
    const correctApp = ROLE_APP_MAPPING[profile.role]
    const correctUrl = getAppUrl(correctApp, url.pathname)
    return Response.redirect(correctUrl, 302)
  }

  // Add user info to headers for the application
  const response = await next()
  const newHeaders = new Headers(response.headers)
  newHeaders.set('x-user-id', profile.id)
  newHeaders.set('x-user-role', profile.role)
  newHeaders.set('x-user-email', profile.email)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}

/**
 * Get the URL for a specific app
 */
function getAppUrl(app: AppName, path: string = '/'): string {
  const appUrls: Record<AppName, string> = {
    'web-app': 'https://autamedica-web-app.pages.dev',
    'patients': 'https://autamedica-patients.pages.dev',
    'doctors': 'https://autamedica-doctors.pages.dev',
    'companies': 'https://autamedica-companies.pages.dev',
    'admin': 'https://autamedica-admin.pages.dev'
  }

  return `${appUrls[app]}${path}`
}

/**
 * Configuration for different apps
 * Export this for each app's functions directory
 */
export const middlewareConfig = {
  patients: {
    allowedRoles: ['patient'],
    requireAuth: true,
    publicPaths: ['/api/health']
  },
  doctors: {
    allowedRoles: ['doctor'],
    requireAuth: true,
    publicPaths: ['/api/health']
  },
  companies: {
    allowedRoles: ['company', 'company_admin', 'organization_admin'],
    requireAuth: true,
    publicPaths: ['/api/health']
  },
  admin: {
    allowedRoles: ['organization_admin', 'admin', 'platform_admin'],
    requireAuth: true,
    publicPaths: ['/api/health']
  },
  'web-app': {
    allowedRoles: ['patient', 'doctor', 'company', 'company_admin', 'organization_admin', 'admin', 'platform_admin'],
    requireAuth: false,
    publicPaths: ['/', '/auth', '/terms', '/privacy', '/api/health']
  }
}
