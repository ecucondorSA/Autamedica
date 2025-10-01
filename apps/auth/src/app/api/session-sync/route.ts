import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ensureEnv } from '@autamedica/shared'

// Cloudflare Pages requires Edge Runtime for all dynamic routes
export const runtime = 'edge'

/**
 * Session Sync API - Endpoint para sincronización de sesión entre apps
 * Usado por patients, doctors, companies para validar sesión centralizada
 */
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      ensureEnv('NEXT_PUBLIC_SUPABASE_URL'),
      ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // setAll doesn't work in route handlers
            }
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json(
        { user: null, authenticated: false },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': ensureEnv('NODE_ENV') === 'development'
              ? '*'
              : 'https://autamedica.com',
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      )
    }

    // Obtener perfil del usuario desde public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name, company_name, last_path')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          error: 'Profile not found'
        },
        { status: 401 }
      )
    }

    // Construir respuesta según contrato SessionData
    const sessionData = {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
      },
      profile: {
        id: profile.id,
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        company_name: profile.company_name,
        last_path: profile.last_path,
      },
      session: {
        expires_at: session.expires_at || 0,
        issued_at: Math.floor(new Date(session.user.created_at).getTime() / 1000),
      },
    }

    return NextResponse.json(sessionData, {
      headers: {
        'Access-Control-Allow-Origin': ensureEnv('NODE_ENV') === 'development'
          ? '*'
          : 'https://autamedica.com',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-store, max-age=0',
      }
    })

  } catch (error) {
    console.error('Session sync error:', error)
    return NextResponse.json(
      {
        user: null,
        authenticated: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler para CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': ensureEnv('NODE_ENV') === 'development'
        ? '*'
        : 'https://autamedica.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    }
  })
}

/**
 * POST handler para logout cross-app
 */
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      ensureEnv('NEXT_PUBLIC_SUPABASE_URL'),
      ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    await supabase.auth.signOut()

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Access-Control-Allow-Origin': ensureEnv('NODE_ENV') === 'development'
            ? '*'
            : 'https://autamedica.com',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
