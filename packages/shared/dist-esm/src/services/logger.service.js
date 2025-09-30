export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};
class LoggerService {
    error(message, ...args) {
        console.error(`[ERROR] ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`[WARN] ${message}`, ...args);
    }
    info(message, ...args) {
        console.info(`[INFO] ${message}`, ...args);
    }
    debug(message, ...args) {
        console.debug(`[DEBUG] ${message}`, ...args);
    }
}
export const logger = new LoggerService();
