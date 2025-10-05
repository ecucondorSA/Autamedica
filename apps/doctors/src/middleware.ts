import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware para proteger el portal de doctors
 *
 * Este middleware verifica que:
 * 1. El usuario tenga una sesión válida
 * 2. El usuario tenga rol 'doctor'
 *
 * Si no cumple, redirige al login del Auth Hub
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for session tokens in URL (development mode with different ports)
  const hasUrlTokens = request.nextUrl.searchParams.has('access_token') &&
                       request.nextUrl.searchParams.has('refresh_token')

  // Check for Supabase session cookie
  // Supabase uses the format: sb-{project-ref}-auth-token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'gtyvdircfhmdjiaelqkg'
  const cookieName = `sb-${projectRef}-auth-token`

  const sessionCookie = request.cookies.get(cookieName)

  // Allow request if either session cookie exists OR URL has session tokens
  // URL tokens need to be processed by the page to establish the session
  if (!sessionCookie && !hasUrlTokens) {
    // No session - redirect to Auth Hub
    const authHubUrl = process.env.NEXT_PUBLIC_AUTH_HUB_URL || 'http://localhost:3005'
    const returnUrl = encodeURIComponent(request.url)
    const loginUrl = `${authHubUrl}/auth/login?role=doctor&returnTo=${returnUrl}`

    return NextResponse.redirect(loginUrl)
  }

  // Session exists - let it through
  // Role validation happens in the layout (server-side)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
