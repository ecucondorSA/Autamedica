import { useState, useCallback, useEffect } from 'react'
import type { WebRTCClient } from '../webrtc-client'

export interface MediaControlsState {
  isMicOn: boolean
  isCamOn: boolean
  isSharing: boolean
  hasLocalStream: boolean
  mediaError: Error | null
}

export interface MediaControlsActions {
  toggleMic: (enabled?: boolean) => boolean
  toggleCam: (enabled?: boolean) => boolean
  startShare: () => Promise<void>
  stopShare: () => void
  refreshMediaState: () => void
}

export type MediaControlsHook = MediaControlsState & MediaControlsActions

export function useMediaControls(client: WebRTCClient | null): MediaControlsHook {
  const [state, setState] = useState<MediaControlsState>({
    isMicOn: false,
    isCamOn: false,
    isSharing: false,
    hasLocalStream: false,
    mediaError: null
  })

  // Refresh media state from client
  const refreshMediaState = useCallback(() => {
    if (!client) {
      setState({
        isMicOn: false,
        isCamOn: false,
        isSharing: false,
        hasLocalStream: false,
        mediaError: null
      })
      return
    }

    const localStream = client.getLocalStream()
    const hasStream = !!localStream

    setState(prev => ({
      ...prev,
      isMicOn: hasStream ? client.isAudioEnabled() : false,
      isCamOn: hasStream ? client.isVideoEnabled() : false,
      hasLocalStream: hasStream,
      mediaError: null
    }))
  }, [client])

  // Update state when client changes
  useEffect(() => {
    refreshMediaState()
  }, [client, refreshMediaState])

  // Monitor local stream changes
  useEffect(() => {
    if (!client) return

    const handleLocalStream = () => {
      refreshMediaState()
    }

    const handleError = (error: Error) => {
      setState(prev => ({ ...prev, mediaError: error }))
    }

    client.on('local-stream', handleLocalStream)
    client.on('error', handleError)

    return () => {
      client.off('local-stream', handleLocalStream)
      client.off('error', handleError)
    }
  }, [client, refreshMediaState])

  // Toggle microphone
  const toggleMic = useCallback((enabled?: boolean): boolean => {
    if (!client) {
      console.warn('[useMediaControls] No client available for mic toggle')
      return false
    }

    try {
      const newState = client.toggleAudio(enabled)
      setState(prev => ({ ...prev, isMicOn: newState, mediaError: null }))
      console.log(`[useMediaControls] Microphone ${newState ? 'enabled' : 'disabled'}`)
      return newState
    } catch (error) {
      const mediaError = error instanceof Error ? error : new Error('Failed to toggle microphone')
      setState(prev => ({ ...prev, mediaError }))
      console.error('[useMediaControls] Failed to toggle microphone:', error)
      return false
    }
  }, [client])

  // Toggle camera
  const toggleCam = useCallback((enabled?: boolean): boolean => {
    if (!client) {
      console.warn('[useMediaControls] No client available for camera toggle')
      return false
    }

    try {
      const newState = client.toggleVideo(enabled)
      setState(prev => ({ ...prev, isCamOn: newState, mediaError: null }))
      console.log(`[useMediaControls] Camera ${newState ? 'enabled' : 'disabled'}`)
      return newState
    } catch (error) {
      const mediaError = error instanceof Error ? error : new Error('Failed to toggle camera')
      setState(prev => ({ ...prev, mediaError }))
      console.error('[useMediaControls] Failed to toggle camera:', error)
      return false
    }
  }, [client])

  // Start screen sharing
  const startShare = useCallback(async (): Promise<void> => {
    if (!client) {
      throw new Error('No client available for screen sharing')
    }

    try {
      setState(prev => ({ ...prev, mediaError: null }))

      // Check if getDisplayMedia is available
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser')
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - mediaSource is supported in getDisplayMedia
        mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      })

      setState(prev => ({ ...prev, isSharing: true }))
      console.log('[useMediaControls] Screen sharing started')

      // Handle when user stops screen sharing via browser UI
      const videoTrack = screenStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          setState(prev => ({ ...prev, isSharing: false }))
          console.log('[useMediaControls] Screen sharing ended by user')
        }
      }

      // TODO: Integrate screen stream with WebRTC client
      // This might require extending the WebRTCClient to handle screen sharing
      // For now, we just track the state

    } catch (error) {
      const mediaError = error instanceof Error ? error : new Error('Failed to start screen sharing')
      setState(prev => ({ ...prev, mediaError, isSharing: false }))
      console.error('[useMediaControls] Failed to start screen sharing:', error)
      throw error
    }
  }, [client])

  // Stop screen sharing
  const stopShare = useCallback((): void => {
    setState(prev => ({ ...prev, isSharing: false, mediaError: null }))
    console.log('[useMediaControls] Screen sharing stopped')

    // TODO: Stop screen stream in WebRTC client
    // This would require client.stopScreenShare() or similar
  }, [])

  return {
    ...state,
    toggleMic,
    toggleCam,
    startShare,
    stopShare,
    refreshMediaState
  }
}