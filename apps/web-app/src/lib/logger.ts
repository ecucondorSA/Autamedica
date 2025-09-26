const runtimeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV ?? 'development';
const isProductionBuild = runtimeEnv === 'production';

export function logDebug(...args: unknown[]): void {
  if (!isProductionBuild) {
    console.log(...args);
  }
}

export function logInfo(...args: unknown[]): void {
  if (!isProductionBuild) {
    console.info(...args);
  }
}

export function logWarn(...args: unknown[]): void {
  if (!isProductionBuild) {
    console.warn(...args);
  }
}
