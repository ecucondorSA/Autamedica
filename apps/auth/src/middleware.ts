import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProduction } from '@autamedica/shared';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // 1. Enforce canonical hostname for auth hub
  if (url.hostname !== 'auth.autamedica.com' && url.hostname !== 'localhost') {
    // In production, enforce auth.autamedica.com
    if (isProduction()) {
      url.hostname = 'auth.autamedica.com';
      return NextResponse.redirect(url, 301);
    }
  }

  // 2. Add security headers to all responses
  const response = NextResponse.next();

  // Check if this is an API route
  const isApiRoute = url.pathname.startsWith('/api/');

  // Security headers specific to Auth Hub
  if (!isApiRoute) {
    response.headers.set('X-Frame-Options', 'DENY'); // Auth pages should never be framed
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Auth-Hub', 'true'); // Identify as auth hub

  // CSP for Auth Hub - more restrictive (skip for API routes)
  if (!isApiRoute) {
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'none'; " + // No framing allowed
      "connect-src 'self' https://*.autamedica.com https://*.supabase.co wss: https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.autamedica.com; " +
      "object-src 'none'; " + // No objects/embeds
      "base-uri 'self'"
    );
  }

  // CORS for AutaMedica ecosystem
  // API routes handle their own CORS in development
  if (!isApiRoute) {
    response.headers.set('Access-Control-Allow-Origin', 'https://autamedica.com');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};