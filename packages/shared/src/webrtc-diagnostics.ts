interface MediaDiagnostics {
  devices: MediaDeviceInfo[]
  permissions: {
    camera: PermissionState
    microphone: PermissionState
  }
  capabilities: {
    video: MediaTrackCapabilities | null
    audio: MediaTrackCapabilities | null
  }
}

interface RetryConfig {
  maxRetries: number
  backoffMs: number
  fallbackConstraints: MediaStreamConstraints[]
}

export class WebRTCDiagnostics {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    fallbackConstraints: [
      // Ideal constraints
      {
        video: { width: {ideal: 1280}, height: {ideal: 720}, frameRate: {ideal: 30} },
        audio: { echoCancellation: true, noiseSuppression: true }
      },
      // Fallback constraints
      {
        video: { width: {max: 640}, height: {max: 480} },
        audio: true
      },
      // Minimal constraints
      {
        video: true,
        audio: false
      }
    ]
  }

  static async diagnose(): Promise<MediaDiagnostics> {
    console.log('🔍 Starting WebRTC diagnostics...')

    // Check devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.log('📱 Available devices:', devices.map(d => ({
      kind: d.kind,
      label: d.label || 'Unknown device',
      deviceId: d.deviceId.substring(0, 8) + '...'
    })))

    // Check permissions
    const permissions = {
      camera: await this.checkPermission('camera'),
      microphone: await this.checkPermission('microphone')
    }
    console.log('🔐 Permissions:', permissions)

    return {
      devices,
      permissions,
      capabilities: {
        video: null,
        audio: null
      }
    }
  }

  static async getUserMediaWithRetry(
    config: Partial<RetryConfig> = {}
  ): Promise<MediaStream> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config }
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
      const constraints = retryConfig.fallbackConstraints[attempt] ||
                         retryConfig.fallbackConstraints[retryConfig.fallbackConstraints.length - 1]

      console.log(`📹 Attempt ${attempt + 1}/${retryConfig.maxRetries}:`, constraints)

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('✅ Stream acquired successfully:', {
          video: stream.getVideoTracks().length > 0,
          audio: stream.getAudioTracks().length > 0
        })
        return stream
      } catch (error) {
        lastError = error as Error
        console.warn(`❌ Attempt ${attempt + 1} failed:`, {
          name: lastError.name,
          message: lastError.message,
          constraints
        })

        // Handle specific errors
        if (lastError.name === 'NotReadableError') {
          console.log('🔧 Camera in use by another application. Trying fallback...')
        } else if (lastError.name === 'NotAllowedError') {
          console.log('🚫 Permission denied. Check browser permissions.')
          throw lastError // Don't retry permission errors
        }

        // Wait before retry (except last attempt)
        if (attempt < retryConfig.maxRetries - 1) {
          await this.delay(retryConfig.backoffMs * (attempt + 1))
        }
      }
    }

    throw new Error(`Failed to get user media after ${retryConfig.maxRetries} attempts. Last error: ${lastError?.message}`)
  }

  static async checkPermission(name: PermissionName): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name })
      return result.state
    } catch {
      return 'prompt'
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static setupICEConnectionMonitoring(pc: RTCPeerConnection): void {
    pc.addEventListener('iceconnectionstatechange', () => {
      console.log('🧊 ICE Connection State:', pc.iceConnectionState)

      if (pc.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed. Check STUN/TURN servers.')
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('⚠️ ICE connection disconnected. Attempting to reconnect...')
      }
    })

    pc.addEventListener('connectionstatechange', () => {
      console.log('🔗 Connection State:', pc.connectionState)
    })

    pc.addEventListener('icegatheringstatechange', () => {
      console.log('📡 ICE Gathering State:', pc.iceGatheringState)
    })
  }
}

// Configuración STUN/TURN recomendada
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  // Agregar TURN server propio si es necesario:
  // {
  //   urls: ['turn:turn.autamedica.com:3478'],
  //   username: 'autamedica',
  //   credential: 'tu-credential-turn'
  // }
]