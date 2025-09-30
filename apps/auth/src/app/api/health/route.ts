import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Health Check Endpoint
 * Verifica conectividad con Supabase y estado general de la auth app
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks = {
    app: 'autamedica-auth',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {} as Record<string, { status: string; latency?: number; error?: string }>
  }

  // 1. Check Supabase connection
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

    const dbStart = Date.now()
    const { error } = await supabase.from('profiles').select('count').limit(1).single()
    const dbLatency = Date.now() - dbStart

    checks.checks.database = {
      status: error ? 'unhealthy' : 'healthy',
      latency: dbLatency,
      ...(error && { error: error.message })
    }
  } catch (error) {
    checks.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    checks.status = 'unhealthy'
  }

  // 2. Check environment variables
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingEnvs = requiredEnvs.filter(key => !process.env[key])
  checks.checks.environment = {
    status: missingEnvs.length === 0 ? 'healthy' : 'unhealthy',
    ...(missingEnvs.length > 0 && { error: `Missing: ${missingEnvs.join(', ')}` })
  }

  if (missingEnvs.length > 0) {
    checks.status = 'unhealthy'
  }

  // 3. Check session-sync endpoint
  try {
    const sessionSyncUrl = new URL('/api/session-sync', request.url)
    const sessionSyncStart = Date.now()
    const response = await fetch(sessionSyncUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    const sessionSyncLatency = Date.now() - sessionSyncStart

    checks.checks.sessionSync = {
      status: response.status === 401 || response.status === 200 ? 'healthy' : 'unhealthy',
      latency: sessionSyncLatency
    }
  } catch (error) {
    checks.checks.sessionSync = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    checks.status = 'degraded'
  }

  const totalLatency = Date.now() - startTime
  const statusCode = checks.status === 'healthy' ? 200 : 503

  return NextResponse.json(
    {
      ...checks,
      totalLatency,
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      }
    }
  )
}
