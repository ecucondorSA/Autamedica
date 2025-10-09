'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@autamedica/shared'
import { patientsEnv } from '@/lib/env'

interface IncomingCall {
  id: string
  roomId: string
  doctorId: string
  doctorName?: string
  timestamp: string
}

interface IncomingCallModalProps {
  onAccept: (callId: string, roomId: string) => void
  onDecline: (callId: string) => void
}

export function IncomingCallModal({ onAccept, onDecline }: IncomingCallModalProps) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Listen for incoming calls via WebSocket
    const signalingUrl = patientsEnv.signalingUrl
    if (!signalingUrl) return

    // Get current user ID from Supabase session
    const getCurrentUserId = async () => {
      try {
        const { createBrowserClient } = await import('@autamedica/auth')
        const supabase = createBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        return session?.user?.id
      } catch (error) {
        logger.error('Error getting user ID:', error)
        return null
      }
    }

    const setupWebSocket = async () => {
      const userId = await getCurrentUserId()
      if (!userId) {
        logger.warn('⚠️ No user ID available for WebSocket connection')
        return
      }

      try {
        const ws = new WebSocket(`${signalingUrl}?userId=${userId}&userType=patient`)

        ws.onopen = () => {
          // logger.info('🔗 Connected to signaling server as patient')
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            // logger.info('📞 Received signaling message:', message)

            // Handle incoming call invitation
            if (message.type === 'call-invitation') {
              const { callId, roomId, doctorId, doctorName } = message.data

              setIncomingCall({
                id: callId,
                roomId,
                doctorId,
                doctorName: doctorName || 'Doctor',
                timestamp: new Date().toISOString()
              })
              setIsVisible(true)

              // Auto-dismiss after 30 seconds
              setTimeout(() => {
                setIsVisible(false)
                setIncomingCall(null)
              }, 30000)
            }

            // Handle call cancellation
            if (message.type === 'call-cancelled') {
              setIsVisible(false)
              setIncomingCall(null)
            }

          } catch (error) {
            logger.error('Error parsing signaling message:', error)
          }
        }

        ws.onclose = (event) => {
          logger.info('🔌 Disconnected from signaling server', {
            code: event.code,
            reason: event.reason
          })
          // Only reconnect if it's not a permanent failure
          if (event.code !== 1000 && event.code !== 1001) {
            setTimeout(setupWebSocket, 5000)
          }
        }

        ws.onerror = (error) => {
          logger.warn('⚠️ WebSocket connection failed. Signaling server may be unavailable.', {
            url: signalingUrl,
            error: error
          })
        }

        return ws
      } catch (error) {
        logger.warn('⚠️ Failed to create WebSocket connection:', {
          url: signalingUrl,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    setupWebSocket()
  }, [])

  const handleAccept = async () => {
    if (!incomingCall) return

    try {
      // Update call status to 'accepted' via Edge Function
      const { createBrowserClient } = await import('@autamedica/auth')
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        logger.error('No session token available')
        return
      }

      const response = await fetch(`${patientsEnv.supabase.url}/functions/v1/update-call-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': patientsEnv.supabase.anonKey,
        },
        body: JSON.stringify({
          callId: incomingCall.id,
          status: 'accepted',
          reason: 'Patient accepted the call'
        })
      })

      if (response.ok) {
        // logger.info('✅ Call accepted successfully')

        // Close modal
        setIsVisible(false)

        // Navigate to call page
        router.push(`/call/${incomingCall.roomId}?callId=${incomingCall.id}`)

        // Notify parent component
        onAccept(incomingCall.id, incomingCall.roomId)
      } else {
        logger.error('❌ Failed to accept call:', await response.text())
      }

    } catch (error) {
      logger.error('❌ Error accepting call:', error)
    } finally {
      setIncomingCall(null)
    }
  }

  const handleDecline = async () => {
    if (!incomingCall) return

    try {
      // Update call status to 'declined' via Edge Function
      const { createBrowserClient } = await import('@autamedica/auth')
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        logger.error('No session token available')
        return
      }

      const response = await fetch(`${patientsEnv.supabase.url}/functions/v1/update-call-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': patientsEnv.supabase.anonKey,
        },
        body: JSON.stringify({
          callId: incomingCall.id,
          status: 'declined',
          reason: 'Patient declined the call'
        })
      })

      if (response.ok) {
        // logger.info('✅ Call declined successfully')

        // Notify parent component
        onDecline(incomingCall.id)
      } else {
        logger.error('❌ Failed to decline call:', await response.text())
      }

    } catch (error) {
      logger.error('❌ Error declining call:', error)
    } finally {
      setIsVisible(false)
      setIncomingCall(null)
    }
  }

  if (!isVisible || !incomingCall) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden animate-bounce">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Llamada Entrante</h2>
          <p className="text-blue-100 mt-1">Video consulta médica</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Dr. {incomingCall.doctorName}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Quiere iniciar una video consulta
            </p>
          </div>

          {/* Call Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 mb-1">ID de Llamada</div>
            <div className="font-mono text-sm text-gray-700 break-all">
              {incomingCall.id.substring(0, 8)}...
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDecline}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922c.05.062.105.118.168.167l6.91 6.911a1 1 0 001.415-1.414l-.675-.675a9.001 9.001 0 00-.668-11.982C14.729 1.1 12.486 0 10 0C7.515 0 5.271 1.1 3.636 2.636L3.707 2.293z" clipRule="evenodd" />
              </svg>
              <span>Rechazar</span>
            </button>

            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>Aceptar</span>
            </button>
          </div>

          {/* Timeout indicator */}
          <div className="mt-4 text-xs text-gray-500">
            La llamada se cancelará automáticamente en 30 segundos
          </div>
        </div>
      </div>
    </div>
  )
}
