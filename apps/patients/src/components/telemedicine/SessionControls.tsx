'use client'

import { useState } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MonitorOff,
  Settings,
  MessageSquare,
} from 'lucide-react'

export interface SessionControlsProps {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  isChatOpen: boolean
  onToggleVideo: () => void | Promise<void>
  onToggleAudio: () => void | Promise<void>
  onToggleScreenShare: () => void | Promise<void>
  onToggleChat: () => void
  onEndCall: () => void | Promise<void>
  onSettings?: () => void
  disabled?: boolean
  className?: string
}

/**
 * SessionControls - Barra de controles de videoconsulta
 *
 * Controles principales:
 * - Video: Toggle cámara
 * - Audio: Toggle micrófono
 * - Screen Share: Compartir pantalla
 * - Chat: Abrir/cerrar panel de mensajes
 * - Settings: Configuración de dispositivos
 * - End Call: Finalizar llamada (botón rojo)
 *
 * @example
 * <SessionControls
 *   isVideoEnabled={true}
 *   isAudioEnabled={true}
 *   isScreenSharing={false}
 *   isChatOpen={false}
 *   onToggleVideo={handleToggleVideo}
 *   onToggleAudio={handleToggleAudio}
 *   onToggleScreenShare={handleScreenShare}
 *   onToggleChat={() => setChatOpen(!chatOpen)}
 *   onEndCall={handleEndCall}
 * />
 */
export function SessionControls({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isChatOpen,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleChat,
  onEndCall,
  onSettings,
  disabled = false,
  className = '',
}: SessionControlsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleAsyncAction = async (action: () => void | Promise<void>, id: string) => {
    if (disabled || isLoading) return
    setIsLoading(id)
    try {
      await action()
    } finally {
      setIsLoading(null)
    }
  }

  const btnBase = 'relative p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  const btnActive = 'bg-blue-600 hover:bg-blue-700 text-white'
  const btnInactive = 'bg-gray-700 hover:bg-gray-600 text-gray-300'
  const btnDanger = 'bg-red-600 hover:bg-red-700 text-white'

  return (
    <div className={`flex items-center justify-center gap-3 p-4 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl ${className}`}>
      {/* Video Toggle */}
      <button
        onClick={() => handleAsyncAction(onToggleVideo, 'video')}
        disabled={disabled || isLoading !== null}
        className={`${btnBase} ${isVideoEnabled ? btnActive : btnInactive}`}
        title={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
        aria-label={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
      >
        {isLoading === 'video' ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isVideoEnabled ? (
          <Video className="w-6 h-6" />
        ) : (
          <VideoOff className="w-6 h-6" />
        )}
      </button>

      {/* Audio Toggle */}
      <button
        onClick={() => handleAsyncAction(onToggleAudio, 'audio')}
        disabled={disabled || isLoading !== null}
        className={`${btnBase} ${isAudioEnabled ? btnActive : btnInactive}`}
        title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
        aria-label={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
      >
        {isLoading === 'audio' ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isAudioEnabled ? (
          <Mic className="w-6 h-6" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={() => handleAsyncAction(onToggleScreenShare, 'screen')}
        disabled={disabled || isLoading !== null}
        className={`${btnBase} ${isScreenSharing ? btnActive : btnInactive}`}
        title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
        aria-label={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
      >
        {isLoading === 'screen' ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isScreenSharing ? (
          <MonitorOff className="w-6 h-6" />
        ) : (
          <MonitorUp className="w-6 h-6" />
        )}
      </button>

      {/* Chat Toggle */}
      <button
        onClick={onToggleChat}
        disabled={disabled}
        className={`${btnBase} ${isChatOpen ? btnActive : btnInactive}`}
        title={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
        aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Settings (optional) */}
      {onSettings && (
        <button
          onClick={onSettings}
          disabled={disabled}
          className={`${btnBase} ${btnInactive}`}
          title="Configuración"
          aria-label="Configuración"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {/* Divider */}
      <div className="w-px h-10 bg-gray-700 mx-2" />

      {/* End Call */}
      <button
        onClick={() => handleAsyncAction(onEndCall, 'endCall')}
        disabled={disabled || isLoading !== null}
        className={`${btnBase} ${btnDanger} px-6`}
        title="Finalizar llamada"
        aria-label="Finalizar llamada"
      >
        {isLoading === 'endCall' ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <PhoneOff className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}
