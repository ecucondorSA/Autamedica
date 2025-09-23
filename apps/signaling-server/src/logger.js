import { env } from './env.js'

const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function shouldLog(level) {
  return levels[level] >= levels[env.SIGNALING_LOG_LEVEL]
}

function log(level, message, meta) {
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
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
}
