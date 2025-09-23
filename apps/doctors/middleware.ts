import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/_next', '/favicon.ico', '/public', '/api/health']
const WEB_APP_URL = process.env.NODE_ENV === 'production'
  ? 'https://autamedica-web-app.pages.dev'
  : 'http://localhost:3000'

const ALLOWED_ROLES = new Set(['doctor', 'admin', 'platform_admin'])

function buildLoginUrl(pathname: string, reason?: string) {
  const loginUrl = new URL('/auth/login', WEB_APP_URL)
  loginUrl.searchParams.set('portal', 'doctors')
  if (pathname) {
    loginUrl.searchParams.set('returnTo', pathname)
  }
  if (reason) {
    loginUrl.searchParams.set('error', reason)
  }
  return loginUrl
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Doctors middleware] Variables de entorno de Supabase no configuradas.')
    return NextResponse.redirect(buildLoginUrl(pathname, 'missing_supabase_env'))
  }

  const response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.redirect(buildLoginUrl(pathname, error ? 'session_error' : 'no_session'))
    }

    const userRole = (session.user.user_metadata?.role as string | undefined) ?? 'guest'

    if (!ALLOWED_ROLES.has(userRole)) {
      return NextResponse.redirect(new URL('/', WEB_APP_URL))
    }

    return response
  } catch (error) {
    console.error('[Doctors middleware] Error verificando sesión', error)
    return NextResponse.redirect(buildLoginUrl(pathname, 'middleware_error'))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)'],
}
