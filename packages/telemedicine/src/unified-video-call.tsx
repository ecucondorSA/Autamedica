'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { JSX } from 'react'
import { WebRTCClient, type ConnectionState, type MediaConstraints } from './webrtc-client'
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Users,
  ScreenShare, ScreenShareOff, Loader2, Camera
} from 'lucide-react'

export interface UnifiedVideoCallProps {
  roomId: string
  userId: string
  userType: 'doctor' | 'patient' | 'nurse'
  userName?: string
  onCallEnd?: () => void
  onCallStart?: () => void
  className?: string
  theme?: 'doctor' | 'patient'
}

interface RemoteUser {
  userId: string
  userType: string
  userName?: string
  stream?: MediaStream
}

export function UnifiedVideoCall({
  roomId,
  userId,
  userType,
  userName,
  onCallEnd,
  onCallStart,
  className = '',
  theme = userType === 'doctor' ? 'doctor' : 'patient'
}: UnifiedVideoCallProps): JSX.Element {
  // WebRTC client state
  const [client, setClient] = useState<WebRTCClient | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map())
  const [callError, setCallError] = useState<string | null>(null)

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const screenShareRef = useRef<HTMLVideoElement>(null)

  // Screen sharing state
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)

  // Theme colors
  const themeColors = {
    doctor: {
      primary: 'bg-[#ee58a6] hover:bg-[#d44a92]',
      accent: 'text-[#ee58a6]',
      surface: 'bg-[#101d32]',
      connected: 'bg-emerald-500'
    },
    patient: {
      primary: 'bg-[#4fd1c5] hover:bg-[#2c7a7b]',
      accent: 'text-[#4fd1c5]',
      surface: 'bg-[#161b22]',
      connected: 'bg-[#4fd1c5]'
    }
  }

  const colors = themeColors[theme]

  // Initialize WebRTC client
  useEffect(() => {
    logger.info(`[UnifiedVideoCall] Initializing for ${userType}: ${userId} in room ${roomId}`)

    const webrtcClient = new WebRTCClient({
      userId,
      userType,
      roomId
    })

    // Set up event listeners
    webrtcClient.on('connection-state', (state) => {
      logger.info(`[UnifiedVideoCall] Connection state changed:`, state)
      setConnectionState(state)
      if (state === 'failed') {
        setCallError('Error de conexión. Verifica tu internet.')
      } else if (state === 'connected') {
        setCallError(null)
        onCallStart?.()
      }
    })

    webrtcClient.on('local-stream', (stream) => {
      logger.info(`[UnifiedVideoCall] Got local stream`)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    })

    webrtcClient.on('remote-stream', (stream, remoteUserId) => {
      logger.info(`[UnifiedVideoCall] Got remote stream from:`, remoteUserId)

      setRemoteUsers(prev => {
        const updated = new Map(prev)
        const existingUser = updated.get(remoteUserId) || {
          userId: remoteUserId,
          userType: 'unknown',
          userName: remoteUserId
        }
        updated.set(remoteUserId, { ...existingUser, stream })
        return updated
      })

      // Set video element source
      setTimeout(() => {
        const videoElement = remoteVideosRef.current.get(remoteUserId)
        if (videoElement && videoElement.srcObject !== stream) {
          videoElement.srcObject = stream
        }
      }, 100)
    })

    webrtcClient.on('user-joined', (remoteUserId, remoteUserType) => {
      logger.info(`[UnifiedVideoCall] User joined:`, remoteUserId, remoteUserType)
      setRemoteUsers(prev => {
        const updated = new Map(prev)
        const existingUser = updated.get(remoteUserId)
        updated.set(remoteUserId, {
          userId: remoteUserId,
          userType: remoteUserType,
          userName: remoteUserId,
          stream: existingUser?.stream
        })
        return updated
      })
    })

    webrtcClient.on('user-left', (remoteUserId) => {
      logger.info(`[UnifiedVideoCall] User left:`, remoteUserId)
      setRemoteUsers(prev => {
        const updated = new Map(prev)
        updated.delete(remoteUserId)
        return updated
      })
      remoteVideosRef.current.delete(remoteUserId)
    })

    webrtcClient.on('error', (error) => {
      logger.error(`[UnifiedVideoCall] WebRTC error:`, error)
      setCallError(`Error de videollamada: ${error.message}`)
    })

    setClient(webrtcClient)

    return () => {
      logger.info(`[UnifiedVideoCall] Cleaning up`)
      webrtcClient.disconnect()
    }
  }, [userId, userType, roomId])

  // Start call
  const startCall = useCallback(async () => {
    if (!client || connectionState === 'connected') return

    try {
      logger.info(`[UnifiedVideoCall] Starting call...`)
      setCallError(null)

      await client.connect(roomId)

      // Start local stream
      const constraints: MediaConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      }

      await client.startLocalStream(constraints)
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)

    } catch (error) {
      logger.error(`[UnifiedVideoCall] Failed to start call:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setCallError(`No se pudo iniciar la videollamada: ${errorMessage}`)
    }
  }, [client, roomId, connectionState])

  // End call
  const endCall = useCallback(async () => {
    if (!client) return

    try {
      logger.info(`[UnifiedVideoCall] Ending call...`)
      await client.disconnect()

      // Stop screen sharing if active
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
        setIsScreenSharing(false)
      }

      onCallEnd?.()
    } catch (error) {
      logger.error(`[UnifiedVideoCall] Failed to end call:`, error)
    }
  }, [client, screenStream, onCallEnd])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!client) return

    const newState = client.toggleVideo()
    setIsVideoEnabled(newState)
    logger.info(`[UnifiedVideoCall] Video ${newState ? 'enabled' : 'disabled'}`)
  }, [client])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!client) return

    const newState = client.toggleAudio()
    setIsAudioEnabled(newState)
    logger.info(`[UnifiedVideoCall] Audio ${newState ? 'enabled' : 'disabled'}`)
  }, [client])

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
        setIsScreenSharing(false)
      }
      return
    }

    // Start screen sharing
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      setScreenStream(stream)
      setIsScreenSharing(true)

      // Handle when user stops screen sharing via browser
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          setScreenStream(null)
          setIsScreenSharing(false)
        }
      }

    } catch (error) {
      logger.warn(`[UnifiedVideoCall] Screen sharing cancelled:`, error)
      setIsScreenSharing(false)
    }
  }, [isScreenSharing, screenStream])

  // Update video element refs when remote users change
  useEffect(() => {
    remoteUsers.forEach((user, userId) => {
      if (user.stream) {
        const videoElement = remoteVideosRef.current.get(userId)
        if (videoElement && videoElement.srcObject !== user.stream) {
          videoElement.srcObject = user.stream
        }
      }
    })
  }, [remoteUsers])

  // Update screen share video element
  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream
    }
  }, [screenStream])

  const totalParticipants = remoteUsers.size + 1

  return (
    <div className={`h-full flex flex-col ${colors.surface} text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800/90 border-b border-gray-700/60">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionState === 'connected' ? colors.connected :
              connectionState === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionState === 'connected' ? 'Conectado' :
               connectionState === 'connecting' ? 'Conectando...' :
               connectionState === 'failed' ? 'Error de conexión' :
               'Desconectado'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{totalParticipants} {totalParticipants === 1 ? 'participante' : 'participantes'}</span>
          </div>
          {userName && (
            <div className="text-sm text-gray-400">
              {userName} ({userType === 'doctor' ? 'Doctor' : 'Paciente'})
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400">
          Sala: {roomId}
        </div>
      </div>

      {/* Error Banner */}
      {callError && (
        <div className="bg-red-600/90 border-b border-red-500/60 px-4 py-2">
          <p className="text-sm text-white">{callError}</p>
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 p-4 relative">
        <div className={`h-full grid gap-4 ${
          remoteUsers.size === 0 ? 'grid-cols-1' :
          remoteUsers.size === 1 ? 'grid-cols-2' :
          remoteUsers.size <= 3 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-2 grid-rows-3'
        }`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {connectionState === 'connected' ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoEnabled ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                {connectionState === 'connecting' ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white/60" />
                    <p className="text-sm text-white/60">Conectando...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-white/40" />
                    <p className="text-sm text-white/60">Tu video aparecerá aquí</p>
                  </div>
                )}
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm backdrop-blur-sm">
              Tú ({userType === 'doctor' ? 'Doctor' : 'Paciente'})
              {!isAudioEnabled && <MicOff className="inline w-4 h-4 ml-1 text-red-400" />}
            </div>
          </div>

          {/* Remote Videos */}
          {Array.from(remoteUsers.entries()).map(([remoteUserId, user]) => (
            <div key={remoteUserId} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideosRef.current.set(remoteUserId, el)
                    if (user.stream) {
                      el.srcObject = user.stream
                    }
                  } else {
                    remoteVideosRef.current.delete(remoteUserId)
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm backdrop-blur-sm">
                {user.userName || user.userId} ({user.userType === 'doctor' ? 'Doctor' : 'Paciente'})
              </div>
            </div>
          ))}

          {/* Empty slots when no remote users */}
          {remoteUsers.size === 0 && connectionState === 'connected' && (
            <div className="bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p>Esperando a otros participantes...</p>
              </div>
            </div>
          )}
        </div>

        {/* Screen Share Preview */}
        {isScreenSharing && screenStream && (
          <div className="absolute top-6 right-6 w-48 h-32 bg-black rounded-lg border-2 border-blue-500 overflow-hidden">
            <video
              ref={screenShareRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <div className="flex items-center text-xs text-white">
                <ScreenShare className="w-3 h-3 mr-1" />
                Compartiendo pantalla
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800/90 border-t border-gray-700/60">
        <div className="flex items-center justify-center space-x-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            disabled={connectionState !== 'connected'}
            className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isVideoEnabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            disabled={connectionState !== 'connected'}
            className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isAudioEnabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle (only for desktop) */}
          {typeof window !== 'undefined' && typeof navigator?.mediaDevices?.getDisplayMedia === 'function' && (
            <button
              onClick={toggleScreenShare}
              disabled={connectionState !== 'connected'}
              className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
              title={isScreenSharing ? 'Detener compartir pantalla' : 'Compartir pantalla'}
            >
              {isScreenSharing ? <ScreenShare className="w-5 h-5" /> : <ScreenShareOff className="w-5 h-5" />}
            </button>
          )}

          {/* Start/End Call Button */}
          {connectionState === 'disconnected' || connectionState === 'failed' ? (
            <button
              onClick={startCall}
              className={`p-4 ${colors.primary} rounded-full transition-colors text-white shadow-lg`}
              title="Iniciar videollamada"
            >
              <Phone className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={endCall}
              className="p-4 bg-red-600 hover:bg-red-500 rounded-full transition-colors text-white shadow-lg"
              title="Terminar videollamada"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Status text */}
        <div className="text-center mt-3 text-sm text-gray-400">
          {connectionState === 'disconnected' && 'Presiona el botón para iniciar la videollamada'}
          {connectionState === 'connecting' && 'Estableciendo conexión...'}
          {connectionState === 'connected' && `Videollamada activa • ${totalParticipants} participante${totalParticipants !== 1 ? 's' : ''}`}
          {connectionState === 'failed' && 'Error de conexión. Intenta nuevamente.'}
        </div>
      </div>
    </div>
  )
}