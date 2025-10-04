'use client';

import { useEffect, useRef } from 'react';
import { UserCircle, VideoOff } from 'lucide-react';
import type { RemoteVideoStreamProps } from '@/types/telemedicine';

/**
 * Componente para mostrar el video remoto del médico (pantalla grande)
 * Incluye estados para: conectando, sin video, video activo
 */
export function RemoteVideoStream({
  remoteStream,
  isVideoEnabled,
  participantName = 'Médico',
  participantRole = 'Especialista',
  className = '',
}: RemoteVideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Asignar stream al elemento video cuando cambie
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-lg overflow-hidden ${className}`}>
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />

      {/* Video element */}
      {remoteStream && isVideoEnabled ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
        />
      ) : (
        /* Placeholder cuando no hay video */
        <RemoteVideoPlaceholder
          participantName={participantName}
          participantRole={participantRole}
          isConnecting={!!remoteStream && !isVideoEnabled}
        />
      )}

      {/* Overlay con nombre del participante */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <div className="text-left">
          <p className="text-sm font-semibold text-white">{participantName}</p>
          <p className="text-xs text-white/70">{participantRole}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder cuando el médico no tiene video activo
 */
function RemoteVideoPlaceholder({
  participantName,
  participantRole,
  isConnecting
}: {
  participantName: string;
  participantRole: string;
  isConnecting: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
      {isConnecting ? (
        <>
          {/* Estado: Conectando */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center animate-pulse">
              <UserCircle className="h-16 w-16 text-blue-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center animate-bounce">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1">{participantName}</p>
            <p className="text-sm text-white/70 mb-2">{participantRole}</p>
            <p className="text-xs text-blue-400">Conectando video...</p>
          </div>
        </>
      ) : (
        <>
          {/* Estado: Video desactivado */}
          <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
            <VideoOff className="h-12 w-12 text-white/60" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1">{participantName}</p>
            <p className="text-sm text-white/70 mb-2">{participantRole}</p>
            <p className="text-xs text-white/50">Esperando conexión...</p>
          </div>
        </>
      )}
    </div>
  );
}
