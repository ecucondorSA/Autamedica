/**
 * Secure middleware for Doctors portal
 * Uses JWT verification instead of hardcoded credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasRole, getPortalForRole, isCorrectPortal, buildSafeLoginUrl } from '@autamedica/shared';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/health',
  '/manifest.webmanifest',
];

// Allowed roles for doctors portal
const ALLOWED_ROLES = ['doctor', 'organization_admin', 'platform_admin'] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    // Get session using JWT verification (no Supabase client needed)
    const session = await getSession(request);

    // No session - redirect to login
    if (!session) {
      const loginUrl = buildSafeLoginUrl('doctors', request.url, 'session_expired');
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has allowed role for doctors portal
    if (!hasRole(session, [...ALLOWED_ROLES])) {
      // User has wrong role - redirect to their correct portal
      const correctPortal = getPortalForRole(session.user.role);
      return NextResponse.redirect(new URL('/', correctPortal));
    }

    // Verify user is on correct portal for their role
    if (!isCorrectPortal(origin, session.user.role)) {
      const correctPortal = getPortalForRole(session.user.role);
      return NextResponse.redirect(new URL(pathname, correctPortal));
    }

    // All checks passed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);

    // On error, redirect to login
    const loginUrl = buildSafeLoginUrl('doctors', request.url, 'auth_error');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.webmanifest (metadata files)
     * - public folder
     * - api/health (health check endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|public|api/health).*)',
  ],
};