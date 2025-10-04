'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TelemedicineClient,
  type TelemedicineRole,
  type OfferMessage,
  type AnswerMessage,
  type IceCandidateMessage,
} from '@autamedica/telemedicine'
import { getClientEnvOrDefault } from '@autamedica/shared'

export type SignalingConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export interface UseTelemedicineSignalingConfig {
  roomId: string
  userId: string
  userType: TelemedicineRole
  metadata?: Record<string, unknown>
  token?: string
  signalingUrl?: string
  autoReconnect?: boolean
}

export interface TelemedicineSignalingState {
  connectionState: SignalingConnectionState
  participants: Array<{ id: string; userType: TelemedicineRole }>
  lastOffer: OfferMessage | null
  lastAnswer: AnswerMessage | null
  lastCandidate: IceCandidateMessage | null
  error: Error | null
}

export interface TelemedicineSignalingControls {
  connect: () => Promise<void>
  disconnect: () => void
  sendOffer: (description: RTCSessionDescriptionInit, targetId?: string) => void
  sendAnswer: (description: RTCSessionDescriptionInit, targetId?: string) => void
  sendIceCandidate: (candidate: RTCIceCandidateInit, targetId?: string) => void
  sendLeave: () => void
}

export function useTelemedicineSignaling(config: UseTelemedicineSignalingConfig) {
  const [state, setState] = useState<TelemedicineSignalingState>({
    connectionState: 'idle',
    participants: [],
    lastOffer: null,
    lastAnswer: null,
    lastCandidate: null,
    error: null,
  })

  const clientRef = useRef<TelemedicineClient | null>(null)

  const normalizedConfig = useMemo(
    () => ({
      url:
        config.signalingUrl ?? getClientEnvOrDefault('NEXT_PUBLIC_SIGNALING_URL', 'ws://localhost:3005/signal'),
      roomId: config.roomId,
      userId: config.userId,
      userType: config.userType,
      metadata: config.metadata,
      token: config.token,
      autoReconnect: config.autoReconnect ?? true,
    }),
    [config.autoReconnect, config.metadata, config.roomId, config.signalingUrl, config.token, config.userId, config.userType],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const client = new TelemedicineClient(normalizedConfig)
    clientRef.current = client

    const unsubscribes = [
      client.on('open', () => {
        setState((prev) => ({ ...prev, connectionState: 'connected', error: null }))
      }),
      client.on('close', () => {
        setState((prev) => ({
          ...prev,
          connectionState: normalizedConfig.autoReconnect ? 'reconnecting' : 'disconnected',
        }))
      }),
      client.on('error', (error) => {
        setState((prev) => ({ ...prev, error }))
      }),
      client.on('user-joined', (message) => {
        setState((prev) => ({
          ...prev,
          participants: addOrUpdateParticipant(prev.participants, {
            id: message.from,
            userType: message.data?.userType ?? 'unknown',
          }),
        }))
      }),
      client.on('user-left', (message) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.filter((participant) => participant.id !== message.from),
        }))
      }),
      client.on('offer', (message) => {
        setState((prev) => ({ ...prev, lastOffer: message }))
      }),
      client.on('answer', (message) => {
        setState((prev) => ({ ...prev, lastAnswer: message }))
      }),
      client.on('ice-candidate', (message) => {
        setState((prev) => ({ ...prev, lastCandidate: message }))
      }),
    ]

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
      client.disconnect()
      clientRef.current = null
    }
  }, [normalizedConfig])

  const connect = async () => {
    if (!clientRef.current) {
      throw new Error('Telemedicine client not initialized')
    }
    setState((prev) => ({ ...prev, connectionState: 'connecting', error: null }))
    await clientRef.current.connect()
  }

  const disconnect = () => {
    clientRef.current?.disconnect()
    setState((prev) => ({
      ...prev,
      connectionState: 'disconnected',
    }))
  }

  const sendOffer = (description: RTCSessionDescriptionInit, targetId?: string) => {
    clientRef.current?.sendOffer(description, targetId)
  }

  const sendAnswer = (description: RTCSessionDescriptionInit, targetId?: string) => {
    clientRef.current?.sendAnswer(description, targetId)
  }

  const sendIceCandidate = (candidate: RTCIceCandidateInit, targetId?: string) => {
    clientRef.current?.sendIceCandidate(candidate, targetId)
  }

  const sendLeave = () => {
    clientRef.current?.sendLeave()
  }

  return {
    state,
    controls: {
      connect,
      disconnect,
      sendOffer,
      sendAnswer,
      sendIceCandidate,
      sendLeave,
    },
  }
}

function addOrUpdateParticipant(
  list: Array<{ id: string; userType: TelemedicineRole }>,
  next: { id: string; userType: TelemedicineRole },
) {
  const existing = list.find((participant) => participant.id === next.id)
  if (existing) {
    return list.map((participant) => (participant.id === next.id ? next : participant))
  }
  return [...list, next]
}
