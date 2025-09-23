import { env } from './env.js'
import { logger } from './logger.js'
import { SignalingServer } from './signaling-server.js'

const server = new SignalingServer()

server.listen()

process.on('SIGINT', async () => {
  logger.info('signal:SIGINT - shutting down')
  await server.stop().catch((error) => logger.error('shutdown:error', { error }))
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('signal:SIGTERM - shutting down')
  await server.stop().catch((error) => logger.error('shutdown:error', { error }))
  process.exit(0)
})

logger.info('signaling-server started', {
  port: env.SIGNALING_PORT,
  host: env.SIGNALING_HOST,
  path: env.SIGNALING_PATH,
})
