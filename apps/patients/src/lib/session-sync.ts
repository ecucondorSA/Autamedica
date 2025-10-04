import { UserRole } from '@autamedica/types'
import { patientsEnv, patientsLoginUrlBuilder } from '@/lib/env'

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
  // Development bypass - return mock session data
  if (patientsEnv.authDevBypassEnabled) {
    return {
      user: {
        id: 'dev-user-id',
        email: 'dev@patient.local'
      },
      profile: {
        id: 'dev-profile-id',
        role: 'patient' as UserRole,
        first_name: 'Dev',
        last_name: 'Patient',
        company_name: null,
        last_path: null
      },
      session: {
        expires_at: Date.now() + 86400000, // 24h from now
        issued_at: Date.now()
      }
    }
  }

   
  try {
    const response = await fetch(`${patientsEnv.authHubOrigin}/api/session-sync`, {
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
  const fallbackReturn = typeof window !== 'undefined' ? window.location.href : patientsEnv.appOrigin
  return patientsLoginUrlBuilder.build(returnTo ?? fallbackReturn)
}

/**
 * Logout and redirect to Auth Hub
 */
export async function logout() {
  try {
    await fetch(`${patientsEnv.authHubOrigin}/api/session-sync`, {
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
