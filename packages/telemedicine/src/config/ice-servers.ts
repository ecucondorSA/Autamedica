/**
 * ICE Servers Configuration
 * Handles STUN/TURN server configuration from environment variables
 */

export interface IceServerConfig extends RTCIceServer {
  urls: string | string[]
  username?: string
  credential?: string
  credentialType?: 'password' | 'oauth'
}

// Default public STUN servers (fallback)
const DEFAULT_ICE_SERVERS: IceServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
]

/**
 * Parse ICE servers from JSON string
 */
function parseIceServersFromJson(jsonString: string): IceServerConfig[] {
  try {
    const parsed = JSON.parse(jsonString)

    if (!Array.isArray(parsed)) {
      console.warn('[ICE Config] NEXT_PUBLIC_ICE_SERVERS must be a JSON array')
      return DEFAULT_ICE_SERVERS
    }

    // Validate each server configuration
    const validServers = parsed.filter((server: any) => {
      if (!server || typeof server !== 'object') return false
      if (!server.urls) return false

      // Validate URLs format
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
      const validUrls = urls.every((url: any) =>
        typeof url === 'string' && (url.startsWith('stun:') || url.startsWith('turn:'))
      )

      return validUrls
    })

    if (validServers.length === 0) {
      console.warn('[ICE Config] No valid ICE servers found in configuration')
      return DEFAULT_ICE_SERVERS
    }

    console.log(`[ICE Config] Loaded ${validServers.length} ICE servers from configuration`)
    return validServers

  } catch (error) {
    console.error('[ICE Config] Failed to parse NEXT_PUBLIC_ICE_SERVERS JSON:', error)
    return DEFAULT_ICE_SERVERS
  }
}

/**
 * Generate time-based TURN credentials (if TURN_SECRET is available)
 */
function generateTurnCredentials(): { username: string; credential: string } | null {
  const turnSecret = typeof window !== 'undefined'
    ? (window as any).ENV?.TURN_SECRET
    : process.env.TURN_SECRET

  const turnRealm = typeof window !== 'undefined'
    ? (window as any).ENV?.TURN_REALM
    : process.env.TURN_REALM

  if (!turnSecret) return null

  // Generate time-based credentials (valid for 12 hours)
  const timestamp = Math.floor(Date.now() / 1000) + (12 * 60 * 60)
  const username = `${timestamp}:autamedica-user`

  // Create HMAC-SHA1 credential
  const credential = btoa(username + ':' + turnSecret)

  return { username, credential }
}

/**
 * Create TURN server configuration with authentication
 */
function createTurnServer(): IceServerConfig | null {
  const turnUrl = typeof window !== 'undefined'
    ? (window as any).ENV?.TURN_SERVER_URL
    : process.env.TURN_SERVER_URL

  if (!turnUrl) return null

  const staticUsername = typeof window !== 'undefined'
    ? (window as any).ENV?.TURN_USERNAME
    : process.env.TURN_USERNAME

  const staticPassword = typeof window !== 'undefined'
    ? (window as any).ENV?.TURN_PASSWORD
    : process.env.TURN_PASSWORD

  // Use static credentials if available
  if (staticUsername && staticPassword) {
    return {
      urls: turnUrl,
      username: staticUsername,
      credential: staticPassword,
      credentialType: 'password'
    }
  }

  // Otherwise try to generate time-based credentials
  const dynamicCreds = generateTurnCredentials()
  if (dynamicCreds) {
    return {
      urls: turnUrl,
      username: dynamicCreds.username,
      credential: dynamicCreds.credential,
      credentialType: 'password'
    }
  }

  // Return unauthenticated TURN server (might not work behind NAT)
  console.warn('[ICE Config] TURN server configured without credentials')
  return { urls: turnUrl }
}

/**
 * Get ICE servers configuration from environment
 */
export function getIceServersConfig(): IceServerConfig[] {
  // First, try to load from NEXT_PUBLIC_ICE_SERVERS JSON
  const iceServersJson = typeof window !== 'undefined'
    ? (window as any).ENV?.NEXT_PUBLIC_ICE_SERVERS
    : process.env.NEXT_PUBLIC_ICE_SERVERS

  let servers: IceServerConfig[] = []

  if (iceServersJson) {
    servers = parseIceServersFromJson(iceServersJson)
  } else {
    // Fallback to individual STUN server configuration
    const stunServer = typeof window !== 'undefined'
      ? (window as any).ENV?.NEXT_PUBLIC_STUN_SERVER
      : process.env.NEXT_PUBLIC_STUN_SERVER

    if (stunServer) {
      servers = [{ urls: stunServer }]
    } else {
      servers = [...DEFAULT_ICE_SERVERS]
    }
  }

  // Add TURN server if configured
  const turnServer = createTurnServer()
  if (turnServer) {
    servers.unshift(turnServer) // TURN servers should be tried first
    console.log('[ICE Config] Added TURN server to ICE configuration')
  }

  console.log('[ICE Config] ICE servers configuration:', servers.map(s => ({ urls: s.urls })))
  return servers
}

/**
 * Validate ICE servers configuration
 */
export function validateIceServersConfig(servers: IceServerConfig[]): boolean {
  if (!Array.isArray(servers) || servers.length === 0) {
    console.error('[ICE Config] No ICE servers configured')
    return false
  }

  const hasStun = servers.some(server => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
    return urls.some(url => url.startsWith('stun:'))
  })

  if (!hasStun) {
    console.warn('[ICE Config] No STUN servers configured - connections might fail behind NAT')
  }

  const hasTurn = servers.some(server => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
    return urls.some(url => url.startsWith('turn:'))
  })

  if (!hasTurn) {
    console.warn('[ICE Config] No TURN servers configured - connections might fail behind symmetric NAT')
  }

  return true
}

/**
 * Get example ICE servers configuration for documentation
 */
export function getExampleIceServersConfig(): string {
  const example = [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: ['turn:turn.autamedica.com:3478', 'turns:turn.autamedica.com:5349'],
      username: 'u-1695920000',
      credential: 'temp-credential-abc123',
      credentialType: 'password'
    }
  ]

  return JSON.stringify(example, null, 2)
}