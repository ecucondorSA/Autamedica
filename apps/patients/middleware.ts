/**
 * @fileoverview Authentication middleware for Patients Portal
 * Uses @autamedica/auth package for centralized authentication
 */

import { createAppMiddleware, APP_NAMES } from '@autamedica/auth'

/**
 * Patients portal middleware
 * Requires authentication and validates 'patient' role
 */
export const middleware = createAppMiddleware(APP_NAMES.PATIENTS)

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, manifest.json
     * - images directory
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|images).*)',
  ],
}
