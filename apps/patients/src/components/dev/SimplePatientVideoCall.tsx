'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  PhoneIncoming,
  Phone,
  User,
  Clock,
  X,
  Settings
} from 'lucide-react'
import MediaPicker from './MediaPicker'

interface SimplePatientVideoCallProps {
  roomId: string
  patientName?: string
}

type CallStatus = 'waiting' | 'incoming' | 'connecting' | 'connected' | 'ended'

export default function SimplePatientVideoCall({
  roomId,
  patientName: _patientName = 'Paciente'
}: SimplePatientVideoCallProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('waiting')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [callerName, setCallerName] = useState('Dr. García')
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaError, setMediaError] = useState(false)

  // Stable userId stored in sessionStorage
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return `patient-${Date.now()}`
    const stored = sessionStorage.getItem('patientUserId')
    if (stored) return stored
    const newId = `patient-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('patientUserId', newId)
    return newId
  })
  const [currentOffer, setCurrentOffer] = useState<RTCSessionDescriptionInit | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const ringtoneRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const seenMessagesRef = useRef(new Set<string>())
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])

  // Ensure remote stream is rendered once the element exists
  useEffect(() => {
    const remoteVideoEl = remoteVideoRef.current
    if (!remoteVideoEl) return

    remoteVideoEl.srcObject = remoteStream
    if (remoteStream) {
      remoteVideoEl
        .play()
        .catch(() => {
          /* autoplay might be blocked – ignore */
        })
    }
  }, [remoteStream, callStatus])

  // Crear peer connection
  const createPeerConnection = () => {
    // Close existing connection if any
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    pendingIceCandidatesRef.current.length = 0

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    })

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      // logger.info('Received remote stream track:', event.track.kind)
      if (event.streams?.[0]) {
        // logger.info('Setting remote stream')
        setRemoteStream(event.streams[0])
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        // logger.info('Sending ICE candidate')
        const signalingBase = 'http://localhost:8787'
        try {
          await fetch(`${signalingBase}/api/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: userId,
              roomId,
              type: 'ice-candidate',
              data: { candidate: event.candidate }
            })
          })
        } catch (error) {
          logger.error('Error sending ICE candidate:', error)
        }
      }
    }

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      // logger.info('Connection state:', pc.connectionState)
      if (pc.connectionState === 'failed') {
        logger.error('WebRTC connection failed')
        setMediaError(true)
      }
    }

    peerConnectionRef.current = pc
    return pc
  }

  // Conectar al servidor de señalización HTTP
  useEffect(() => {
    const signalingBase = 'http://localhost:8787'
    let pollInterval: NodeJS.Timeout | null = null
    let isActive = true

    // Join room
    const joinRoom = async () => {
      if (!isActive) return

      try {
        const response = await fetch(`${signalingBase}/api/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            roomId,
            userType: 'patient'
          })
        })

        if (response.ok && isActive) {
          // logger.info('Conectado a la sala de espera:', roomId)
          startPolling()
        }
      } catch (error) {
        logger.error('Error al unirse a la sala:', error)
      }
    }

    // Poll for messages
    const startPolling = () => {
      if (pollInterval) clearInterval(pollInterval)

      pollInterval = setInterval(async () => {
        if (!isActive) return

        try {
          const response = await fetch(
            `${signalingBase}/api/poll?userId=${userId}&roomId=${roomId}`
          )

          if (response.ok && isActive) {
            const data = await response.json()
            if (data.messages && data.messages.length > 0) {
              for (const msg of data.messages) {
                // Ignore our own messages and user events
                if (msg.from === userId || msg.type === 'user-joined' || msg.type === 'user-left') {
                  continue
                }

                // De-duplicate messages
                const msgKey = `${msg.type}-${msg.from}-${msg.timestamp}`
                if (seenMessagesRef.current.has(msgKey)) {
                  continue
                }
                seenMessagesRef.current.add(msgKey)

                // Clean old messages from seen set (keep last 100)
                if (seenMessagesRef.current.size > 100) {
                  const entries = Array.from(seenMessagesRef.current)
                  seenMessagesRef.current = new Set(entries.slice(-50))
                }

                // logger.info('Mensaje recibido:', msg)

                // Recibir llamada entrante
                if (msg.type === 'incoming-call') {
                  setCallStatus('incoming')
                  setCallerName(msg.data?.doctorName || 'Dr. García')
                  // Reproducir sonido de llamada
                  playRingtone()
                }

                // Handle WebRTC offer from doctor
                if (msg.type === 'webrtc-offer') {
                  // logger.info('Received WebRTC offer')
                  setCurrentOffer(msg.data.offer)
                }

                // Handle ICE candidates from doctor
                if (msg.type === 'ice-candidate' && peerConnectionRef.current) {
                  // logger.info('Received ICE candidate')

                  if (!msg.data?.candidate) {
                    logger.warn('ICE candidate payload missing candidate data')
                    continue
                  }

                  try {
                    const pc = peerConnectionRef.current
                    const candidateInit = msg.data.candidate as RTCIceCandidateInit

                    if (pc.remoteDescription) {
                      await pc.addIceCandidate(new RTCIceCandidate(candidateInit))
                    } else {
                      // logger.info('Remote description not set yet, queueing ICE candidate')
                      pendingIceCandidatesRef.current.push(candidateInit)
                    }
                  } catch (err) {
                    logger.error('Failed to add ICE candidate:', err)
                  }
                }

                // La llamada fue terminada por el doctor
                if (msg.type === 'call-ended') {
                  handleCallEnd()
                }
              }
            }
          }
        } catch (error) {
          logger.error('Error en polling:', error)
        }
      }, 1000) // Poll every second
    }

    joinRoom()

    return () => {
      isActive = false

      // Leave room on unmount
      if (pollInterval) clearInterval(pollInterval)

      fetch(`${signalingBase}/api/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roomId })
      }).catch(console.error)

      // Cleanup peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
    }
  }, [roomId, userId]) // Don't include volatile state to avoid reconnects

  // Inicializar cámara y micrófono cuando se acepta la llamada
  const initMedia = async (): Promise<MediaStream | null> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setStream(mediaStream)
      setMediaError(false)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }

      return mediaStream
    } catch (error: any) {
      logger.error('Error al acceder a la cámara:', error)
      setMediaError(true)
      setShowMediaPicker(true)

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        })
        setStream(audioStream)
        setMediaError(false)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = audioStream
        }

        return audioStream
      } catch (err) {
        logger.error('Failed to get even audio:', err)
        return null
      }
    }
  }

  // Handle media ready from MediaPicker
  const handleMediaReady = (mediaStream: MediaStream) => {
    setStream(mediaStream)
    setMediaError(false)
    setShowMediaPicker(false)

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream
    }

    // Add stream to peer connection if it exists
    if (peerConnectionRef.current && mediaStream) {
      mediaStream.getTracks().forEach(track => {
        peerConnectionRef.current!.addTrack(track, mediaStream)
      })
    }
  }

  // Cleanup media streams
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream, remoteStream])

  // Timer de duración de llamada
  const startCallTimer = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }, [])

  const stopCallTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCallDuration(0)
  }, [])

  // Formatear duración
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Reproducir tono de llamada
  const playRingtone = () => {
    // Simular sonido de llamada con beep del navegador
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 440
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3

    oscillator.start()
    setTimeout(() => oscillator.stop(), 500)
  }

  const processOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionRef.current

      if (!pc) {
        logger.warn('processOffer called but no peer connection is ready yet')
        return
      }

      if (pc.currentRemoteDescription) {
        // logger.info('Remote description already set, skipping duplicate offer')
        return
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))

        if (pendingIceCandidatesRef.current.length) {
          // logger.info('Applying queued ICE candidates...')
          const queuedCandidates = [...pendingIceCandidatesRef.current]
          pendingIceCandidatesRef.current.length = 0

          for (const candidateInit of queuedCandidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateInit))
            } catch (candidateError) {
              logger.error('Failed to add queued ICE candidate:', candidateError)
            }
          }
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        const localDescription = pc.localDescription
        if (!localDescription) {
          throw new Error('Local description missing after setLocalDescription')
        }

        const signalingBase = 'http://localhost:8787'
        await fetch(`${signalingBase}/api/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: userId,
            roomId,
            type: 'webrtc-answer',
            data: { answer: localDescription }
          })
        })

        // logger.info('Answer sent successfully')
        setCallStatus('connected')
        startCallTimer()
        setCurrentOffer(null)
      } catch (error) {
        logger.error('Error processing offer:', error)
        setMediaError(true)
        setShowMediaPicker(true)
      }
    },
    [roomId, startCallTimer, userId]
  )

  // Aceptar llamada
  const acceptCall = async () => {
    stopRingtone()
    setCallStatus('connecting')

    try {
      let mediaStream = stream
      if (!mediaStream) {
        mediaStream = await initMedia()
      }

      if (!mediaStream) {
        throw new Error('No media stream available after initialization')
      }

      const pc = createPeerConnection()

      // logger.info('Adding tracks to peer connection:')
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream)
        // logger.info(`  - Added ${track.kind} track: ${track.label}`)
      })

      const signalingBase = 'http://localhost:8787'
      await fetch(`${signalingBase}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          roomId,
          type: 'patient-joined',
          data: {}
        })
      })

      if (currentOffer) {
        // logger.info('Offer already available, processing immediately')
        await processOffer(currentOffer)
      } else {
        // logger.info('Awaiting offer from doctor to complete handshake')
      }
    } catch (error) {
      logger.error('Error al aceptar llamada:', error)
      setMediaError(true)
      setShowMediaPicker(true)
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      setCallStatus('incoming')
    }
  }

  // Process offers that arrive after the patient already accepted the call
  useEffect(() => {
    if (callStatus !== 'connecting') return
    if (!currentOffer) return

    void processOffer(currentOffer)
  }, [callStatus, currentOffer, processOffer])

  // Rechazar llamada
  const rejectCall = async () => {
    stopRingtone()
    setCallStatus('waiting')

    const signalingBase = 'http://localhost:8787'

    try {
      await fetch(`${signalingBase}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          roomId,
          type: 'call-rejected',
          data: {}
        })
      })
    } catch (error) {
      logger.error('Error al rechazar llamada:', error)
    }
  }

  // Finalizar llamada
  const endCall = async () => {
    handleCallEnd()

    const signalingBase = 'http://localhost:8787'

    try {
      await fetch(`${signalingBase}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          roomId,
          type: 'call-ended',
          data: {}
        })
      })
    } catch (error) {
      logger.error('Error al finalizar llamada:', error)
    }
  }

  // Manejar fin de llamada
  const handleCallEnd = () => {
    setCallStatus('ended')
    stopCallTimer()
    stopRingtone()

    // Cleanup peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Detener media streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop())
    }

    // Clear remote stream
    setRemoteStream(null)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    // Reiniciar estado después de 2 segundos
    setTimeout(() => {
      setCallStatus('waiting')
      setStream(null)
      setCurrentOffer(null)
    }, 2000)
  }

  // Detener tono de llamada
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Portal del Paciente</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>Sala de espera: {roomId}</span>
            {callStatus === 'connected' && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(callDuration)}
              </span>
            )}
          </div>
          </div>
          {/* Settings button for media configuration */}
          {callStatus === 'waiting' && (
            <button
              onClick={() => setShowMediaPicker(!showMediaPicker)}
              className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              title="Configurar cámara y micrófono"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Media Picker Modal */}
        {showMediaPicker && (
          <div className="mb-6">
            <MediaPicker
              onMediaReady={handleMediaReady}
              onError={(error) => {
                logger.error('MediaPicker error:', error)
                setMediaError(true)
              }}
            />
          </div>
        )}

        {/* Modal de llamada entrante */}
        {callStatus === 'incoming' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
                    <PhoneIncoming className="w-12 h-12 text-green-600 animate-bounce" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Llamada entrante</h2>
                <p className="text-lg text-gray-600 mb-6">{callerName} te está llamando</p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={acceptCall}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Aceptar
                  </button>
                  <button
                    onClick={rejectCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>

                {mediaError && (
                  <div className="mt-4 text-sm text-orange-600">
                    ⚠️ Problema con la cámara. Se abrirá el selector de dispositivos.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estado de la llamada */}
        <div className="mb-4">
          {callStatus === 'waiting' && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Esperando llamada del doctor...</span>
            </div>
          )}
          {callStatus === 'connecting' && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">Conectando con {callerName}...</span>
            </div>
          )}
          {callStatus === 'connected' && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">En consulta con {callerName}</span>
            </div>
          )}
          {callStatus === 'ended' && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center gap-2">
              <PhoneOff className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Llamada finalizada</span>
            </div>
          )}
        </div>

        {/* Videos - mostrar cuando la conexión está en curso o establecida */}
        {(callStatus === 'connecting' || callStatus === 'connected') && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Video remoto (Doctor) */}
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {callStatus === 'connecting' && !remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <Clock className="w-10 h-10 text-gray-400 mb-2 animate-spin" />
                    <span className="text-sm text-gray-500">Esperando video del doctor...</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded">
                  <span className="text-sm">{callerName}</span>
                </div>
              </div>

              {/* Video local */}
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {(isVideoOff || !stream?.getVideoTracks().length) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
                    <VideoOff className="w-12 h-12 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-600">Cámara desactivada</span>
                    <button
                      onClick={() => setShowMediaPicker(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Configurar cámara
                    </button>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded">
                  <span className="text-sm">Tú</span>
                </div>
              </div>
            </div>

            {/* Controles de llamada */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOff
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-md"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </>
        )}

        {/* Sala de espera cuando no hay llamada */}
        {callStatus === 'waiting' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <User className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sala de Espera Virtual</h2>
            <p className="text-gray-500">
              Tu doctor te llamará cuando esté listo para la consulta.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Por favor, mantén tu cámara y micrófono listos.
            </p>
            {mediaError && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-sm text-yellow-800">
                <p>⚠️ Problema detectado con la cámara.</p>
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Configurar dispositivos manualmente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
