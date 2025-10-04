'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type {
  TelemedicineSession,
  SessionParticipant,
  SessionEvent,
  StartSessionRequest,
  StartSessionResponse,
  MediaState,
  ConnectionQuality,
} from '@autamedica/types';

interface UseTelemedicineReturn {
  session: TelemedicineSession | null;
  participants: SessionParticipant[];
  events: SessionEvent[];
  localMediaState: MediaState;
  connectionQuality: ConnectionQuality;
  loading: boolean;
  error: string | null;
  startSession: (appointmentId: string, doctorId: string) => Promise<StartSessionResponse | null>;
  endSession: () => Promise<boolean>;
  toggleVideo: () => Promise<boolean>;
  toggleAudio: () => Promise<boolean>;
  toggleScreenShare: () => Promise<boolean>;
  updateConnectionQuality: (quality: ConnectionQuality) => void;
  refreshSession: () => Promise<void>;
}

/**
 * Hook para gestionar sesiones de telemedicina
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   participants,
 *   localMediaState,
 *   toggleVideo,
 *   toggleAudio,
 * } = useTelemedicine();
 *
 * const handleToggleVideo = async () => {
 *   await toggleVideo();
 * };
 * ```
 */
export function useTelemedicine(sessionId?: string): UseTelemedicineReturn {
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [localMediaState, setLocalMediaState] = useState<MediaState>({
    video_enabled: false,
    audio_enabled: false,
    screen_sharing: false,
    video_muted_by_user: false,
    audio_muted_by_user: false,
  });
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only create client in browser environment
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (typeof window !== 'undefined' && !supabaseRef.current) {
    supabaseRef.current = createBrowserClient();
  }
  const supabase = supabaseRef.current;

  const localStreamRef = useRef<MediaStream | null>(null);

  // Fetch session data
  const fetchSession = useCallback(async (sid: string) => {
    if (!supabase) return;
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', sid)
        .is('deleted_at', null)
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData as unknown as TelemedicineSession);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sid)
        .is('left_at', null);

      if (participantsError) throw participantsError;

      setParticipants((participantsData || []) as unknown as SessionParticipant[]);

      // Fetch recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('session_events')
        .select('*')
        .eq('session_id', sid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      setEvents((eventsData || []) as unknown as SessionEvent[]);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Start new session
  const startSession = useCallback(async (
    appointmentId: string,
    doctorId: string
  ): Promise<StartSessionResponse | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return null;
      }

      const request: StartSessionRequest = {
        appointment_id: appointmentId as any,
        patient_id: user.id as any,
        doctor_id: doctorId as any,
        recording_enabled: false,
      };

      // Create session in database
      const signalingRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: sessionData, error: sessionError } = await supabase
        .from('telemedicine_sessions')
        .insert({
          appointment_id: appointmentId,
          patient_id: user.id,
          doctor_id: doctorId,
          status: 'scheduled',
          signaling_room_id: signalingRoomId,
          scheduled_start: new Date().toISOString(),
          connection_quality: 'good',
          recording_enabled: false,
          recording_consent_patient: false,
          recording_consent_doctor: false,
          metadata: {},
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const response: StartSessionResponse = {
        session_id: sessionData.id as any,
        signaling_room_id: signalingRoomId as any,
        signaling_server_url: typeof window !== 'undefined' ? (window as any).ENV?.NEXT_PUBLIC_SIGNALING_SERVER_URL || 'ws://localhost:8888' : 'ws://localhost:8888',
        turn_servers: [],
        ice_servers: [
          { urls: ['stun:stun.l.google.com:19302'] },
        ],
      };

      await fetchSession(sessionData.id);

      return response;
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return null;
    }
  }, [supabase, fetchSession]);

  // End session
  const endSession = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      if (!session) return false;

      // Stop local media
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      const { error: updateError } = await supabase
        .from('telemedicine_sessions')
        .update({
          status: 'ended',
          actual_end: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      // Create end event
      await supabase
        .from('session_events')
        .insert({
          session_id: session.id,
          event_type: 'session_ended',
          details: 'Session ended by user',
        });

      await fetchSession(session.id as string);

      return true;
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err instanceof Error ? err.message : 'Error al finalizar sesión');
      return false;
    }
  }, [session, supabase, fetchSession]);

  // Toggle video
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      if (!session) return false;

      const newState = !localMediaState.video_enabled;

      // Toggle local video track
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = newState;
        }
      }

      setLocalMediaState(prev => ({
        ...prev,
        video_enabled: newState,
        video_muted_by_user: !newState,
      }));

      // Log event
      await supabase
        .from('session_events')
        .insert({
          session_id: session.id,
          event_type: 'video_toggled',
          details: newState ? 'Video enabled' : 'Video disabled',
        });

      return true;
    } catch (err) {
      console.error('Error toggling video:', err);
      return false;
    }
  }, [session, localMediaState, supabase]);

  // Toggle audio
  const toggleAudio = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      if (!session) return false;

      const newState = !localMediaState.audio_enabled;

      // Toggle local audio track
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = newState;
        }
      }

      setLocalMediaState(prev => ({
        ...prev,
        audio_enabled: newState,
        audio_muted_by_user: !newState,
      }));

      // Log event
      await supabase
        .from('session_events')
        .insert({
          session_id: session.id,
          event_type: 'audio_toggled',
          details: newState ? 'Audio enabled' : 'Audio disabled',
        });

      return true;
    } catch (err) {
      console.error('Error toggling audio:', err);
      return false;
    }
  }, [session, localMediaState, supabase]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      if (!session) return false;

      const newState = !localMediaState.screen_sharing;

      setLocalMediaState(prev => ({
        ...prev,
        screen_sharing: newState,
      }));

      // Log event
      await supabase
        .from('session_events')
        .insert({
          session_id: session.id,
          event_type: newState ? 'screen_share_started' : 'screen_share_stopped',
          details: newState ? 'Screen sharing started' : 'Screen sharing stopped',
        });

      return true;
    } catch (err) {
      console.error('Error toggling screen share:', err);
      return false;
    }
  }, [session, localMediaState, supabase]);

  // Update connection quality
  const updateConnectionQuality = useCallback((quality: ConnectionQuality) => {
    setConnectionQuality(quality);

    if (session && supabase) {
      supabase
        .from('telemedicine_sessions')
        .update({ connection_quality: quality })
        .eq('id', session.id)
        .then(() => {
          // Log poor connection
          if (quality === 'poor' || quality === 'disconnected') {
            return supabase
              .from('session_events')
              .insert({
                session_id: session.id,
                event_type: 'connection_issue',
                details: `Connection quality: ${quality}`,
              });
          }
        })
        .catch(err => console.error('Error updating connection quality:', err));
    }
  }, [session, supabase]);

  // Refresh session data
  const refreshSession = useCallback(async () => {
    if (sessionId) {
      await fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  // Initial fetch
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  // Setup realtime subscription
  useEffect(() => {
    if (!sessionId || !supabase) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          refreshSession();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_events',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setEvents(prev => [payload.new as SessionEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase, refreshSession]);

  return {
    session,
    participants,
    events,
    localMediaState,
    connectionQuality,
    loading,
    error,
    startSession,
    endSession,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    updateConnectionQuality,
    refreshSession,
  };
}
