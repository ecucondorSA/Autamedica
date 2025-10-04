import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
} from 'lucide-react';
import type { VideoControlsProps, ControlButtonProps } from '@/types/telemedicine';

/**
 * Barra de controles de videollamada
 * Muestra botones para: audio, video, compartir pantalla, colgar
 */
export function VideoControls({
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  showControls,
  isFocusMode,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
}: VideoControlsProps) {
  return (
    <div className={`${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-300`}>
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/20 bg-black/70 px-4 py-3 shadow-xl backdrop-blur-md sm:flex-nowrap sm:px-6">
        {/* Micrófono */}
        <ControlButton
          active={!isMuted}
          iconActive={<Mic className="h-5 w-5" />}
          iconInactive={<MicOff className="h-5 w-5" />}
          label={isMuted ? 'Activar micrófono' : 'Silenciar'}
          onClick={onToggleAudio}
          size={isFocusMode ? 'sm' : 'md'}
        />

        {/* Video */}
        <ControlButton
          active={isVideoEnabled}
          iconActive={<Video className="h-5 w-5" />}
          iconInactive={<VideoOff className="h-5 w-5" />}
          label={isVideoEnabled ? 'Ocultar video' : 'Mostrar video'}
          onClick={onToggleVideo}
          size={isFocusMode ? 'sm' : 'md'}
        />

        {/* Compartir pantalla */}
        <ControlButton
          active={isScreenSharing}
          iconActive={<ScreenShare className="h-5 w-5" />}
          iconInactive={<ScreenShareOff className="h-5 w-5" />}
          label={isScreenSharing ? 'Detener pantalla' : 'Compartir pantalla'}
          onClick={onToggleScreenShare}
          size={isFocusMode ? 'sm' : 'md'}
        />

        {/* Colgar */}
        <button
          type="button"
          onClick={onEndCall}
          className={`flex items-center justify-center rounded-full bg-red-600 text-white transition-all hover:bg-red-500 hover:scale-110 ${
            isFocusMode ? 'h-10 w-10' : 'h-12 w-12'
          }`}
          aria-label="Terminar llamada"
          title="Terminar llamada"
        >
          <PhoneOff className={isFocusMode ? 'h-4 w-4' : 'h-5 w-5'} />
        </button>
      </div>
    </div>
  );
}

/**
 * Botón individual de control
 */
function ControlButton({ active, iconActive, iconInactive, label, onClick, size = 'md' }: ControlButtonProps) {
  const sizeClasses = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition-all ${sizeClasses} ${
        active
          ? 'bg-stone-600 text-white shadow-lg shadow-stone-600/30 hover:bg-stone-500'
          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
      }`}
      aria-label={label}
      title={label}
    >
      {active ? iconActive : iconInactive}
    </button>
  );
}
