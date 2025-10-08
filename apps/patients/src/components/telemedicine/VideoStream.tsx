import { Camera, VideoOff, Loader2 } from 'lucide-react';
import type { VideoStreamProps } from '@/types/telemedicine';

/**
 * Componente que renderiza el stream de video con sus diferentes estados:
 * - Idle: Sin video, botón para iniciar
 * - Connecting: Cargando conexión
 * - Error: Error de cámara con botón de reintentar
 * - Live: Video activo
 */
export function VideoStream({
  videoRef,
  screenShareRef,
  localStream,
  screenStream,
  isVideoEnabled,
  cameraError,
  callStatus,
  onStartCall,
}: VideoStreamProps) {
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg">
      {/* Background con imagen médica disfuminada */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-2xl scale-110"
        style={{
          backgroundImage: 'url(/images/telemedicine-background.png)',
          filter: 'brightness(0.4)'
        }}
      ></div>

      {/* Overlay adicional para mejor contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900/80 via-stone-800/60 to-stone-900/80"></div>

      {/* Contenido sobre el background */}
      <div className="relative z-10 flex min-h-0 flex-1">
      {/* Estado: Error de cámara */}
      {cameraError ? (
        <CameraError error={cameraError} onRetry={onStartCall} />
      ) : localStream ? (
        /* Estado: Video activo */
        <video
          ref={videoRef}
          className={`call-area__video h-full w-full object-cover transition-opacity ${
            isVideoEnabled ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          playsInline
          muted
        />
      ) : (
        /* Estado: Inicial - Sin cámara */
        <IdleState onStart={onStartCall} />
      )}

      {/* Overlay: Conectando */}
      {callStatus === 'connecting' && <ConnectingOverlay />}

      {/* Preview: Screen share (hidden on small screens) */}
      {screenStream && (
        <div className="absolute right-4 top-4 hidden h-32 w-48 overflow-hidden rounded-lg border border-white/30 bg-black/50 shadow-lg sm:block backdrop-blur-sm z-20">
          <video ref={screenShareRef} className="h-full w-full object-cover" autoPlay muted playsInline />
        </div>
      )}
      </div>
    </div>
  );
}

/**
 * Estado inicial: sin video activo
 */
function IdleState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-4 py-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white/60 ring-2 ring-white/20">
        <Camera className="h-12 w-12" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Videoconsulta</h3>
        <p className="text-sm text-white/70 max-w-xs">Inicia tu consulta médica por video con tu especialista</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 rounded-lg bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
      >
        Iniciar videoconsulta
      </button>
    </div>
  );
}

/**
 * Estado de error: cámara no disponible
 */
function CameraError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-black/90 backdrop-blur-sm px-4 py-6 text-center text-white">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-400 ring-2 ring-red-500/50">
        <VideoOff className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-semibold text-white">No se detectó cámara</h3>
      <p className="max-w-md text-sm text-white/70">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg bg-white/20 hover:bg-white/30 px-5 py-2.5 text-sm font-semibold text-white transition backdrop-blur-sm border border-white/20"
      >
        Reintentar conexión
      </button>
    </div>
  );
}

/**
 * Overlay de conexión
 */
function ConnectingOverlay() {
  return (
    <div className="absolute inset-0 flex h-full flex-col items-center justify-center gap-3 bg-black/70 text-white backdrop-blur-md">
      <Loader2 className="h-10 w-10 animate-spin text-stone-400" />
      <p className="text-sm font-medium">Conectando videollamada…</p>
      <p className="text-xs text-white/60">Esto puede tomar unos segundos</p>
    </div>
  );
}
