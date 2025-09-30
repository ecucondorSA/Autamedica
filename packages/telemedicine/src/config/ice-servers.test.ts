import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getIceServersConfig, validateIceServersConfig, getExampleIceServersConfig } from './ice-servers'

describe('ICE Servers Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getIceServersConfig', () => {
    it('should return default STUN servers when no env vars are set', () => {
      // Mock empty environment
      vi.stubGlobal('process', { env: {} })
      vi.stubGlobal('window', undefined)

      const servers = getIceServersConfig()

      expect(servers).toHaveLength(5) // 5 default Google STUN servers
      expect(servers[0].urls).toBe('stun:stun.l.google.com:19302')
      expect(servers.every(server =>
        typeof server.urls === 'string' && server.urls.startsWith('stun:')
      )).toBe(true)
    })

    it('should parse ICE servers from JSON env var', () => {
      const testServers = [
        { urls: 'stun:test.example.com:19302' },
        { urls: 'turn:turn.example.com:3478', username: 'test', credential: 'pass' }
      ]

      vi.stubGlobal('process', {
        env: {
          NEXT_PUBLIC_ICE_SERVERS: JSON.stringify(testServers)
        }
      })

      const servers = getIceServersConfig()

      expect(servers).toHaveLength(2)
      expect(servers[0].urls).toBe('stun:test.example.com:19302')
      expect(servers[1].urls).toBe('turn:turn.example.com:3478')
      expect(servers[1].username).toBe('test')
      expect(servers[1].credential).toBe('pass')
    })

    it('should handle malformed JSON gracefully', () => {
      vi.stubGlobal('process', {
        env: {
          NEXT_PUBLIC_ICE_SERVERS: 'invalid-json'
        }
      })

      // Should fall back to defaults without throwing
      const servers = getIceServersConfig()
      expect(servers).toHaveLength(5) // Default servers
    })

    it('should filter out invalid server configurations', () => {
      const testServers = [
        { urls: 'stun:valid.example.com:19302' },
        { invalid: 'server' }, // Missing urls
        { urls: 'http://invalid-protocol.com' }, // Invalid protocol
        { urls: 'turn:valid.example.com:3478', username: 'test' }
      ]

      vi.stubGlobal('process', {
        env: {
          NEXT_PUBLIC_ICE_SERVERS: JSON.stringify(testServers)
        }
      })

      const servers = getIceServersConfig()

      expect(servers).toHaveLength(2) // Only valid servers
      expect(servers[0].urls).toBe('stun:valid.example.com:19302')
      expect(servers[1].urls).toBe('turn:valid.example.com:3478')
    })

    it('should add TURN server from separate env vars', () => {
      vi.stubGlobal('process', {
        env: {
          TURN_SERVER_URL: 'turn:turn.example.com:3478',
          TURN_USERNAME: 'testuser',
          TURN_PASSWORD: 'testpass'
        }
      })

      const servers = getIceServersConfig()

      // Should have TURN server first (priority), then default STUN servers
      expect(servers[0].urls).toBe('turn:turn.example.com:3478')
      expect(servers[0].username).toBe('testuser')
      expect(servers[0].credential).toBe('testpass')
      expect(servers.length).toBeGreaterThan(5) // TURN + default STUNs
    })
  })

  describe('validateIceServersConfig', () => {
    it('should return false for empty or invalid arrays', () => {
      expect(validateIceServersConfig([])).toBe(false)
      expect(validateIceServersConfig(null as any)).toBe(false)
      expect(validateIceServersConfig(undefined as any)).toBe(false)
    })

    it('should return true for valid configuration', () => {
      const servers = [
        { urls: 'stun:stun.example.com:19302' },
        { urls: 'turn:turn.example.com:3478', username: 'test', credential: 'pass' }
      ]

      expect(validateIceServersConfig(servers)).toBe(true)
    })

    it('should warn about missing STUN servers', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const servers = [
        { urls: 'turn:turn.example.com:3478', username: 'test', credential: 'pass' }
      ]

      validateIceServersConfig(servers)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No STUN servers configured')
      )

      consoleSpy.mockRestore()
    })

    it('should warn about missing TURN servers', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const servers = [
        { urls: 'stun:stun.example.com:19302' }
      ]

      validateIceServersConfig(servers)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No TURN servers configured')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getExampleIceServersConfig', () => {
    it('should return valid JSON string', () => {
      const example = getExampleIceServersConfig()

      expect(() => JSON.parse(example)).not.toThrow()

      const parsed = JSON.parse(example)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBeGreaterThan(0)
      expect(parsed[0].urls).toBeDefined()
    })

    it('should include both STUN and TURN examples', () => {
      const example = getExampleIceServersConfig()
      const parsed = JSON.parse(example)

      const hasStun = parsed.some((server: any) => {
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
        return urls.some((url: string) => typeof url === 'string' && url.startsWith('stun:'))
      })
      const hasTurn = parsed.some((server: any) => {
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls]
        return urls.some((url: string) => typeof url === 'string' && url.startsWith('turn:'))
      })

      expect(hasStun).toBe(true)
      expect(hasTurn).toBe(true)
    })
  })
})