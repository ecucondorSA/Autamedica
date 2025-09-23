/**
 * @fileoverview Cloudflare Workers KV-based SSO implementation
 * Uses Cloudflare KV for shared session storage across subdomains
 */

import type { UserProfile, UserRole } from '../types'

/**
 * Cloudflare KV namespace bindings (injected by Cloudflare)
 */
declare global {
  const AUTH_SESSIONS: KVNamespace
  const USER_PROFILES: KVNamespace
}

/**
 * Session data stored in KV
 */
interface KVSession {
  userId: string
  email: string
  role: UserRole
  profile: UserProfile
  expiresAt: number
  createdAt: number
  lastActivity: number
}

/**
 * Generate a session key for KV storage
 */
function getSessionKey(sessionId: string): string {
  return `session:${sessionId}`
}

/**
 * Generate a user key for KV storage
 */
function getUserKey(userId: string): string {
  return `user:${userId}`
}

/**
 * Create a new session in Cloudflare KV
 * This enables SSO across all .pages.dev subdomains
 */
export async function createKVSession(
  sessionId: string,
  userId: string,
  profile: UserProfile,
  ttl: number = 86400 // 24 hours default
): Promise<void> {
  if (typeof AUTH_SESSIONS === 'undefined') {
    console.warn('AUTH_SESSIONS KV namespace not available')
    return
  }

  const now = Date.now()
  const session: KVSession = {
    userId,
    email: profile.email,
    role: profile.role,
    profile,
    expiresAt: now + (ttl * 1000),
    createdAt: now,
    lastActivity: now
  }

  // Store session with TTL
  await AUTH_SESSIONS.put(
    getSessionKey(sessionId),
    JSON.stringify(session),
    { expirationTtl: ttl }
  )

  // Also store user profile for quick lookup
  await USER_PROFILES.put(
    getUserKey(userId),
    JSON.stringify(profile),
    { expirationTtl: ttl }
  )
}

/**
 * Get session from Cloudflare KV
 */
export async function getKVSession(sessionId: string): Promise<KVSession | null> {
  if (typeof AUTH_SESSIONS === 'undefined') {
    console.warn('AUTH_SESSIONS KV namespace not available')
    return null
  }

  try {
    const sessionData = await AUTH_SESSIONS.get(getSessionKey(sessionId))
    if (!sessionData) return null

    const session = JSON.parse(sessionData) as KVSession

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await deleteKVSession(sessionId)
      return null
    }

    // Update last activity
    session.lastActivity = Date.now()
    await AUTH_SESSIONS.put(
      getSessionKey(sessionId),
      JSON.stringify(session),
      { expirationTtl: Math.floor((session.expiresAt - Date.now()) / 1000) }
    )

    return session
  } catch (error) {
    console.error('Error getting KV session:', error)
    return null
  }
}

/**
 * Delete session from Cloudflare KV
 */
export async function deleteKVSession(sessionId: string): Promise<void> {
  if (typeof AUTH_SESSIONS === 'undefined') {
    console.warn('AUTH_SESSIONS KV namespace not available')
    return
  }

  const session = await getKVSession(sessionId)
  if (session) {
    // Delete session
    await AUTH_SESSIONS.delete(getSessionKey(sessionId))

    // Delete user profile
    await USER_PROFILES.delete(getUserKey(session.userId))
  }
}

/**
 * Validate session and get user profile
 */
export async function validateKVSession(sessionId: string): Promise<UserProfile | null> {
  const session = await getKVSession(sessionId)
  return session?.profile || null
}

/**
 * Refresh session TTL
 */
export async function refreshKVSession(
  sessionId: string,
  additionalTtl: number = 3600 // Add 1 hour by default
): Promise<boolean> {
  const session = await getKVSession(sessionId)
  if (!session) return false

  session.expiresAt = Date.now() + (additionalTtl * 1000)

  await AUTH_SESSIONS.put(
    getSessionKey(sessionId),
    JSON.stringify(session),
    { expirationTtl: additionalTtl }
  )

  return true
}

/**
 * Get all active sessions for a user (for security/audit)
 */
export async function getUserSessions(userId: string): Promise<string[]> {
  if (typeof AUTH_SESSIONS === 'undefined') {
    console.warn('AUTH_SESSIONS KV namespace not available')
    return []
  }

  // This would require listing keys which is expensive in KV
  // In production, you'd want to maintain a separate index
  console.warn('getUserSessions not fully implemented - requires KV list operation')
  return []
}

/**
 * Create a session cookie that works across .pages.dev subdomains
 */
export function createSSOCookie(sessionId: string, ttl: number = 86400): string {
  const expires = new Date(Date.now() + ttl * 1000).toUTCString()

  // Cookie that works across all .pages.dev subdomains
  return [
    `autamedica_session=${sessionId}`,
    `Domain=.pages.dev`,
    `Path=/`,
    `Expires=${expires}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`
  ].join('; ')
}

/**
 * Parse session ID from cookie header
 */
export function parseSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['autamedica_session'] || null
}