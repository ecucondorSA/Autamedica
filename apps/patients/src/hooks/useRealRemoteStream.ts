import { useEffect, useState } from 'react';
import {
import { logger } from '@autamedica/shared';
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
} from 'livekit-client';

/**
 * Hook para obtener el stream de video real del participante remoto (médico)
 * Usa LiveKit para WebRTC real
 *
 * @param remoteParticipant - Participante remoto de LiveKit (el médico)
 * @returns MediaStream del video del médico o null
 */
export function useRealRemoteStream(
  remoteParticipant?: RemoteParticipant
): MediaStream | null {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!remoteParticipant) {
      setRemoteStream(null);
      return;
    }

    /**
     * Handler cuando un track es suscrito
     * Se ejecuta cuando el médico activa su cámara
     */
    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      // Solo nos interesan los tracks de video
      if (track.kind === Track.Kind.Video) {
        // Crear MediaStream desde el track de LiveKit
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        setRemoteStream(mediaStream);

        console.log('✅ Video remoto conectado:', {
          participantId: participant.identity,
          trackId: track.sid,
        });
      }
    };

    /**
     * Handler cuando un track es desuscrito
     * Se ejecuta cuando el médico desactiva su cámara
     */
    const handleTrackUnsubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Video) {
        setRemoteStream(null);

        console.log('⚠️  Video remoto desconectado:', {
          participantId: participant.identity,
          trackId: track.sid,
        });
      }
    };

    /**
     * Handler cuando cambia el estado de mute
     */
    const handleTrackMuted = (publication: RemoteTrackPublication) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('🔇 Video remoto muteado');
      }
    };

    const handleTrackUnmuted = (publication: RemoteTrackPublication) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('🔊 Video remoto desmuteado');
      }
    };

    // Suscribirse a eventos de LiveKit
    remoteParticipant.on('trackSubscribed', handleTrackSubscribed);
    remoteParticipant.on('trackUnsubscribed', handleTrackUnsubscribed);
    remoteParticipant.on('trackMuted', handleTrackMuted);
    remoteParticipant.on('trackUnmuted', handleTrackUnmuted);

    // Verificar si ya hay tracks de video disponibles
    // (caso cuando el médico ya tiene cámara activa al unirse)
    remoteParticipant.videoTracks.forEach((publication) => {
      if (publication.track && publication.isSubscribed) {
        handleTrackSubscribed(
          publication.track,
          publication,
          remoteParticipant
        );
      }
    });

    // Cleanup: desuscribirse de eventos
    return () => {
      remoteParticipant.off('trackSubscribed', handleTrackSubscribed);
      remoteParticipant.off('trackUnsubscribed', handleTrackUnsubscribed);
      remoteParticipant.off('trackMuted', handleTrackMuted);
      remoteParticipant.off('trackUnmuted', handleTrackUnmuted);

      // Detener el stream si existe
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [remoteParticipant]);

  return remoteStream;
}

/**
 * Hook alternativo que acepta múltiples participantes
 * Útil para consultas grupales
 */
export function useMultipleRemoteStreams(
  remoteParticipants: RemoteParticipant[]
): Map<string, MediaStream> {
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());

  useEffect(() => {
    const participantStreams = new Map<string, MediaStream>();

    remoteParticipants.forEach((participant) => {
      const handleTrackSubscribed = (
        track: RemoteTrack,
        publication: RemoteTrackPublication
      ) => {
        if (track.kind === Track.Kind.Video) {
          const mediaStream = new MediaStream([track.mediaStreamTrack]);
          participantStreams.set(participant.identity, mediaStream);
          setStreams(new Map(participantStreams));
        }
      };

      participant.on('trackSubscribed', handleTrackSubscribed);

      // Check existing tracks
      participant.videoTracks.forEach((publication) => {
        if (publication.track && publication.isSubscribed) {
          handleTrackSubscribed(publication.track, publication);
        }
      });
    });

    return () => {
      participantStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, [remoteParticipants]);

  return streams;
}
