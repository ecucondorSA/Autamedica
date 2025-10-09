import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { logger } from '@autamedica/shared';
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const access_token = requestUrl.searchParams.get('access_token')
  const refresh_token = requestUrl.searchParams.get('refresh_token')

  if (!access_token || !refresh_token) {
    // No tokens, redirect to auth
    return NextResponse.redirect(
      `http://localhost:3005/auth/login?role=doctor&returnTo=${encodeURIComponent('http://localhost:3001/')}`
    )
  }

  try {
    const cookieStore = await cookies()

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    // Set the session from the tokens
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Error setting session:', error)
      return NextResponse.redirect(
        `http://localhost:3005/auth/login?role=doctor&returnTo=${encodeURIComponent('http://localhost:3001/')}`
      )
    }

    // Session set successfully, redirect to home
    return NextResponse.redirect('http://localhost:3001/')
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      `http://localhost:3005/auth/login?role=doctor&returnTo=${encodeURIComponent('http://localhost:3001/')}`
    )
  }
}
