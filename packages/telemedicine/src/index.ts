// WebRTC Core
export { WebRTCClient } from './webrtc-client'
export type { WebRTCConfig, WebRTCEvents } from './webrtc-client'

// Alias for TelemedicineClient (used in hooks)
export { WebRTCClient as TelemedicineClient } from './webrtc-client'

export { HttpWebRTCClient } from './http-webrtc-client'

// UI Components
export { UnifiedVideoCall } from './unified-video-call'
export type { UnifiedVideoCallProps } from './unified-video-call'

// Types
export type { SignalKind, Signal } from './types'
export { isSignal } from './types'

// Hooks
export { useTelemedicineClient, useMediaControls, useRtcStats } from './hooks'
export type {
  TelemedicineClientHook,
  MediaControlsHook,
  RtcStatsHook,
  RtcStatsData
} from './hooks'

// Signaling
export { createSignalingTransport, createSignalingTransportFromEnv } from './signaling'
export type { SignalingTransport, SignalingConfig, SignalingImplementation } from './signaling'

// Configuration
export { getIceServersConfig, validateIceServersConfig } from './config'
export type { IceServerConfig } from './config'

// Re-export common types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed' | 'closed'
export type MediaConstraints = {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

// Telemedicine types for signaling
export type TelemedicineRole = 'doctor' | 'patient' | 'nurse' | 'unknown'

export interface OfferMessage {
  from: string
  to?: string
  data: RTCSessionDescriptionInit
}

export interface AnswerMessage {
  from: string
  to?: string
  data: RTCSessionDescriptionInit
}

export interface IceCandidateMessage {
  from: string
  to?: string
  data: RTCIceCandidateInit
}
