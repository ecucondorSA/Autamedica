import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Development bypass - skip authentication if enabled
  if (process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === 'true') {
    console.log('🔓 Auth bypass enabled for development');
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/api/health', '/auth/login', '/auth/register', '/auth/callback', '/auth/select-role', '/auth/forgot-password', '/auth/reset-password'];

  if (publicRoutes.includes(url.pathname)) {
    return NextResponse.next();
  }

  // Create response first
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Check authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            // Set domain to .autamedica.com for cross-subdomain sharing
            const cookieOptions = {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.autamedica.com' : undefined,
            };
            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If no session, redirect to centralized auth hub
  if (!session) {
    const authHubUrl = process.env.NODE_ENV === 'production'
      ? 'https://auth.autamedica.com'
      : 'http://localhost:3005';

    // Always use custom domain for returnTo, not .pages.dev
    const appUrl = process.env.NODE_ENV === 'production'
      ? 'https://patients.autamedica.com'
      : 'http://localhost:3003';

    const loginUrl = new URL('/auth/login', authHubUrl);
    loginUrl.searchParams.set('role', 'patient');
    loginUrl.searchParams.set('returnTo', `${appUrl}${url.pathname}`);

    return NextResponse.redirect(loginUrl);
  }

  // Check if user has patient role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (profile?.role !== 'patient') {
    // User doesn't have patient role, redirect to role selection
    return NextResponse.redirect(new URL('/auth/select-role', url.origin));
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-App', 'patients');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (except those we want to protect)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
