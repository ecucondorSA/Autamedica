'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { Room } from 'livekit-client';

interface VideoConsultationProps {
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

export function VideoConsultation({
  consultationId,
  patientId,
  doctorId,
  onEnd
}: VideoConsultationProps) {
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
    console.log('Disconnected from consultation room');
    onEnd?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Conectando a la videoconsulta...</p>
        </div>
      </div>
    );
  }

  if (error || !consultationData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center bg-red-900/50 p-8 rounded-lg border border-red-500">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error de Conexión</h2>
          <p className="text-white">{error || 'No se pudo conectar a la sala'}</p>
          <button
            onClick={onEnd}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <LiveKitRoom
        token={consultationData.data.patientToken}
        serverUrl={consultationData.data.livekitUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={handleDisconnect}
        className="h-full"
      >
        {/* Audio renderer para manejar el audio de la sala */}
        <RoomAudioRenderer />

        {/* Componente principal de videoconferencia */}
        <VideoConference
          chatMessageFormatter={(message) => `${message.from?.identity}: ${message.message}`}
        />

        {/* Controles personalizados */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <ControlBar
              variation="minimal"
              controls={{
                microphone: true,
                camera: true,
                screenShare: false, // Pacientes no pueden compartir pantalla
                chat: true,
                leave: true,
              }}
            />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
