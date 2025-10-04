/**
 * @fileoverview Environment-aware configuration for authentication
 */

import type { DomainConfig, Environment, SessionConfig } from '../types'

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV || 'development'

  if (env === 'production') return 'production'
  if (env === 'staging') return 'staging'
  return 'development'
}

/**
 * Get domain configuration for the current environment
 */
export function getDomainConfig(): DomainConfig {
  const env = getEnvironment()

  const configs: Record<Environment, DomainConfig> = {
    production: {
      base: 'pages.dev',
      cookie: '.pages.dev', // Cloudflare Pages cookie domain
      apps: {
        web: 'https://autamedica-web-app.pages.dev',
        auth: 'https://autamedica-auth.pages.dev',
        patients: 'https://autamedica-patients.pages.dev',
        doctors: 'https://autamedica-doctors.pages.dev',
        companies: 'https://autamedica-companies.pages.dev',
        admin: 'https://autamedica-admin.pages.dev'
      }
    },
    staging: {
      base: 'pages.dev',
      cookie: '.pages.dev', // Same as production for now
      apps: {
        web: 'https://autamedica-web-app-staging.pages.dev',
        auth: 'https://autamedica-auth-staging.pages.dev',
        patients: 'https://autamedica-patients-staging.pages.dev',
        doctors: 'https://autamedica-doctors-staging.pages.dev',
        companies: 'https://autamedica-companies-staging.pages.dev',
        admin: 'https://autamedica-admin-staging.pages.dev'
      }
    },
    development: {
      base: 'localhost',
      cookie: 'localhost', // Cookies work across ports on localhost
      apps: {
        web: 'http://localhost:3000',
        auth: 'http://localhost:3005',
        patients: 'http://localhost:3003',
        doctors: 'http://localhost:3002',
        companies: 'http://localhost:3004',
        admin: 'http://localhost:3006'
      }
    }
  }

  return configs[env]
}

/**
 * Get session configuration
 */
export function getSessionConfig(): SessionConfig {
  const domain = getDomainConfig()

  return {
    cookieName: 'autamedica_session',
    cookieDomain: domain.cookie,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    refreshThreshold: 60 * 60, // Refresh when less than 1 hour remains
    rememberMeDuration: 90 * 24 * 60 * 60 // 90 days for "remember me"
  }
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  const env = getEnvironment()

  // Production and staging use the same Supabase instance for now
  // In a real production setup, these would be different
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtyvdircfhmdjiaelqkg.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4'

  // Validate configuration
  if (!url || !anonKey) {
    throw new Error('Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Development localhost override if needed
  if (env === 'development' && url.includes('localhost:54321')) {
    return {
      url: 'http://localhost:54321',
      anonKey: anonKey
    }
  }

  return { url, anonKey }
}

/**
 * Check if a URL is same-origin
 */
export function isSameOrigin(url: string): boolean {
  try {
    const domain = getDomainConfig()
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.href : domain.apps.web)

    // Check if the URL belongs to any of our apps
    const validOrigins = Object.values(domain.apps)
    return validOrigins.some(origin => {
      const originUrl = new URL(origin)
      return urlObj.hostname === originUrl.hostname
    })
  } catch {
    return false
  }
}

/**
 * Sanitize return URL to prevent open redirects
 */
export function sanitizeReturnUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Remove any potential XSS attempts
  const cleaned = url.replace(/[<>'"]/g, '')

  // Ensure it's a relative URL or same-origin absolute URL
  if (cleaned.startsWith('/')) {
    return cleaned
  }

  if (isSameOrigin(cleaned)) {
    return cleaned
  }

  return null
}