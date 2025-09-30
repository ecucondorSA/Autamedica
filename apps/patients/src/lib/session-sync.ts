import { UserRole } from '@autamedica/types'

export interface SessionData {
  user: {
    id: string
    email: string
  }
  profile: {
    id: string
    role: UserRole
    first_name: string | null
    last_name: string | null
    company_name: string | null
    last_path: string | null
  }
  session: {
    expires_at: number
    issued_at: number
  }
}

/**
 * Fetch session data from Auth Hub
 */
export async function fetchSessionData(): Promise<SessionData | null> {
  try {
    const authHubUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3005'
      : 'https://auth.autamedica.com'

    const response = await fetch(`${authHubUrl}/api/session-sync`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add cache control for SSR
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 401) {
        // No session - redirect to login
        return null
      }
      throw new Error(`Session sync failed: ${response.status}`)
    }

    const sessionData: SessionData = await response.json()

    // Validate role access for patients portal
    if (!['patient'].includes(sessionData.profile.role)) {
      throw new Error(`Invalid role for patients portal: ${sessionData.profile.role}`)
    }

    return sessionData

  } catch (error) {
    console.error('Session sync error:', error)
    return null
  }
}

/**
 * Get login URL with return path
 */
export function getLoginUrl(returnTo?: string): string {
  const authHubUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3005'
    : 'https://auth.autamedica.com'

  const currentUrl = returnTo || (typeof window !== 'undefined' ? window.location.href : '')
  const params = new URLSearchParams()

  if (currentUrl) {
    params.set('returnTo', currentUrl)
  }

  return `${authHubUrl}/login?${params.toString()}`
}

/**
 * Logout and redirect to Auth Hub
 */
export async function logout() {
  try {
    const authHubUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3005'
      : 'https://auth.autamedica.com'

    await fetch(`${authHubUrl}/api/session-sync`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        returnTo: getLoginUrl()
      })
    })

    // Redirect to login
    window.location.href = getLoginUrl()

  } catch (error) {
    console.error('Logout error:', error)
    // Fallback - just redirect to login
    window.location.href = getLoginUrl()
  }
}