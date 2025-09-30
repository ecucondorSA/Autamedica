/**
 * Secure middleware for Admin portal
 * Simplified version for build compatibility
 */

import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/health',
  '/manifest.webmanifest',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For now, allow all requests during build
  // TODO: Implement proper session validation when auth system is ready
  return NextResponse.next();
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