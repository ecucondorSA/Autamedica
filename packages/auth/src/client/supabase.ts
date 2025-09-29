/**
 * @fileoverview Centralized Supabase client for browser environments
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig, getSessionConfig, getDomainConfig } from '../utils/config'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Create or get the Supabase browser client
 * Singleton pattern to ensure only one client instance
 */
export function createBrowserClient(): SupabaseClient {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Server-side protection
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient must only be called in browser environment')
  }

  const { url, anonKey } = getSupabaseConfig()
  const sessionConfig = getSessionConfig()
  const domainConfig = getDomainConfig()

  // Create the client with SSO cookie configuration
  supabaseClient = createSupabaseBrowserClient(url, anonKey, {
    cookies: {
      get(name: string) {
        // Use js-cookie for better cross-domain support
        if (typeof window !== 'undefined') {
          const cookies = document.cookie.split('; ')
          const cookie = cookies.find(c => c.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1] || '') : undefined
        }
        return undefined
      },
      set(name: string, value: string, options: any) {
        if (typeof window !== 'undefined') {
          // Set cookie with domain for SSO
          const cookieOptions = [
            `${name}=${encodeURIComponent(value)}`,
            `path=/`,
            `domain=${domainConfig.cookie}`,
            `max-age=${options.maxAge || sessionConfig.maxAge}`,
            `SameSite=Lax`,
            // Add Secure flag for production (HTTPS)
            process.env.NODE_ENV === 'production' ? `Secure` : '',
          ].filter(Boolean) // Remove empty strings

          document.cookie = cookieOptions.join('; ')
        }
      },
      remove(name: string) {
        if (typeof window !== 'undefined') {
          // Remove cookie from all possible domains
          const domains = [
            domainConfig.cookie,
            `.${domainConfig.base}`,
            domainConfig.base,
            'localhost'
          ]

          domains.forEach(domain => {
            document.cookie = `${name}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          })
        }
      }
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for better security
      storage: {
        // Use localStorage with fallback to sessionStorage
        getItem: (key: string) => {
          if (typeof window !== 'undefined') {
            try {
              return window.localStorage.getItem(key)
            } catch {
              return window.sessionStorage.getItem(key)
            }
          }
          return null
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(key, value)
            } catch {
              window.sessionStorage.setItem(key, value)
            }
          }
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.removeItem(key)
            } catch {
              window.sessionStorage.removeItem(key)
            }
          }
        }
      }
    }
  }) as unknown as SupabaseClient

  return supabaseClient!
}

/**
 * Get the existing Supabase client or create a new one
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    return createBrowserClient()
  }
  return supabaseClient
}

/**
 * Sign out and clear all sessions across apps
 */
export async function signOutGlobally(): Promise<void> {
  const client = getSupabaseClient()
  const domainConfig = getDomainConfig()

  // Sign out from Supabase
  await client.auth.signOut()

  // Clear all auth-related cookies
  const authCookies = [
    'autamedica_session',
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token'
  ]

  authCookies.forEach(cookieName => {
    // Clear from all possible domains
    const domains = [
      domainConfig.cookie,
      `.${domainConfig.base}`,
      domainConfig.base,
      'localhost'
    ]

    domains.forEach(domain => {
      document.cookie = `${cookieName}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
  })

  // Clear localStorage
  if (typeof window !== 'undefined') {
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.includes('supabase') || key.includes('autamedica')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}