import { Activity, ScreenShare } from 'lucide-react';
import type { VideoOverlaysProps } from '@/types/telemedicine';

/**
 * Overlays y badges sobre el video:
 * - Badge de información del doctor
 * - Indicador de calidad
 * - Indicador de screen share
 * - Botón de modo foco
 */
export function VideoOverlays({
  callStatus,
  callQuality,
  isScreenSharing,
  isFocusMode,
  showControls,
  showQualityOverlay,
  currentSession,
  formattedDuration,
  onToggleFocusMode,
}: VideoOverlaysProps) {
  return (
    <>
      {/* Badge de información del doctor (modo foco) */}
      {isFocusMode && currentSession && callStatus === 'live' && showControls && (
        <div className="absolute left-4 top-4 z-10">
          <div className="flex items-center gap-3 rounded-lg bg-black/70 px-3 py-2 backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Dr. {currentSession.doctorName}
                </p>
                <p className="text-[10px] text-white/70">
                  {currentSession.appointmentType} • {formattedDuration || '00:00'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium ${callQuality.color}`}>
                {callQuality.label}
              </span>
              <span className="text-[10px] text-white/50">• 45ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de calidad (al inicio de la llamada) */}
      {showQualityOverlay && callStatus === 'live' && !isFocusMode && (
        <div className={`absolute top-4 left-4 transition-all duration-1000 ${
          showQualityOverlay ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}>
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <span className="font-medium text-green-200">
              {callQuality.label} • 45ms • Estable
            </span>
          </div>
        </div>
      )}

      {/* Indicador de screen share */}
      {isScreenSharing && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md shadow-lg">
          <ScreenShare className="h-4 w-4" />
          Compartiendo pantalla
        </div>
      )}

      {/* Botón de modo foco */}
      <div className="absolute right-4 top-4">
        {callStatus === 'live' && (
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
              isFocusMode
                ? 'border-green-400/50 bg-green-500/20 text-green-200 hover:bg-green-500/30 shadow-lg shadow-green-500/20'
                : 'border-white/30 bg-black/50 text-white hover:border-green-400/60 hover:text-white backdrop-blur-md'
            }`}
          >
            {isFocusMode ? '✕ Salir modo foco' : '🎯 Modo foco'}
          </button>
        )}
      </div>
    </>
  );
}
