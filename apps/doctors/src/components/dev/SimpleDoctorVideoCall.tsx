'use client'

import React, { useState, useEffect, useRef } from 'react'
import { WebRTCDebugger, attachWebRTCDebugger, quickDiagnosis } from '../../utils/webrtc-debug'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Phone,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw
} from 'lucide-react'
import MediaPicker from './MediaPicker'

interface SimpleDoctorVideoCallProps {
  roomId: string
  patientName?: string
}

type CallStatus = 'idle' | 'calling' | 'connected' | 'ended'

export default function SimpleDoctorVideoCall({
  roomId,
  patientName = 'Paciente'
}: SimpleDoctorVideoCallProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaError, setMediaError] = useState<string>('')

  // Stable userId stored in sessionStorage
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return `doctor-${Date.now()}`
    const stored = sessionStorage.getItem('doctorUserId')
    if (stored) return stored
    const newId = `doctor-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('doctorUserId', newId)
    return newId
  })

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const seenMessagesRef = useRef(new Set<string>())
  const lastCallAttemptRef = useRef(0)
  const callStatusRef = useRef<CallStatus>('idle')
  const offerInFlightRef = useRef(false)
  const pendingOfferRef = useRef(false)
  const debuggerRef = useRef<WebRTCDebugger | null>(null)

  // Initialize debugger
  useEffect(() => {
    if (!debuggerRef.current) {
      debuggerRef.current = new WebRTCDebugger('doctor')
      debuggerRef.current.info('🏥 Doctor WebRTC Debug Session Started')
      debuggerRef.current.info(`Room: ${roomId}, UserID: ${userId}`)
      quickDiagnosis() // Show diagnosis instructions in console
    }
  }, [])

  // Ensure remote stream is attached once the video element mounts
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

  useEffect(() => {
    callStatusRef.current = callStatus
  }, [callStatus])

  // Crear peer connection
  const createPeerConnection = () => {
    // Close any existing connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

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
      debuggerRef.current?.success(`🎥 TRACK RECEIVED: ${event.track.kind}`, {
        trackId: event.track.id,
        enabled: event.track.enabled,
        muted: event.track.muted,
        readyState: event.track.readyState,
        streamCount: event.streams.length
      })

      if (event.streams && event.streams[0]) {
        const stream = event.streams[0]
        debuggerRef.current?.info('Setting remote stream', {
          streamId: stream.id,
          active: stream.active,
          tracks: stream.getTracks().map(t => ({ kind: t.kind, id: t.id }))
        })

        setRemoteStream(stream)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
          remoteVideoRef.current.play().catch((err) => {
            debuggerRef.current?.warn('Autoplay blocked:', err.message)
          })
        }
      } else {
        debuggerRef.current?.error('Track event has no streams!')
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        debuggerRef.current?.info('🧊 Sending ICE candidate', {
          protocol: event.candidate.protocol,
          type: event.candidate.type,
          port: event.candidate.port
        })
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
          console.error('Error sending ICE candidate:', error)
        }
      }
    }

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      debuggerRef.current?.info(`🔄 Connection state changed: ${pc.connectionState}`)

      if (pc.connectionState === 'connected') {
        debuggerRef.current?.success('✅ WebRTC CONNECTION ESTABLISHED!')
        // Run diagnosis when connected
        setTimeout(() => {
          debuggerRef.current?.diagnose(pc)
        }, 1000)
      } else if (pc.connectionState === 'failed') {
        debuggerRef.current?.error('❌ WebRTC CONNECTION FAILED')
        setMediaError('La conexión falló. Intenta reiniciar la llamada.')
      }
    }

    pc.oniceconnectionstatechange = () => {
      debuggerRef.current?.info(`🧊 ICE connection state: ${pc.iceConnectionState}`)

      if (pc.iceConnectionState === 'checking') {
        debuggerRef.current?.info('ICE: Checking connectivity...')
      } else if (pc.iceConnectionState === 'connected') {
        debuggerRef.current?.success('ICE: Connected successfully')
      } else if (pc.iceConnectionState === 'failed') {
        debuggerRef.current?.error('ICE: Connection failed - possible firewall/NAT issue')
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
            userType: 'doctor'
          })
        })

        if (response.ok && isActive) {
          console.log('Conectado a la sala:', roomId)
          startPolling()
        }
      } catch (error) {
        console.error('Error al unirse a la sala:', error)
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

                debuggerRef.current?.info(`📨 Message received: ${msg.type}`, {
                  from: msg.from,
                  timestamp: msg.timestamp
                })

                if (msg.type === 'patient-joined' && callStatusRef.current === 'calling') {
                  debuggerRef.current?.success('🙋 Patient joined the call, creating offer...')
                  handlePatientJoined()
                }

                // Handle WebRTC answer from patient
                if (msg.type === 'webrtc-answer' && peerConnectionRef.current) {
                  debuggerRef.current?.success('📬 Received WebRTC answer from patient')
                  try {
                    const answer = new RTCSessionDescription(msg.data.answer)

                    debuggerRef.current?.info('Setting remote description...', {
                      type: answer.type,
                      hasVideo: answer.sdp?.includes('m=video'),
                      hasAudio: answer.sdp?.includes('m=audio')
                    })

                    await peerConnectionRef.current.setRemoteDescription(answer)

                    debuggerRef.current?.success('✅ Remote description set successfully')
                    // NOW we're connected
                    setCallStatus('connected')
                    offerInFlightRef.current = false
                    startCallTimer()
                  } catch (err: any) {
                    debuggerRef.current?.error('❌ Failed to set remote description:', err.message)
                  }
                }

                // Handle ICE candidates from patient
                if (msg.type === 'ice-candidate' && peerConnectionRef.current) {
                  try {
                    const candidate = new RTCIceCandidate(msg.data.candidate)
                    await peerConnectionRef.current.addIceCandidate(candidate)
                    debuggerRef.current?.info('🧊 Added ICE candidate from patient')
                  } catch (err: any) {
                    debuggerRef.current?.warn('Failed to add ICE candidate:', err.message)
                  }
                }

                // Handle call ended
                if (msg.type === 'call-ended') {
                  handleCallEnd()
                }
              }
            }
          }
        } catch (error) {
          console.error('Error en polling:', error)
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
  }, [roomId, userId]) // Remove callStatus from dependencies to avoid reconnection

  // Handle patient joined - create WebRTC offer
  const handlePatientJoined = async () => {
    if (offerInFlightRef.current) {
      console.log('Offer already in flight, skipping duplicate handling')
      return
    }

    let localStream = stream
    if (!localStream) {
      console.warn('No stream available for offer yet, requesting media before continuing')
      pendingOfferRef.current = true
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        setStream(localStream)
        setMediaError('')

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
          localVideoRef.current.muted = true
          localVideoRef.current.playsInline = true
          localVideoRef.current.autoplay = true
          localVideoRef.current.play().catch(() => {})
        }
      } catch (error: any) {
        offerInFlightRef.current = false
        console.error('Unable to acquire local media for offer:', error)
        if (error.name === 'NotAllowedError') {
          setMediaError('Permite el acceso a cámara y micrófono para iniciar la videollamada')
        } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
          setMediaError('La cámara está en uso por otra aplicación')
        } else {
          setMediaError('No se pudo inicializar la cámara/micrófono')
        }
        return
      }
    }

    if (!localStream) {
      console.error('Local stream still unavailable after acquisition attempt')
      offerInFlightRef.current = false
      pendingOfferRef.current = true
      return
    }

    offerInFlightRef.current = true
    pendingOfferRef.current = false

    try {
      const pc = createPeerConnection()

      // Add local tracks to peer connection BEFORE creating offer
      debuggerRef.current?.info('📤 Adding local tracks to peer connection:')
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
        debuggerRef.current?.success(`  ✓ Added ${track.kind} track`, {
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState
        })
      })

      // Create offer
      debuggerRef.current?.info('📝 Creating WebRTC offer...')
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      debuggerRef.current?.success('Offer created', {
        type: offer.type,
        hasVideo: offer.sdp?.includes('m=video'),
        hasAudio: offer.sdp?.includes('m=audio')
      })

      // Send offer to patient
      const signalingBase = 'http://localhost:8787'
      await fetch(`${signalingBase}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          roomId,
          type: 'webrtc-offer',
          data: { offer: pc.localDescription }
        })
      })

      // Don't set connected yet - wait for answer
      debuggerRef.current?.info('📮 Offer sent, waiting for answer...')
    } catch (error) {
      offerInFlightRef.current = false
      console.error('Error preparing or sending offer:', error)
    }
  }

  // Handle media stream from MediaPicker
  const handleMediaReady = (mediaStream: MediaStream) => {
    // Clean up old stream if exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    setStream(mediaStream)
    setShowMediaPicker(false)
    setMediaError('')

    // Attach to video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream
      localVideoRef.current.muted = true
      localVideoRef.current.playsInline = true
      localVideoRef.current.autoplay = true
      localVideoRef.current.play().catch(() => {})
    }

    // Add tracks to peer connection if exists
    if (peerConnectionRef.current && mediaStream) {
      mediaStream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, mediaStream)
      })
    }

    if (callStatusRef.current === 'calling' && pendingOfferRef.current && !offerInFlightRef.current) {
      console.log('Media ready after pending offer request, creating offer now')
      handlePatientJoined()
    }
  }

  // Inicializar cámara y micrófono con fallbacks
  useEffect(() => {
    const initMedia = async () => {
      // Progressive fallback constraints
      const constraints = [
        { video: true, audio: true },
        { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: true },
        { video: { facingMode: 'user' }, audio: true },
        { video: false, audio: true } // Audio only as last resort
      ]

      for (const constraint of constraints) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
          handleMediaReady(mediaStream)
          return
        } catch (error: any) {
          console.log(`Failed with constraint:`, constraint, error.name)

          if (error.name === 'NotAllowedError') {
            setMediaError('Permisos de cámara/micrófono denegados')
            break
          }

          if (error.name === 'AbortError' || error.name === 'NotReadableError') {
            setMediaError('La cámara está siendo usada por otra aplicación')
          }
        }
      }

      // If all attempts failed, show media picker
      if (!stream) {
        console.log('Auto-init failed, showing media picker')
        setShowMediaPicker(true)
      }
    }

    initMedia()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Timer de duración de llamada
  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCallDuration(0)
  }

  // Formatear duración
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Iniciar llamada
  const startCall = async () => {
    // Prevent spam calling - only allow one call attempt every 10 seconds
    const now = Date.now()
    if (now - lastCallAttemptRef.current < 10000) {
      console.log('Por favor espera antes de llamar nuevamente')
      return
    }
    lastCallAttemptRef.current = now

    setCallStatus('calling')
    offerInFlightRef.current = false
    pendingOfferRef.current = false

    // Notificar al servidor que se está iniciando una llamada
    const signalingBase = 'http://localhost:8787'

    try {
      await fetch(`${signalingBase}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          roomId,
          type: 'incoming-call',
          data: {
            doctorName: 'Dr. García',
            patientName
          }
        })
      })
    } catch (error) {
      console.error('Error al iniciar llamada:', error)
    }
  }

  // Handle call end
  const handleCallEnd = () => {
    setCallStatus('ended')
    stopCallTimer()
    offerInFlightRef.current = false
    pendingOfferRef.current = false

    // Cleanup peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Clear remote stream
    setRemoteStream(null)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    // Reiniciar estado después de 2 segundos
    setTimeout(() => {
      setCallStatus('idle')
      offerInFlightRef.current = false
      pendingOfferRef.current = false
    }, 2000)
  }

  // Finalizar llamada
  const endCall = async () => {
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
      console.error('Error al finalizar llamada:', error)
    }

    handleCallEnd()
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portal Médico - Videollamada</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span>Sala: {roomId}</span>
              {callStatus === 'connected' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowMediaPicker(true)}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Configuración de medios"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Media picker modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <MediaPicker
                onMediaReady={handleMediaReady}
                onError={(err) => setMediaError(err.message)}
              />
              <button
                onClick={() => setShowMediaPicker(false)}
                className="mt-2 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Media error alert */}
        {mediaError && (
          <div className="mb-4 bg-red-900/20 border border-red-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{mediaError}</span>
            </div>
            <button
              onClick={() => setShowMediaPicker(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              Configurar medios
            </button>
          </div>
        )}

        {/* Estado de la llamada */}
        <div className="mb-4">
          {callStatus === 'idle' && (
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Listo para llamar</span>
            </div>
          )}
          {callStatus === 'calling' && (
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-3 flex items-center gap-2">
              <div className="animate-pulse flex items-center gap-2">
                <Phone className="w-5 h-5 text-yellow-400 animate-bounce" />
                <span>Llamando a {patientName}...</span>
              </div>
            </div>
          )}
          {callStatus === 'connected' && (
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>En llamada con {patientName}</span>
            </div>
          )}
          {callStatus === 'ended' && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Llamada finalizada</span>
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Video local */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
              <span className="text-sm">Tú (Doctor)</span>
            </div>
          </div>

          {/* Video remoto */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {callStatus === 'connected' ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                  <span className="text-sm">{patientName}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {callStatus === 'calling' ? 'Esperando respuesta...' : 'Sin conexión'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4">
          {callStatus === 'idle' && (
            <button
              onClick={startCall}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              Llamar a {patientName}
            </button>
          )}

          {(callStatus === 'calling' || callStatus === 'connected') && (
            <>
              <button
                onClick={toggleMute}
                className={`p-3 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-lg transition-colors ${
                  isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={endCall}
                className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Info panel */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Información del Paciente</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Nombre:</span>
              <span className="ml-2">{patientName}</span>
            </div>
            <div>
              <span className="text-gray-400">Tipo de consulta:</span>
              <span className="ml-2">General</span>
            </div>
            <div>
              <span className="text-gray-400">Edad:</span>
              <span className="ml-2">30 años</span>
            </div>
            <div>
              <span className="text-gray-400">Estado:</span>
              <span className="ml-2">{callStatus === 'connected' ? 'En consulta' : 'En espera'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
