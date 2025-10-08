'use client';

import { useState } from 'react';
import { Maximize, Grid3x3, Sidebar } from 'lucide-react';
import { RemoteVideoStream } from './RemoteVideoStream';
import { LocalVideoPIP } from './LocalVideoPIP';
import { VideoQualityIndicator } from './VideoQualityIndicator';
import type { VideoLayoutProps, VideoViewMode, PIPPosition } from '@/types/telemedicine';

/**
 * Layout maestro para videoconsultas con 2 participantes
 *
 * Modos de visualización:
 * - speaker: Video grande del médico + PIP del paciente (default)
 * - grid: Ambos videos del mismo tamaño lado a lado
 * - sidebar: Médico grande a la izquierda, paciente sidebar derecha
 *
 * Features:
 * - Swap videos (intercambiar grande ↔ pequeño)
 * - Cambiar modo de visualización
 * - PIP draggable a 4 esquinas
 * - Indicadores de calidad
 * - Responsive
 */
export function VideoLayout({
  localStream,
  remoteStream,
  isLocalVideoEnabled,
  isRemoteVideoEnabled,
  viewMode = 'speaker',
  pipPosition = 'bottom-right',
  onSwapVideos,
  onPIPPositionChange,
  className = '',
}: VideoLayoutProps) {
  const [isSwapped, setIsSwapped] = useState(false);

  // Handler para intercambiar videos
  const handleSwap = () => {
    setIsSwapped(!isSwapped);
    onSwapVideos();
  };

  // Renderizar según modo de visualización
  switch (viewMode) {
    case 'grid':
      return (
        <GridLayout
          localStream={localStream}
          remoteStream={remoteStream}
          isLocalVideoEnabled={isLocalVideoEnabled}
          isRemoteVideoEnabled={isRemoteVideoEnabled}
          className={className}
        />
      );

    case 'sidebar':
      return (
        <SidebarLayout
          localStream={localStream}
          remoteStream={remoteStream}
          isLocalVideoEnabled={isLocalVideoEnabled}
          isRemoteVideoEnabled={isRemoteVideoEnabled}
          isSwapped={isSwapped}
          className={className}
        />
      );

    case 'speaker':
    default:
      return (
        <SpeakerLayout
          localStream={localStream}
          remoteStream={remoteStream}
          isLocalVideoEnabled={isLocalVideoEnabled}
          isRemoteVideoEnabled={isRemoteVideoEnabled}
          isSwapped={isSwapped}
          pipPosition={pipPosition}
          onSwap={handleSwap}
          onPIPPositionChange={onPIPPositionChange}
          className={className}
        />
      );
  }
}

/**
 * Layout Speaker: Video grande + PIP pequeño (DEFAULT)
 */
