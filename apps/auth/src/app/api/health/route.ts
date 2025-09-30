import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ensureEnv } from '@autamedica/shared'

/**
 * Health Check Endpoint
 * Verifica conectividad con Supabase y estado general de la auth app
 */
export async function GET(_request: NextRequest) {
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

  const missingEnvs = requiredEnvs.filter(key => {
    try {
      ensureEnv(key)
      return false
    } catch {
      return true
    }
  })
  checks.checks.environment = {
    status: missingEnvs.length === 0 ? 'healthy' : 'unhealthy',
    ...(missingEnvs.length > 0 && { error: `Missing: ${missingEnvs.join(', ')}` })
  }

  if (missingEnvs.length > 0) {
    checks.status = 'unhealthy'
  }

  // 3. Check session-sync endpoint availability (estructura, no ejecución)
  checks.checks.sessionSync = {
    status: 'available',
    endpoint: '/api/session-sync'
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
