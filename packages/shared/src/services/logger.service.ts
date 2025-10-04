import consola, { type ConsolaInstance } from 'consola';

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

type LogLevelValue = LogLevel[keyof LogLevel];

const LOG_LEVEL_ORDER: readonly LogLevelValue[] = [
  LOG_LEVELS.ERROR,
  LOG_LEVELS.WARN,
  LOG_LEVELS.INFO,
  LOG_LEVELS.DEBUG,
];

const processRef: typeof process | undefined =
  typeof process !== 'undefined' ? process : undefined;

const envLogLevel = processRef?.env?.LOG_LEVEL;
const nodeEnv = processRef?.env?.NODE_ENV ?? 'development';

function resolveLogLevel(): LogLevelValue {
  const normalizedEnv = envLogLevel?.toLowerCase();
  if (normalizedEnv) {
    const match = LOG_LEVEL_ORDER.find((level) => level === normalizedEnv);
    if (match) {
      return match;
    }
  }

  return nodeEnv === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
}

const DEFAULT_LOG_LEVEL = resolveLogLevel();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface Logger {
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): Logger;
}

class LoggerService implements Logger {
  private readonly minLevel: LogLevelValue;
  private readonly thresholdIndex: number;

  constructor(
    private readonly instance: ConsolaInstance,
    private readonly context: Record<string, unknown> = {},
    logLevel: LogLevelValue = DEFAULT_LOG_LEVEL,
  ) {
    const normalizedLevel = LOG_LEVEL_ORDER.includes(logLevel)
      ? logLevel
      : DEFAULT_LOG_LEVEL;

    this.minLevel = normalizedLevel;
    this.thresholdIndex = LOG_LEVEL_ORDER.indexOf(normalizedLevel);
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.ERROR, message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.WARN, message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.INFO, message, args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LOG_LEVELS.DEBUG, message, args);
  }

  child(bindings: Record<string, unknown>): Logger {
    const nextContext = { ...this.context, ...bindings };
    return new LoggerService(this.instance, nextContext, this.minLevel);
  }

  private log(level: LogLevelValue, message: string, args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const parts = this.prepareParts(message, args);

    switch (level) {
      case LOG_LEVELS.ERROR:
        this.instance.error(...parts);
        break;
      case LOG_LEVELS.WARN:
        this.instance.warn(...parts);
        break;
      case LOG_LEVELS.DEBUG:
        this.instance.debug(...parts);
        break;
      default:
        this.instance.info(...parts);
        break;
    }
  }

  private shouldLog(level: LogLevelValue): boolean {
    return LOG_LEVEL_ORDER.indexOf(level) <= this.thresholdIndex;
  }

  private prepareParts(message: string, args: unknown[]): [string, ...unknown[]] {
    const parts: unknown[] = [message];

    const [firstArg, ...restArgs] = args;
    let payload: Record<string, unknown> | null = null;
    const extraArgs: unknown[] = [];

    if (isPlainObject(firstArg)) {
      payload = { ...firstArg };
      extraArgs.push(...restArgs);
    } else {
      if (typeof firstArg !== 'undefined') {
        extraArgs.push(firstArg);
      }
      extraArgs.push(...restArgs);
    }

    if (Object.keys(this.context).length > 0) {
      payload = { ...(payload ?? {}), context: { ...this.context } };
    }

    if (payload) {
      parts.push(payload);
    }

    if (extraArgs.length > 0) {
      parts.push(...extraArgs);
    }

    return parts as [string, ...unknown[]];
  }
}

/**
 * Logger singleton para toda la plataforma AutaMedica.
 *
 * Ejemplo de uso:
 * ```ts
 * import { logger } from '@autamedica/shared';
 *
 * logger.info('User logged in', { userId: '123' });
 * const requestLogger = logger.child({ requestId: 'abc' });
 * requestLogger.debug('Processing request');
 * ```
 */
export const logger = new LoggerService(consola);
