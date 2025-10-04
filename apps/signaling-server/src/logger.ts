/**
 * Simple logger utility
 */

export const logger = {
  info: (...args: any[]) => {
    logger.info('[INFO]', new Date().toISOString(), ...args);
  },

  warn: (...args: any[]) => {
    logger.warn('[WARN]', new Date().toISOString(), ...args);
  },

  error: (...args: any[]) => {
    logger.error('[ERROR]', new Date().toISOString(), ...args);
  },

  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[DEBUG]', new Date().toISOString(), ...args);
    }
  },
};
