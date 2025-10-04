import {
  getClientEnvOrDefault,
  getOptionalClientEnv,
  getServerEnvOrDefault,
} from '@autamedica/shared'

/** Lee ICE desde env (cliente o server) */
export function loadIceServers(): RTCIceServer[] {
  const raw =
    getOptionalClientEnv('NEXT_PUBLIC_ICE_SERVERS') ??
    getServerEnvOrDefault('ICE_SERVERS_JSON', '[]')
  try { return JSON.parse(raw) } catch { return [] }
}

/** STUN-only por defecto (para desarrollo) */
export const ICE_STUN_ONLY: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
]

/**
 * STUN+TURN production-ready configuration
 * Usa variables de entorno para credenciales TURN
 */
export function getProductionICEServers(): RTCIceServer[] {
  const iceServers: RTCIceServer[] = [...ICE_STUN_ONLY]

  // TURN servers desde environment variables
  const turnUrls = process.env.NEXT_PUBLIC_TURN_URLS
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME
  const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL

  if (turnUrls && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrls.split(','),
      username: turnUsername,
      credential: turnCredential,
    })
  } else {
    // Fallback a servidores TURN públicos temporales (solo desarrollo)
    logger.warn('⚠️ No TURN servers configured. Using public fallback (not recommended for production)')
    iceServers.push({
      urls: ['turns:global.relay.metered.ca:443?transport=tcp'],
      username: 'demo',
      credential: 'demo',
    })
  }

  return iceServers
}

/**
 * TURN servers recomendados para producción
 * Configurar con Twilio, Cloudflare Calls, o servidor propio
 *
 * Ejemplo con Twilio:
 * NEXT_PUBLIC_TURN_URLS=turn:global.turn.twilio.com:3478?transport=udp,turn:global.turn.twilio.com:3478?transport=tcp,turn:global.turn.twilio.com:443?transport=tcp
 * NEXT_PUBLIC_TURN_USERNAME=<twilio-sid>
 * NEXT_PUBLIC_TURN_CREDENTIAL=<twilio-credential>
 *
 * Ejemplo con servidor propio (coturn):
 * NEXT_PUBLIC_TURN_URLS=turn:turn.autamedica.com:3478,turns:turn.autamedica.com:5349
 * NEXT_PUBLIC_TURN_USERNAME=autamedica
 * NEXT_PUBLIC_TURN_CREDENTIAL=<secure-credential>
 */
export const ICE_WITH_TURN: RTCIceServer[] = getProductionICEServers()

/** Señalización URL desde env */
export function loadSignalingUrl(): string {
  return getClientEnvOrDefault(
    'NEXT_PUBLIC_SIGNALING_URL',
    'wss://autamedica-signaling-server.ecucondor.workers.dev/connect'
  )
}