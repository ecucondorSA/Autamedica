function parsePort(raw) {
  const value = raw ?? '8888'
  const port = Number.parseInt(value, 10)
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('SIGNALING_PORT debe ser un entero positivo')
  }
  return port
}

function normalizeLogLevel(value) {
  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
    return value
  }
  return 'info'
}

export const env = {
  SIGNALING_PORT: parsePort(process.env.SIGNALING_PORT),
  SIGNALING_HOST: process.env.SIGNALING_HOST ?? '0.0.0.0',
  SIGNALING_PATH: process.env.SIGNALING_PATH ?? '/signal',
  SIGNALING_LOG_LEVEL: normalizeLogLevel(process.env.SIGNALING_LOG_LEVEL),
}