function SpeakerLayout({
  localStream,
  remoteStream,
  isLocalVideoEnabled,
  isRemoteVideoEnabled,
  isSwapped,
  pipPosition,
  onSwap,
  onPIPPositionChange,
  className,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isLocalVideoEnabled: boolean;
  isRemoteVideoEnabled: boolean;
  isSwapped: boolean;
  pipPosition: PIPPosition;
  onSwap: () => void;
  onPIPPositionChange: (pos: PIPPosition) => void;
  className: string;
}) {
  // Si está swapped, invertir cuál es grande y cuál es PIP
  const mainStream = isSwapped ? localStream : remoteStream;
  const mainVideoEnabled = isSwapped ? isLocalVideoEnabled : isRemoteVideoEnabled;
  const mainParticipantName = isSwapped ? 'Tú (Paciente)' : 'Dr. García';
  const mainParticipantRole = isSwapped ? 'Paciente' : 'Médico Especialista';

  const pipStream = isSwapped ? remoteStream : localStream;
  const pipVideoEnabled = isSwapped ? isRemoteVideoEnabled : isLocalVideoEnabled;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Video principal (fullscreen) */}
      <RemoteVideoStream
        remoteStream={mainStream}
        isVideoEnabled={mainVideoEnabled}
        participantName={mainParticipantName}
        participantRole={mainParticipantRole}
        className="absolute inset-0"
      />

      {/* PIP (flotante en esquina) */}
      <LocalVideoPIP
        localStream={pipStream}
        isVideoEnabled={pipVideoEnabled}
        position={pipPosition}
        isDraggable
        onPositionChange={onPIPPositionChange}
        onSwap={onSwap}
      />

      {/* Indicador de calidad (top center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <VideoQualityIndicator
          quality="auto"
          bitrate={1200}
          latency={45}
          packetLoss={0.5}
        />
      </div>
    </div>
  );
}

/**
 * Layout Grid: Ambos videos del mismo tamaño
 */
function GridLayout({
  localStream,
  remoteStream,
  isLocalVideoEnabled,
  isRemoteVideoEnabled,
  className,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isLocalVideoEnabled: boolean;
  isRemoteVideoEnabled: boolean;
  className: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 h-full ${className}`}>
      {/* Video del médico */}
      <RemoteVideoStream
        remoteStream={remoteStream}
        isVideoEnabled={isRemoteVideoEnabled}
        participantName="Dr. García"
        participantRole="Médico Especialista"
      />

      {/* Video del paciente */}
      <RemoteVideoStream
        remoteStream={localStream}
        isVideoEnabled={isLocalVideoEnabled}
        participantName="Tú (Paciente)"
        participantRole="Paciente"
      />
    </div>
  );
}

/**
 * Layout Sidebar: Principal a la izquierda, secundario sidebar derecha
 */
function SidebarLayout({
  localStream,
  remoteStream,
  isLocalVideoEnabled,
  isRemoteVideoEnabled,
  isSwapped,
  className,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isLocalVideoEnabled: boolean;
  isRemoteVideoEnabled: boolean;
  isSwapped: boolean;
  className: string;
}) {
  const mainStream = isSwapped ? localStream : remoteStream;
  const mainVideoEnabled = isSwapped ? isLocalVideoEnabled : isRemoteVideoEnabled;
  const mainName = isSwapped ? 'Tú (Paciente)' : 'Dr. García';
  const mainRole = isSwapped ? 'Paciente' : 'Médico Especialista';

  const sideStream = isSwapped ? remoteStream : localStream;
  const sideVideoEnabled = isSwapped ? isRemoteVideoEnabled : isLocalVideoEnabled;
  const sideName = isSwapped ? 'Dr. García' : 'Tú (Paciente)';
  const sideRole = isSwapped ? 'Médico Especialista' : 'Paciente';

  return (
    <div className={`flex gap-4 h-full ${className}`}>
      {/* Video principal (2/3 del ancho) */}
      <div className="flex-1">
        <RemoteVideoStream
          remoteStream={mainStream}
          isVideoEnabled={mainVideoEnabled}
          participantName={mainName}
          participantRole={mainRole}
        />
      </div>

      {/* Sidebar (1/3 del ancho) */}
      <div className="w-80 hidden lg:block">
        <RemoteVideoStream
          remoteStream={sideStream}
          isVideoEnabled={sideVideoEnabled}
          participantName={sideName}
          participantRole={sideRole}
        />
      </div>
    </div>
  );
}

/**
 * Selector de modo de visualización (para agregar al toolbar)
 */
export function ViewModeSelector({
  currentMode,
  onChange,
}: {
  currentMode: VideoViewMode;
  onChange: (mode: VideoViewMode) => void;
}) {
  const modes: { value: VideoViewMode; icon: React.ReactNode; label: string }[] = [
    { value: 'speaker', icon: <Maximize className="h-4 w-4" />, label: 'Speaker' },
    { value: 'grid', icon: <Grid3x3 className="h-4 w-4" />, label: 'Grid' },
    { value: 'sidebar', icon: <Sidebar className="h-4 w-4" />, label: 'Sidebar' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`p-2 rounded-md transition-all ${
            currentMode === mode.value
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={mode.label}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
}
