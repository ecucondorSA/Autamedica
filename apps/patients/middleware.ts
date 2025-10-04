/**
 * @fileoverview Authentication middleware for Patients Portal
 * Uses @autamedica/auth package for centralized authentication
 */

import { createAppMiddleware } from '@autamedica/auth/middleware'

/**
 * Patients portal middleware
 * Requires authentication and validates 'patient' role
 */
export const middleware = createAppMiddleware('patients')

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
