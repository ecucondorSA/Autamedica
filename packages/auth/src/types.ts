/**
 * @fileoverview Core authentication types for AutaMedica platform
 * All users have exactly one role that maps to one application
 */

import type { User, Session } from '@supabase/supabase-js'

/**
 * User roles in the AutaMedica platform
 * Each user has exactly one role that determines their app access
 */
export type UserRole =
  | 'patient'
  | 'doctor'
  | 'company'
  | 'company_admin'
  | 'organization_admin'
  | 'admin'
  | 'platform_admin'

/**
 * Application identifiers
 */
export type AppName = 'web-app' | 'patients' | 'doctors' | 'companies' | 'admin'

/**
 * Extended user profile with role information
 */
export interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
  company_name?: string // For company/company_admin roles
  created_at: string
  updated_at: string
  last_path?: string // Last visited path for this user
}

/**
 * Authentication context state
 */
export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: Error | null
}

/**
 * Environment configuration
 */
export type Environment = 'development' | 'staging' | 'production'

/**
 * Domain configuration by environment
 */
export interface DomainConfig {
  base: string
  cookie: string
  apps: {
    web: string
    patients: string
    doctors: string
    companies: string
    admin: string
  }
}

/**
 * Role to app mapping configuration
 */
export const ROLE_APP_MAPPING: Record<UserRole, AppName> = {
  patient: 'patients',
  doctor: 'doctors',
  company: 'companies',
  company_admin: 'companies',
  organization_admin: 'admin',
  admin: 'admin',
  platform_admin: 'admin'
} as const

/**
 * App to allowed roles mapping
 */
export const APP_ALLOWED_ROLES: Record<AppName, UserRole[]> = {
  'web-app': [
    'patient',
    'doctor',
    'company',
    'company_admin',
    'organization_admin',
    'admin',
    'platform_admin'
  ],
  'patients': ['patient'],
  'doctors': ['doctor'],
  'companies': ['company', 'company_admin', 'organization_admin'],
  'admin': ['organization_admin', 'admin', 'platform_admin']
} as const

/**
 * Authentication redirect configuration
 */
export interface RedirectConfig {
  returnUrl?: string // User-requested URL (must be same-origin)
  lastPath?: string // User's last visited path for their role
  defaultPath: string // Default fallback path
}

/**
 * Session configuration
 */
export interface SessionConfig {
  cookieName: string
  cookieDomain: string
  maxAge: number // Max age in seconds
  refreshThreshold: number // Refresh when less than X seconds remain
  rememberMeDuration: number // Duration for "remember me" in seconds
}

/**
 * Authentication error types
 */
export type AuthErrorType =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_ROLE'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'CONFIGURATION_ERROR'

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
