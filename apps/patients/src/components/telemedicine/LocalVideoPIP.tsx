'use client';

import { useEffect, useRef, useState } from 'react';
import { UserCircle, Maximize2, Move } from 'lucide-react';
import type { LocalVideoPIPProps, PIPPosition } from '@/types/telemedicine';

/**
 * Picture-in-Picture del video local del paciente
 * Features:
 * - Posicionamiento en 4 esquinas
 * - Draggable (opcional)
 * - Click para intercambiar con video principal
 * - Responsive
 */
export function LocalVideoPIP({
  localStream,
  isVideoEnabled,
  position = 'bottom-right',
  isDraggable = true,
  onPositionChange,
  onSwap,
  className = '',
}: LocalVideoPIPProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Asignar stream al video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Posicionamiento CSS según esquina seleccionada
  const positionClasses: Record<PIPPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Handlers de drag (simplificado - solo cambia de esquina)
  const handleDragStart = () => {
    if (isDraggable) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Ciclar entre posiciones con click derecho
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onPositionChange) return;

    const positions: PIPPosition[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    onPositionChange(positions[nextIndex]);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute z-30 ${positionClasses[position]} ${className}`}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`
          group relative w-48 h-36 rounded-lg overflow-hidden
          border-2 border-white/30 shadow-2xl
          transition-all duration-200
          ${isDragging ? 'scale-105 ring-4 ring-blue-500/50' : 'hover:scale-105'}
          ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
        `}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onClick={onSwap}
        title={onSwap ? 'Click para intercambiar' : 'Tu video'}
      >
        {/* Video element */}
        {localStream && isVideoEnabled ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            autoPlay
            playsInline
            muted
          />
        ) : (
          /* Placeholder sin video */
          <LocalVideoPlaceholder />
        )}

        {/* Overlay con controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Badge "Tú" en la esquina superior */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white">Tú</p>
          </div>

          {/* Iconos de acción */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {onSwap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap();
                }}
                className="p-1.5 rounded bg-black/70 backdrop-blur-sm hover:bg-black/90 transition"
                title="Intercambiar videos"
              >
                <Maximize2 className="h-3 w-3 text-white" />
              </button>
            )}
            {isDraggable && (
              <div className="p-1.5 rounded bg-black/70 backdrop-blur-sm" title="Arrastra para mover">
                <Move className="h-3 w-3 text-white/70" />
              </div>
            )}
          </div>
        </div>

        {/* Indicador de drag activo */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
            <Move className="h-8 w-8 text-white animate-pulse" />
          </div>
        )}
      </div>

      {/* Hint de cambio de posición (solo desktop) */}
      {isDraggable && !isDragging && (
        <div className="hidden md:block absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/50 whitespace-nowrap">
          Click derecho para cambiar posición
        </div>
      )}
    </div>
  );
}

/**
 * Placeholder cuando el video local está desactivado
 */
function LocalVideoPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-700 to-stone-900 text-white">
      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/20">
        <UserCircle className="h-8 w-8 text-white/60" />
      </div>
      <p className="text-xs text-white/70">Video desactivado</p>
    </div>
  );
}
