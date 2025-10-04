import pino, { Logger as PinoLogger } from 'pino';

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

export interface Logger {
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): Logger;
}

/**
 * LoggerService - Enterprise logging con Pino
 *
 * Features:
 * - Structured JSON logging
 * - Environment-based log levels
 * - Edge/Browser/Server compatible
 * - Context propagation con child loggers
 * - Pretty printing en desarrollo
 */
class LoggerService implements Logger {
  private pinoInstance: PinoLogger | null = null;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    // Solo inicializar Pino en server/Node.js
    if (!this.isBrowser) {
      try {
        const isDevelopment = process.env.NODE_ENV !== 'production';

        this.pinoInstance = pino({
          level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

          // Pretty printing solo en desarrollo
          transport: isDevelopment ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
              singleLine: false,
            }
          } : undefined,

          // Formato base
          base: {
            env: process.env.NODE_ENV || 'development',
          },

          // Timestamp
          timestamp: pino.stdTimeFunctions.isoTime,
        });
      } catch (error) {
        // Fallback si Pino falla (ej. en edge runtime)
        this.pinoInstance = null;
      }
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.pinoInstance) {
      const [data, ...rest] = args;
      this.pinoInstance.error(data && typeof data === 'object' ? data : { args: rest }, message);
    } else {
      // Browser fallback
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.pinoInstance) {
      const [data, ...rest] = args;
      this.pinoInstance.warn(data && typeof data === 'object' ? data : { args: rest }, message);
    } else {
      // Browser fallback
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.pinoInstance) {
      const [data, ...rest] = args;
      this.pinoInstance.info(data && typeof data === 'object' ? data : { args: rest }, message);
    } else {
      // Browser fallback (solo en dev)
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[INFO] ${message}`, ...args);
      }
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.pinoInstance) {
      const [data, ...rest] = args;
      this.pinoInstance.debug(data && typeof data === 'object' ? data : { args: rest }, message);
    } else {
      // Browser fallback (solo en dev)
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    }
  }

  /**
   * Crear child logger con contexto adicional
   *
   * @example
   * const requestLogger = logger.child({ requestId: '123', userId: 'abc' });
   * requestLogger.info('Processing request'); // Incluirá requestId y userId
   */
  child(bindings: Record<string, unknown>): Logger {
    if (this.pinoInstance) {
      const childPino = this.pinoInstance.child(bindings);
      return new ChildLoggerService(childPino, this.isBrowser);
    }

    // Browser fallback - return self con prefix
    return this;
  }
}

/**
 * Child logger para contexto específico
 */
class ChildLoggerService implements Logger {
  constructor(
    private pinoInstance: PinoLogger,
    private isBrowser: boolean
  ) {}

  error(message: string, ...args: unknown[]): void {
    const [data, ...rest] = args;
    this.pinoInstance.error(data && typeof data === 'object' ? data : { args: rest }, message);
  }

  warn(message: string, ...args: unknown[]): void {
    const [data, ...rest] = args;
    this.pinoInstance.warn(data && typeof data === 'object' ? data : { args: rest }, message);
  }

  info(message: string, ...args: unknown[]): void {
    const [data, ...rest] = args;
    this.pinoInstance.info(data && typeof data === 'object' ? data : { args: rest }, message);
  }

  debug(message: string, ...args: unknown[]): void {
    const [data, ...rest] = args;
    this.pinoInstance.debug(data && typeof data === 'object' ? data : { args: rest }, message);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new ChildLoggerService(this.pinoInstance.child(bindings), this.isBrowser);
  }
}

/**
 * Logger singleton - Usar en toda la aplicación
 *
 * @example
 * import { logger } from '@autamedica/shared';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to process', { error, requestId });
 *
 * // Con contexto
 * const requestLogger = logger.child({ requestId: req.id });
 * requestLogger.info('Starting request');
 */
export const logger = new LoggerService();
