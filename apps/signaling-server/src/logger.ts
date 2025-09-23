import { env } from './env.js'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levels: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function shouldLog(level: LogLevel) {
  return levels[level] >= levels[env.SIGNALING_LOG_LEVEL]
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (!shouldLog(level)) return

  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta ?? {}),
  }

  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn(JSON.stringify(payload))
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
}
