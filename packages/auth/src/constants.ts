/**
 * @fileoverview Shared constants for authentication
 */

import type { AppName } from './types'

/**
 * Application name constants
 * Use these instead of hardcoded strings
 */
export const APP_NAMES = {
  WEB_APP: 'web-app' as const,
  AUTH: 'auth' as const,
  PATIENTS: 'patients' as const,
  DOCTORS: 'doctors' as const,
  COMPANIES: 'companies' as const,
  ADMIN: 'admin' as const
} satisfies Record<string, AppName>

export type AppNameConstant = typeof APP_NAMES[keyof typeof APP_NAMES]
