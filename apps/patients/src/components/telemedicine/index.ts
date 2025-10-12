/**
 * Telemedicine Components - Componentes para videoconsulta
 *
 * Suite completa de componentes React para implementar videollamadas
 * médicas con WebRTC/LiveKit
 */

// Main video call component
export { EnhancedVideoCall } from './EnhancedVideoCall'

// Session controls
export { SessionControls } from './SessionControls'
export type { SessionControlsProps } from './SessionControls'

// Participant management
export { ParticipantGrid } from './ParticipantGrid'
export type { Participant, ParticipantGridProps } from './ParticipantGrid'

// Chat functionality
export { ChatPanel } from './ChatPanel'
export type { ChatMessage, ChatPanelProps } from './ChatPanel'

// Session stats and connection quality
export { SessionStats, ConnectionBadge } from './SessionStats'
export type { SessionStatsProps } from './SessionStats'
