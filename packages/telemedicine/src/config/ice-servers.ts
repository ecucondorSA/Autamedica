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

/** STUN-only por defecto */
export const ICE_STUN_ONLY: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
]

/** STUN+TURN temporal (TCP:443) */
export const ICE_WITH_TURN: RTCIceServer[] = [
  ...ICE_STUN_ONLY,
  {
    urls: ['turns:global.relay.metered.ca:443?transport=tcp'],
    username: 'demo',
    credential: 'demo',
  },
]

/** Señalización URL desde env */
export function loadSignalingUrl(): string {
  return getClientEnvOrDefault(
    'NEXT_PUBLIC_SIGNALING_URL',
    'wss://autamedica-signaling-server.ecucondor.workers.dev/connect'
  )
}