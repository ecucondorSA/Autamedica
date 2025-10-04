'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebRTCClient, type ConnectionState, type MediaConstraints } from '@autamedica/telemedicine'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Users } from 'lucide-react'

interface VideoCallComponentProps {
  roomId: string
  userId: string
  userType: 'doctor' | 'patient' | 'nurse'
  onCallEnd?: () => void
}

interface RemoteUser {
  userId: string
  userType: string
  stream?: MediaStream
}

export function VideoCallComponent({ roomId, userId, userType, onCallEnd }: VideoCallComponentProps) {
  // WebRTC client state
  const [client, setClient] = useState<WebRTCClient | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map())

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Initialize WebRTC client
  useEffect(() => {
    const webrtcClient = new WebRTCClient({
      userId,
      userType,
      roomId
    })

    // Set up event listeners
    webrtcClient.on('connection-state', (state) => {
      setConnectionState(state)
      // console.log('Connection state changed:', state)
    })

    webrtcClient.on('local-stream', (stream) => {
      // console.log('Got local stream')
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    })

    webrtcClient.on('remote-stream', (stream, remoteUserId) => {
      // console.log('Got remote stream from:', remoteUserId)

      setRemoteUsers(prev => {
        const updated = new Map(prev)
        const existingUser = updated.get(remoteUserId) || { userId: remoteUserId, userType: 'unknown' }
        updated.set(remoteUserId, { ...existingUser, stream })
        return updated
      })

      // Set video element source
      const videoElement = remoteVideosRef.current.get(remoteUserId)
      if (videoElement) {
        videoElement.srcObject = stream
      }
    })

    webrtcClient.on('user-joined', (remoteUserId, remoteUserType) => {
      // console.log('User joined:', remoteUserId, remoteUserType)
      setRemoteUsers(prev => {
        const updated = new Map(prev)
        const existingUser = updated.get(remoteUserId)
        updated.set(remoteUserId, {
          userId: remoteUserId,
          userType: remoteUserType,
          stream: existingUser?.stream
        })
        return updated
      })
    })

    webrtcClient.on('user-left', (remoteUserId) => {
      // console.log('User left:', remoteUserId)
      setRemoteUsers(prev => {
        const updated = new Map(prev)
        updated.delete(remoteUserId)
        return updated
      })
      remoteVideosRef.current.delete(remoteUserId)
    })

    webrtcClient.on('error', (error) => {
      console.error('WebRTC error:', error)
      // Could show error toast here
    })

    setClient(webrtcClient)

    return () => {
      webrtcClient.disconnect()
    }
  }, [userId, userType, roomId])

  // Start call
  const startCall = useCallback(async () => {
    if (!client) return

    try {
      await client.connect()

      // Start local stream
      const constraints: MediaConstraints = {
        video: true,
        audio: true
      }
      await client.startLocalStream(constraints)

    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }, [client])

  // End call
  const endCall = useCallback(async () => {
    if (!client) return

    try {
      await client.disconnect()
      onCallEnd?.()
    } catch (error) {
      console.error('Failed to end call:', error)
    }
  }, [client, onCallEnd])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!client) return

    const newState = client.toggleVideo()
    setIsVideoEnabled(newState)
  }, [client])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!client) return

    const newState = client.toggleAudio()
    setIsAudioEnabled(newState)
  }, [client])

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

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionState === 'connected' ? 'bg-green-500' :
              connectionState === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionState === 'connected' ? 'Connected' :
               connectionState === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{remoteUsers.size + 1} participants</span>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Room: {roomId}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`h-full grid gap-4 ${
          remoteUsers.size === 0 ? 'grid-cols-1' :
          remoteUsers.size === 1 ? 'grid-cols-2' :
          'grid-cols-2 grid-rows-2'
        }`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
              You ({userType})
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {Array.from(remoteUsers.entries()).map(([userId, user]) => {
            return (
              <div key={userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideosRef.current.set(userId, el)
                      if (user.stream) {
                        el.srcObject = user.stream
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                  {userId} ({user.userType})
                </div>
              </div>
            )
          })}

          {/* Empty slots */}
          {remoteUsers.size === 0 && (
            <div className="bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p>Waiting for others to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-gray-600 hover:bg-gray-500'
                : 'bg-red-600 hover:bg-red-500'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-gray-600 hover:bg-gray-500'
                : 'bg-red-600 hover:bg-red-500'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Start/End Call */}
          {connectionState === 'disconnected' ? (
            <button
              onClick={startCall}
              className="p-3 bg-green-600 hover:bg-green-500 rounded-full transition-colors"
              title="Start call"
            >
              <Phone className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={endCall}
              className="p-3 bg-red-600 hover:bg-red-500 rounded-full transition-colors"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}