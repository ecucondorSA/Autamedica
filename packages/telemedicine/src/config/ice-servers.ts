import {
  getClientEnvOrDefault,
  getOptionalClientEnv,
  getServerEnvOrDefault,
  logger,
  isProduction,
} from '@autamedica/shared'

type EnvRecord = Record<string, string | undefined>

const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
]

const TURN_PROTOCOL_PATTERN = /^turns?:/i
const STUN_PROTOCOL_PATTERN = /^stun:/i

function getProcessEnv(): EnvRecord {
  return (typeof process !== 'undefined' && process?.env) || {}
}

function ensureArray(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value]
  }
  return null
}

function normalizeIceServer(input: unknown): RTCIceServer | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<RTCIceServer>
  const urls = ensureArray(candidate.urls)
  if (!urls?.length) {
    return null
  }

  const filteredUrls = urls.filter(url => STUN_PROTOCOL_PATTERN.test(url) || TURN_PROTOCOL_PATTERN.test(url))
  if (!filteredUrls.length) {
    return null
  }

  const normalized: RTCIceServer = {
    urls: filteredUrls.length === 1 ? filteredUrls[0] : filteredUrls,
  }

  if (candidate.username) {
    normalized.username = String(candidate.username)
  }
  if (candidate.credential) {
    normalized.credential = String(candidate.credential)
  }

  return normalized
}

function parseIceServers(raw: string | undefined): RTCIceServer[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map(normalizeIceServer).filter((server): server is RTCIceServer => Boolean(server))
  } catch {
    return []
  }
}

function getTurnServerFromEnv(env: EnvRecord): RTCIceServer | null {
  const urlsRaw = env.TURN_SERVER_URL ?? env.NEXT_PUBLIC_TURN_URL ?? env.NEXT_PUBLIC_TURN_URLS
  const username = env.TURN_USERNAME ?? env.NEXT_PUBLIC_TURN_USERNAME
  const credential = env.TURN_PASSWORD ?? env.NEXT_PUBLIC_TURN_CREDENTIAL

  if (!urlsRaw || !username || !credential) {
    return null
  }

  const urls = urlsRaw
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0)

  if (!urls.length) {
    return null
  }

  return {
    urls: urls.length === 1 ? urls[0] : urls,
    username,
    credential,
  }
}

/**
 * Obtiene la configuración final de ICE servers combinando defaults y overrides
 */
export function getIceServersConfig(): RTCIceServer[] {
  const env = getProcessEnv()
  const fromClientEnv = getOptionalClientEnv('NEXT_PUBLIC_ICE_SERVERS')
  const fromServerEnv = getServerEnvOrDefault('ICE_SERVERS_JSON', '[]')

  const parsed = parseIceServers(fromClientEnv ?? fromServerEnv)
  const turn = getTurnServerFromEnv(env)

  const servers: RTCIceServer[] = []
  if (turn) {
    servers.push(turn)
  }
  servers.push(...parsed)

  const hasStun = servers.some(server => {
    const urls = ensureArray(server.urls)
    return urls?.some(url => STUN_PROTOCOL_PATTERN.test(url)) ?? false
  })

  if (!hasStun) {
    servers.push(...DEFAULT_STUN_SERVERS)
  }

  return servers
}

/** Lee ICE desde env (cliente o server) */
export function loadIceServers(): RTCIceServer[] {
  return getIceServersConfig()
}

/** STUN-only por defecto (para desarrollo) */
export const ICE_STUN_ONLY: RTCIceServer[] = [...DEFAULT_STUN_SERVERS]

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
    if (isProduction()) {
      logger.warn('⚠️ No TURN servers configured. Using public fallback (not recommended for production)')
    }
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

/**
 * Valida la configuración de ICE servers y avisa si faltan STUN/TURN
 */
export function validateIceServersConfig(servers: unknown): servers is RTCIceServer[] {
  if (!Array.isArray(servers) || servers.length === 0) {
    return false
  }

  let hasStun = false
  let hasTurn = false

  for (const server of servers) {
    if (!server || typeof server !== 'object') {
      return false
    }

    const urls = ensureArray((server as RTCIceServer).urls)
    if (!urls?.length) {
      return false
    }

    if (urls.some(url => STUN_PROTOCOL_PATTERN.test(url))) {
      hasStun = true
    }
    if (urls.some(url => TURN_PROTOCOL_PATTERN.test(url))) {
      hasTurn = true
    }
  }

  if (!hasStun) {
    console.warn('No STUN servers configured. Peer-to-peer calls may fail without STUN support.')
  }
  if (!hasTurn) {
    console.warn('No TURN servers configured. Users behind restrictive networks may fail to connect.')
  }

  return true
}

/**
 * Devuelve un ejemplo JSON listo para usar en la UI de configuración
 */
export function getExampleIceServersConfig(): string {
  return JSON.stringify(
    [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
        ],
      },
      {
        urls: [
          'turn:turn.autamedica.com:3478?transport=udp',
          'turns:turn.autamedica.com:5349?transport=tcp',
        ],
        username: 'your-turn-username',
        credential: 'your-turn-password',
      },
    ],
    null,
    2
  )
}

/** Señalización URL desde env */
export function loadSignalingUrl(): string {
  return getClientEnvOrDefault(
    'NEXT_PUBLIC_SIGNALING_URL',
    'wss://autamedica-signaling-server.ecucondor.workers.dev/connect'
  )
}