'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useLocalParticipant,
  useTracks
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Room, Track } from 'livekit-client';

import { logger } from '@autamedica/shared';
interface DoctorVideoConsultationProps {
  consultationId: string;
  patientId: string;
  doctorId: string;
  onEnd?: () => void;
}

interface ConsultationData {
  success: boolean;
  data: {
    consultationId: string;
    roomName: string;
    roomSid: string;
    patientId: string;
    doctorId: string;
    patientToken: string;
    doctorToken: string;
    livekitUrl: string;
    createdAt: string;
  };
}

// Componente interno para controles médicos avanzados
function DoctorControls() {
  const { localParticipant } = useLocalParticipant();
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const toggleScreenShare = async () => {
    if (!localParticipant) return;

    try {
      const enabled = await localParticipant.setScreenShareEnabled(!isScreenSharing);
      setIsScreenSharing(enabled);
    } catch (error) {
      console.error('Error toggling screen share:', error);
      alert('No se pudo compartir la pantalla. Verifica los permisos.');
    }
  };

  const startRecording = async () => {
    // TODO: Implementar cuando S3 esté configurado
    console.log('Recording requested - S3 configuration needed');
    setIsRecording(true);
    alert('Grabación iniciada (mock - requiere configuración S3)');
  };

  const stopRecording = async () => {
    setIsRecording(false);
    alert('Grabación detenida');
  };

  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl">
      <h3 className="text-white font-semibold mb-3 text-sm">Controles Médicos</h3>

      <div className="space-y-2">
        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {isScreenSharing ? '🖥️ Detener Compartir' : '🖥️ Compartir Pantalla'}
        </button>

        {/* Recording Toggle */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {isRecording ? '⏹️ Detener Grabación' : '⏺️ Grabar Consulta'}
        </button>

        {/* Patient Info Quick Access */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-xs text-gray-400 mb-1">Paciente:</p>
          <p className="text-sm text-white font-medium truncate">{localParticipant?.identity || 'Conectando...'}</p>
        </div>
      </div>
    </div>
  );
}

export function DoctorVideoConsultation({
  consultationId,
  patientId,
  doctorId,
  onEnd
}: DoctorVideoConsultationProps) {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeConsultation() {
      try {
        setIsLoading(true);

        // Crear sala de consulta en el backend
        const response = await fetch('http://localhost:8888/api/consultations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consultationId,
            patientId,
            doctorId,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al crear la sala de consulta');
        }

        const data: ConsultationData = await response.json();
        setConsultationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error initializing consultation:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConsultation();
  }, [consultationId, patientId, doctorId]);

  const handleDisconnect = () => {
    console.log('Doctor disconnected from consultation room');
    onEnd?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Preparando sala de consulta...</p>
          <p className="text-gray-400 text-sm mt-2">Conectando con el paciente</p>
        </div>
      </div>
    );
  }

  if (error || !consultationData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center bg-red-900/50 p-8 rounded-lg border border-red-500 max-w-md">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-red-400 text-xl font-bold mb-2">Error de Conexión</h2>
          <p className="text-white mb-4">{error || 'No se pudo conectar a la sala'}</p>
          <button
            onClick={onEnd}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 relative">
      <LiveKitRoom
        token={consultationData.data.doctorToken}
        serverUrl={consultationData.data.livekitUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={handleDisconnect}
        className="h-full"
      >
        {/* Audio renderer */}
        <RoomAudioRenderer />

        {/* Componente principal de videoconferencia */}
        <VideoConference
          chatMessageFormatter={(message) => `${message.from?.identity}: ${message.message}`}
        />

        {/* Controles médicos avanzados */}
        <DoctorControls />

        {/* Barra de controles estándar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <ControlBar
              variation="verbose"
              controls={{
                microphone: true,
                camera: true,
                screenShare: true, // Doctores pueden compartir pantalla
                chat: true,
                settings: true,
                leave: true,
              }}
            />
          </div>
        </div>

        {/* Badge de doctor */}
        <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold text-sm">Dr. {doctorId}</span>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
