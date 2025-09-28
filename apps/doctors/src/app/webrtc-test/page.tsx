'use client'

import { useEffect, useMemo, useRef } from 'react'
import { ensureClientEnv } from '@autamedica/shared'

const ROOM_ID = 'test123'
const ROLE: 'doctor' | 'patient' = 'doctor'

const parseIceServers = () => {
  const raw = ensureClientEnv('NEXT_PUBLIC_ICE_SERVERS', '[]')
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    console.warn('[webrtc-test] NEXT_PUBLIC_ICE_SERVERS must be a JSON array; falling back to []')
  } catch (error) {
    console.error('[webrtc-test] Failed to parse NEXT_PUBLIC_ICE_SERVERS', error)
  }
  return []
}

export default function WebRTCTestPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const iceServers = useMemo(parseIceServers, [])

  useEffect(() => {
    if (typeof window === 'undefined' || pcRef.current) return

    const pc = new RTCPeerConnection({ iceServers })
    pcRef.current = pc

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ice', candidate: event.candidate }))
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[webrtc-test] PeerConnection state:', pc.connectionState)
    }

    pc.ontrack = (event) => {
      const remoteEl = remoteVideoRef.current
      if (!remoteEl) return

      let remoteStream = remoteEl.srcObject as MediaStream | null
      if (!remoteStream) {
        remoteStream = new MediaStream()
        remoteEl.srcObject = remoteStream
      }

      const incomingStream = event.streams[0]
      for (const track of incomingStream.getTracks()) {
        if (!remoteStream.getTracks().some((existing) => existing.id === track.id)) {
          remoteStream.addTrack(track)
        }
      }
    }

    const globalWindow = window as typeof window & {
      __webrtcTest?: Record<string, unknown>
      __pc?: RTCPeerConnection
    }

    const exposed = {
      role: ROLE,
      pc,
      get ws() {
        return wsRef.current
      },
      get localVideo() {
        return localVideoRef.current
      },
      get remoteVideo() {
        return remoteVideoRef.current
      },
      get pcState() {
        return {
          connection: pc.connectionState,
          iceConnection: pc.iceConnectionState,
          signaling: pc.signalingState,
        }
      },
      async getSelectedCandidatePair() {
        const stats = await pc.getStats()
        let selected: RTCIceCandidatePairStats | null = null
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && (report as RTCIceCandidatePairStats).selected) {
            selected = report as RTCIceCandidatePairStats
          }
        })
        return selected
      },
    }

    globalWindow.__webrtcTest = exposed
    globalWindow.__pc = pc
    console.log('[webrtc-test] window.__webrtcTest ready', { role: ROLE })

    return () => {
      if (globalWindow.__webrtcTest === exposed) {
        delete globalWindow.__webrtcTest
      }
      if (globalWindow.__pc === pc) {
        delete globalWindow.__pc
      }
      pc.getSenders().forEach((sender) => sender.track?.stop())
      pc.close()
      pcRef.current = null
    }
  }, [iceServers])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const signalingUrl = ensureClientEnv('NEXT_PUBLIC_SIGNALING_URL')
    if (!signalingUrl) {
      console.error('[webrtc-test] Missing NEXT_PUBLIC_SIGNALING_URL env')
      return
    }

    const socket = new WebSocket(signalingUrl)
    wsRef.current = socket

    socket.onopen = () => {
      console.log('[webrtc-test] WebSocket connected')
      socket.send(JSON.stringify({ type: 'join', roomId: ROOM_ID, role: ROLE }))
    }

    socket.onclose = (event) => {
      console.log('[webrtc-test] WebSocket closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      })
    }

    socket.onerror = (event) => {
      console.error('[webrtc-test] WebSocket error', {
        type: event.type,
        readyState: socket.readyState,
      })
    }

    socket.onmessage = async (event) => {
      const pc = pcRef.current
      if (!pc) {
        console.warn('[webrtc-test] Received signaling message but RTCPeerConnection is not ready')
        return
      }

      try {
        const message = JSON.parse(event.data)
        console.log('[webrtc-test] signaling message', message)

        if (message.type === 'offer' && ROLE === 'patient') {
          await pc.setRemoteDescription({ type: 'offer', sdp: message.sdp })
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }))
        }

        if (message.type === 'answer' && ROLE === 'doctor') {
          await pc.setRemoteDescription({ type: 'answer', sdp: message.sdp })
        }

        if (message.type === 'ice' && message.candidate) {
          try {
            await pc.addIceCandidate(message.candidate)
          } catch (error) {
            console.error('[webrtc-test] Failed to add ICE candidate', error)
          }
        }
      } catch (error) {
        console.error('[webrtc-test] Failed to parse signaling message', error)
      }
    }

    return () => {
      if (wsRef.current === socket) {
        wsRef.current = null
      }
      socket.close()
    }
  }, [])

  const startCall = async () => {
    const pc = pcRef.current
    const socket = wsRef.current

    if (!pc) {
      console.error('[webrtc-test] Cannot start call: RTCPeerConnection not ready')
      return
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('[webrtc-test] WebSocket not open yet; wait for connection before starting call')
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }

      mediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, mediaStream)
      })

      if (ROLE === 'doctor') {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }))
      }
    } catch (error) {
      console.error('[webrtc-test] Failed to start media', error)
      alert('Could not start camera/microphone. Check permissions and console logs.')
    }
  }

  return (
    <main style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1>WebRTC Test ({ROLE})</h1>
      <button onClick={startCall} type="button">
        Start
      </button>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '33%' }} />
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '66%' }} />
    </main>
  )
}
