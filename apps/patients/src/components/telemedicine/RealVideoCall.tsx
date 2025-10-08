'use client';

import { useEffect, useRef } from 'react';
import { useWebRTCVideoCall } from '@/hooks/useWebRTCVideoCall';
import { usePatientSession } from '@/hooks/usePatientSession';
import { Video, VideoOff, Mic, MicOff, PhoneOff, PhoneCall } from 'lucide-react';

interface RealVideoCallProps {
  roomId: string;
  className?: string;
}

/**
 * Componente de videollamada con WebRTC REAL
 * Usa Supabase Realtime para signaling
 */
export function RealVideoCall({ roomId, className = '' }: RealVideoCallProps) {
  const { user } = usePatientSession();
  const userId = user?.id || 'anonymous';

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [state, actions] = useWebRTCVideoCall({
    roomId,
    userId,
    autoStart: false,
  });

  // Asignar streams a video elements
  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && state.remoteStream) {
      remoteVideoRef.current.srcObject = state.remoteStream;
    }
  }, [state.remoteStream]);

  return (
    <div className={`relative h-full w-full bg-stone-900 ${className}`}>
      {/* Remote Video (principal) */}
      <div className="absolute inset-0">
        {state.remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-stone-700 flex items-center justify-center mb-4">
                <Video className="h-12 w-12 text-stone-400" />
              </div>
              <p className="text-white text-lg font-semibold">
                {state.isConnected
                  ? 'Esperando video remoto...'
                  : 'No conectado'}
              </p>
              {state.remotePeerId && (
                <p className="text-stone-400 text-sm mt-2">
                  Conectado con: {state.remotePeerId.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local Video (PIP) */}
      {state.localStream && (
        <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
          {state.isCameraOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-stone-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-stone-400" />
            </div>
          )}
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              state.isConnected
                ? 'bg-green-500 animate-pulse'
                : state.isConnecting
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-white text-sm font-medium">
            {state.isConnected
              ? 'Conectado'
              : state.isConnecting
              ? 'Conectando...'
              : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="absolute top-16 left-4 right-4 px-4 py-3 bg-red-500/90 backdrop-blur-sm rounded-lg">
          <p className="text-white text-sm">{state.error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-md rounded-full">
          {/* Toggle Camera */}
          <button
            onClick={actions.toggleCamera}
            disabled={!state.localStream}
            className={`p-3 rounded-full transition-colors ${
              state.isCameraOn
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={state.isCameraOn ? 'Apagar cámara' : 'Encender cámara'}
          >
            {state.isCameraOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          {/* Toggle Mic */}
          <button
            onClick={actions.toggleMic}
            disabled={!state.localStream}
            className={`p-3 rounded-full transition-colors ${
              state.isMicOn
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={state.isMicOn ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {state.isMicOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          {/* Start/End Call */}
          {!state.localStream ? (
            <button
              onClick={actions.startCall}
              disabled={state.isConnecting}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full text-white font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneCall className="h-5 w-5" />
              {state.isConnecting ? 'Conectando...' : 'Iniciar Llamada'}
            </button>
          ) : (
            <button
              onClick={actions.endCall}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full text-white font-semibold transition-colors flex items-center gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              Finalizar
            </button>
          )}
        </div>
      </div>

      {/* Debug Info (solo en development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-24 left-4 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
          <div>Room: {roomId}</div>
          <div>User: {userId.slice(0, 8)}...</div>
          <div>State: {state.connectionState}</div>
          <div>Local: {state.localStream ? '✓' : '✗'}</div>
          <div>Remote: {state.remoteStream ? '✓' : '✗'}</div>
          {state.remotePeerId && <div>Peer: {state.remotePeerId.slice(0, 8)}...</div>}
        </div>
      )}
    </div>
  );
}
