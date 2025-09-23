/**
 * @fileoverview Redirect utilities for authentication flow
 */

import { UserRole, ROLE_APP_MAPPING, AppName } from '../types'
import { getDomainConfig, sanitizeReturnUrl } from './config'

/**
 * Get the redirect URL for a user based on their role
 * Priority: 1) returnUrl if valid, 2) lastPath if exists, 3) default dashboard
 */
export function getRedirectUrl(
  role: UserRole,
  returnUrl?: string | null,
  lastPath?: string | null
): string {
  const domainConfig = getDomainConfig()
  const targetApp = ROLE_APP_MAPPING[role]

  // Priority 1: Use returnUrl if it's valid and same-origin
  const sanitizedReturnUrl = sanitizeReturnUrl(returnUrl)
  if (sanitizedReturnUrl) {
    // If it's a relative URL, prepend the correct app domain
    if (sanitizedReturnUrl.startsWith('/')) {
      const appDomain = domainConfig.apps[targetApp as keyof typeof domainConfig.apps]
      return `${appDomain}${sanitizedReturnUrl}`
    }
    // If it's an absolute URL and valid, use it
    return sanitizedReturnUrl
  }

  // Priority 2: Use lastPath if it exists
  if (lastPath?.startsWith('/')) {
    const appDomain = domainConfig.apps[targetApp as keyof typeof domainConfig.apps]
    return `${appDomain}${lastPath}`
  }

  // Priority 3: Default to app dashboard
  return getDefaultRedirectUrl(role)
}

/**
 * Get the default redirect URL for a role
 */
export function getDefaultRedirectUrl(role: UserRole): string {
  const domainConfig = getDomainConfig()
  const targetApp = ROLE_APP_MAPPING[role]
  const appDomain = domainConfig.apps[targetApp as keyof typeof domainConfig.apps]

  // Default dashboard path for each app
  const defaultPaths: Record<AppName, string> = {
    'web-app': '/',
    'patients': '/dashboard',
    'doctors': '/dashboard',
    'companies': '/dashboard',
    'admin': '/dashboard'
  }

  return `${appDomain}${defaultPaths[targetApp]}`
}

/**
 * Get the login URL with optional return URL
 */
export function getLoginUrl(returnUrl?: string): string {
  const domainConfig = getDomainConfig()
  const baseLoginUrl = `${domainConfig.apps.web}/auth/login`

  if (returnUrl) {
    const sanitized = sanitizeReturnUrl(returnUrl)
    if (sanitized) {
      const params = new URLSearchParams({ returnUrl: sanitized })
      return `${baseLoginUrl}?${params.toString()}`
    }
  }

  return baseLoginUrl
}

/**
 * Check if current app matches user's role
 */
export function isCorrectAppForRole(
  currentApp: AppName,
  userRole: UserRole
): boolean {
  const expectedApp = ROLE_APP_MAPPING[userRole]

  // Special case: web-app is accessible to all roles
  if (currentApp === 'web-app') {
    return true
  }

  return currentApp === expectedApp
}

/**
 * Get the correct app URL for a user's role
 */
export function getCorrectAppUrl(
  userRole: UserRole,
  preservePath?: string
): string {
  const domainConfig = getDomainConfig()
  const targetApp = ROLE_APP_MAPPING[userRole]
  const appDomain = domainConfig.apps[targetApp as keyof typeof domainConfig.apps]

  if (preservePath?.startsWith('/')) {
    return `${appDomain}${preservePath}`
  }

  return appDomain
}

/**
 * Store the last visited path for a user
 */
export function storeLastPath(userId: string, path: string): void {
  if (typeof window === 'undefined') return

  const key = `autamedica_last_path_${userId}`
  try {
    localStorage.setItem(key, path)
  } catch {
    // Fallback to sessionStorage if localStorage is not available
    sessionStorage.setItem(key, path)
  }
}

/**
 * Retrieve the last visited path for a user
 */
export function getLastPath(userId: string): string | null {
  if (typeof window === 'undefined') return null

  const key = `autamedica_last_path_${userId}`
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Clear the last visited path for a user
 */
export function clearLastPath(userId: string): void {
  if (typeof window === 'undefined') return

  const key = `autamedica_last_path_${userId}`
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch {
    // Ignore errors
  }
}