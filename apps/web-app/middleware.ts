import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_REDIRECTS = new Set([
  '/',
  '/dashboard',
  '/profile',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/select-role',
  '/terms',
  '/privacy'
])

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/admin",
  "/settings",
  "/appointments",
  "/patients",
  "/doctors",
  "/companies",
]

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/api/health'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static files and public APIs
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/health') ||
    pathname.includes('.') ||
    PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Safe redirect validation
  const returnTo = req.nextUrl.searchParams.get('returnTo') ?? '/'
  const safeRedirect = ALLOWED_REDIRECTS.has(returnTo) ? returnTo : '/'

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    // Configure secure cookies
    if (session?.access_token) {
      res.cookies.set('am_session', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    const isAuthenticated = !!session
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    // Redirect unauthenticated users from protected routes
    if (!isAuthenticated && isProtectedRoute) {
      return NextResponse.redirect(new URL(`/auth/login?returnTo=${safeRedirect}`, req.url))
    }

    // Redirect authenticated users from auth pages
    if (isAuthenticated && pathname.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL(safeRedirect, req.url))
    }

    return res

  } catch (error) {
    console.error('Middleware auth error:', error)

    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL(`/auth/login?returnTo=${safeRedirect}`, req.url))
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}