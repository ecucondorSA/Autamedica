import { env } from './env.js'
import { logger } from './logger.js'
import { SignalingServer } from './signaling-server.js'

const server = new SignalingServer()

server.listen()

async function shutdown(signal) {
  logger.info(`${signal} received - shutting down`)
  try {
    await server.stop()
  } catch (error) {
    logger.error('shutdown error', { error: error instanceof Error ? error.message : String(error) })
  }
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

logger.info('signaling-server started', {
  port: env.SIGNALING_PORT,
  host: env.SIGNALING_HOST,
  path: env.SIGNALING_PATH,
})
