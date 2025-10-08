import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge';

// Get CORS headers based on the request origin
function getCorsHeaders(origin?: string | null) {
  // In development, allow localhost on any port
  const allowedOrigin = origin?.match(/^http:\/\/localhost:\d+$/)
    ? origin
    : 'https://autamedica.com'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  const headersList = await headers()
  const origin = headersList.get('origin')

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

// Get current session data
export async function GET() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            )
          },
        },
      }
    )

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401, headers: corsHeaders }
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Get user metadata
    const { data: user } = await supabase.auth.getUser()

    return NextResponse.json(
      {
        session,
        user: user?.user || null,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error('Session sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
