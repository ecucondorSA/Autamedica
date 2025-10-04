export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};
class LoggerService {
    error(message, ...args) {
        logger.error(`[ERROR] ${message}`, ...args);
    }
    warn(message, ...args) {
        logger.warn(`[WARN] ${message}`, ...args);
    }
    info(message, ...args) {
        logger.info(`[INFO] ${message}`, ...args);
    }
    debug(message, ...args) {
        logger.debug(`[DEBUG] ${message}`, ...args);
    }
}
export const logger = new LoggerService();
