import { ensureClientEnv, ensureEnv } from '@autamedica/shared'

const runtimeEnv = (() => {
  try {
    return ensureClientEnv('NEXT_PUBLIC_NODE_ENV')
  } catch {
    try {
      return ensureEnv('NODE_ENV')
    } catch {
      return 'development'
    }
  }
})()

const isProductionBuild = runtimeEnv === 'production'

export function logDebug(...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.info(...args);
import { logger } from '@autamedica/shared';
  }
}

export function logInfo(...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.info(...args);
  }
}

export function logWarn(...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.warn(...args);
  }
}
