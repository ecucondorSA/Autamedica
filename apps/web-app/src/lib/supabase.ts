import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Only create client on the client side
  if (typeof window === 'undefined') {
    return null
  }

  // Use the Supabase configuration - these should be available in the build
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtyvdircfhmdjiaelqkg.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4'
  
  // Ensure we have valid values
  if (!url || !key || url === 'https://dummy.supabase.co') {
    console.error('Supabase configuration error: Invalid URL or key')
    // Use the real values as fallback
    return createBrowserClient(
      'https://gtyvdircfhmdjiaelqkg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4'
    )
  }

  return createBrowserClient(url, key)
}

export type UserRole = 'patient' | 'doctor' | 'company' | 'company_admin' | 'admin' | 'platform_admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
  created_at: string
  updated_at: string
}

export const ROLE_REDIRECTS = {
  patient: {
    development: 'http://localhost:3003/dashboard',
    production: 'https://autamedica-patients.pages.dev/dashboard'
  },
  doctor: {
    development: 'http://localhost:3002/dashboard',
    production: 'https://autamedica-doctors.pages.dev/dashboard'
  },
  company: {
    development: 'http://localhost:3004/dashboard',
    production: 'https://autamedica-companies.pages.dev/dashboard'
  },
  company_admin: {
    development: 'http://localhost:3004/dashboard',
    production: 'https://autamedica-companies.pages.dev/dashboard'
  },
  admin: {
    development: 'http://localhost:3005/dashboard',
    production: 'https://autamedica-admin.pages.dev/dashboard'
  },
  platform_admin: {
    development: 'http://localhost:3000/admin',
    production: 'https://autamedica-web-app.pages.dev/admin'
  }
} as const

export function getRoleRedirectUrl(role: UserRole): string {
  const environment = (process.env.NEXT_PUBLIC_NODE_ENV ?? 'development') === 'development' ? 'development' : 'production'
  return ROLE_REDIRECTS[role][environment]
}