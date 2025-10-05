import { ensureClientEnv, ensureEnv, logger } from '@autamedica/shared'

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

export function logDebug(message: string, ...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.info(message, ...args);
  }
}

export function logInfo(message: string, ...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.info(message, ...args);
  }
}

export function logWarn(message: string, ...args: unknown[]): void {
  if (!isProductionBuild) {
    logger.warn(message, ...args);
  }
}
