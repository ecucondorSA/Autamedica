import { z } from 'zod'

const envSchema = z.object({
  SIGNALING_PORT: z
    .string()
    .default('8888')
    .transform((value) => {
      const port = Number.parseInt(value, 10)
      if (!Number.isFinite(port) || port <= 0) {
        throw new Error('SIGNALING_PORT debe ser un entero positivo')
      }
      return port
    }),
  SIGNALING_HOST: z.string().default('0.0.0.0'),
  SIGNALING_PATH: z.string().default('/signal'),
  SIGNALING_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

function parseEnv() {
  const result = envSchema.safeParse({
    SIGNALING_PORT: process.env.SIGNALING_PORT,
    SIGNALING_HOST: process.env.SIGNALING_HOST,
    SIGNALING_PATH: process.env.SIGNALING_PATH,
    SIGNALING_LOG_LEVEL: process.env.SIGNALING_LOG_LEVEL,
  })

  if (!result.success) {
    console.error('[signaling] Error cargando variables de entorno', result.error.flatten().fieldErrors)
    process.exit(1)
  }

  return result.data
}

export const env = parseEnv()
