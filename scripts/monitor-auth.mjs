#!/usr/bin/env node

/**
 * Monitor Auth System - Health Check y Alertas
 *
 * Uso:
 *   pnpm monitor:auth                # Check único
 *   pnpm monitor:auth --watch        # Monitoreo continuo (cada 30s)
 *   pnpm monitor:auth --interval 60  # Custom interval en segundos
 */

import { setTimeout } from 'timers/promises'

const AUTH_URLS = {
  production: 'https://autamedica-auth.pages.dev',
  development: 'http://localhost:3005'
}

const config = {
  watch: process.argv.includes('--watch'),
  interval: parseInt(process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '30'),
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

const BASE_URL = AUTH_URLS[config.env]

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(level, message, data) {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
  }[level]

  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${prefix} ${message}`)
  if (data) {
    console.log(colors.gray, JSON.stringify(data, null, 2), colors.reset)
  }
}

async function checkHealth() {
  const results = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    checks: {},
    url: BASE_URL,
    environment: config.env
  }

  try {
    // 1. Health endpoint usando fetch nativo de Node.js
    log('info', `Checking health at ${BASE_URL}/api/health`)
    const healthController = new AbortController()
    const healthTimeout = setTimeout(() => healthController.abort(), 10000)

    try {
      const healthResponse = await fetch(`${BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AutaMedica-Monitor/1.0'
        },
        signal: healthController.signal
      })
      clearTimeout(healthTimeout)

      const healthData = await healthResponse.json()
      results.checks.health = {
        status: healthResponse.ok ? 'pass' : 'fail',
        statusCode: healthResponse.status,
        latency: healthData.totalLatency,
        details: {
          database: healthData.checks?.database?.status,
          environment: healthData.checks?.environment?.status
        }
      }

      if (!healthResponse.ok) {
        log('warning', 'Health check returned non-OK status', healthData)
      } else {
        log('success', `Health check passed (${healthData.totalLatency}ms)`)
      }
    } catch (error) {
      clearTimeout(healthTimeout)
      if (error.name === 'AbortError') {
        results.checks.health = {
          status: 'fail',
          error: 'Request timeout (10s)'
        }
        log('error', 'Health check timed out')
      } else {
        throw error
      }
    }

    // 2. Session-sync endpoint (should return 401 without auth)
    log('info', 'Checking session-sync endpoint')
    const sessionController = new AbortController()
    const sessionTimeout = setTimeout(() => sessionController.abort(), 10000)

    try {
      const sessionResponse = await fetch(`${BASE_URL}/api/session-sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AutaMedica-Monitor/1.0'
        },
        signal: sessionController.signal
      })
      clearTimeout(sessionTimeout)

      const sessionData = await sessionResponse.json()
      results.checks.sessionSync = {
        status: sessionResponse.status === 401 ? 'pass' : 'fail',
        statusCode: sessionResponse.status,
        authenticated: sessionData.authenticated,
        expectation: 'Should return 401 when unauthenticated'
      }

      if (sessionResponse.status === 401) {
        log('success', 'Session-sync correctly returns 401 for unauthenticated requests')
      } else {
        log('warning', `Session-sync unexpected status: ${sessionResponse.status}`, sessionData)
      }
    } catch (error) {
      clearTimeout(sessionTimeout)
      if (error.name === 'AbortError') {
        results.checks.sessionSync = {
          status: 'fail',
          error: 'Request timeout (10s)'
        }
        log('error', 'Session-sync check timed out')
      } else {
        throw error
      }
    }

    // 3. Determine overall status
    const allChecksPass = Object.values(results.checks).every(check => check.status === 'pass')
    results.status = allChecksPass ? 'pass' : 'fail'

    if (results.status === 'pass') {
      log('success', '✅ All auth system checks passed')
    } else {
      log('error', '❌ Auth system has failing checks', results)
    }

    return results

  } catch (error) {
    log('error', 'Monitor error', {
      message: error.message,
      code: error.code,
      cause: error.cause?.message
    })

    results.status = 'error'
    results.error = {
      message: error.message,
      code: error.code
    }
    return results
  }
}

async function sendAlert(results) {
  // Placeholder para integración futura con alerting (PagerDuty, Slack, etc.)
  if (results.status === 'fail' || results.status === 'error') {
    log('warning', '🚨 ALERT: Auth system health check failed!')

    // TODO: Integrar con sistema de alertas
    // - Slack webhook
    // - Email via SendGrid
    // - PagerDuty incident
  }
}

async function monitorLoop() {
  log('info', `Starting auth monitor in ${config.env} mode`)
  log('info', `Monitoring ${BASE_URL}`)

  if (config.watch) {
    log('info', `Watch mode enabled - checking every ${config.interval}s`)
  }

  do {
    console.log('\n' + '='.repeat(80))
    const results = await checkHealth()
    await sendAlert(results)
    console.log('='.repeat(80) + '\n')

    if (config.watch) {
      log('info', `Waiting ${config.interval}s until next check...`)
      await setTimeout(config.interval * 1000)
    }
  } while (config.watch)
}

// Run monitor
monitorLoop().catch(error => {
  log('error', 'Fatal error', error)
  process.exit(1)
})
