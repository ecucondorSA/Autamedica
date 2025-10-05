import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isProduction } from '@autamedica/shared';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/select-role',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/api',
];

// Check if path matches public routes
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // 1. Enforce canonical hostname for auth hub
  if (url.hostname !== 'auth.autamedica.com' && url.hostname !== 'localhost') {
    if (isProduction()) {
      url.hostname = 'auth.autamedica.com';
      return NextResponse.redirect(url, 301);
    }
  }

  // 2. Create response (will be modified with headers and cookies)
  let response = NextResponse.next();

  // 3. Session validation for protected routes
  if (!isPublicRoute(url.pathname)) {
    try {
      // Create Supabase client for middleware
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // Set cookie on both request and response
              req.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              req.cookies.set({ name, value: '', ...options, maxAge: 0 });
              response.cookies.set({ name, value: '', ...options, maxAge: 0 });
            },
          },
        }
      );

      // Check session
      const { data: { session }, error } = await supabase.auth.getSession();

      // No session or error -> redirect to role selection
      if (error || !session) {
        const loginUrl = new URL('/auth/select-role', req.url);
        loginUrl.searchParams.set('returnTo', url.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Session exists -> refresh it and continue
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        // Session refresh failed -> redirect to login
        const loginUrl = new URL('/auth/select-role', req.url);
        loginUrl.searchParams.set('returnTo', url.pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Session check failed -> redirect to login
      const loginUrl = new URL('/auth/select-role', req.url);
      loginUrl.searchParams.set('returnTo', url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Add security headers to all responses
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

  // CORS for AutaMedica ecosystem (only for non-API routes)
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
    '/((?!_next/static|_next/image|favicon.ico|public|icon-).*)',
  ],
};
