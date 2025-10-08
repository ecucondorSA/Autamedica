import { logger as sharedLogger } from '@autamedica/shared';

const logger = sharedLogger.child({ scope: 'auth' });

export default logger;
