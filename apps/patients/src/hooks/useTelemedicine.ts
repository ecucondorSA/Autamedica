'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MediaState, ConnectionQuality, SessionParticipant, SessionEvent } from '@autamedica/types';
import { logger } from '@autamedica/shared';

interface ApiSession {
  session_id: string;
  room_id: string;
  status: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
}

interface StartSessionResponse {
  session: ApiSession;
  signaling: {
    room_id: string;
    server_url: string;
    ice_servers: Array<{ urls: string | string[]; username?: string; credential?: string }>;
  };
  livekit?: LiveKitConfig;
}

interface LiveKitConfig {
  token: string;
  url: string;
  roomName?: string;
}

interface UseTelemedicineReturn {
  session: ApiSession | null;
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
  joinSession: (role?: string, sessionIdOverride?: string) => Promise<boolean>;
  leaveSession: (sessionIdOverride?: string) => Promise<boolean>;
  logEvent: (eventType: string, details?: string, sessionIdOverride?: string) => Promise<void>;
  livekit: LiveKitConfig | null;
}

function mapApiSession(data: any): ApiSession {
  return {
    session_id: String(data?.session_id ?? data?.id ?? ''),
    room_id: String(data?.room_id ?? ''),
    status: String(data?.status ?? 'scheduled'),
    scheduled_at: data?.scheduled_at ?? null,
    started_at: data?.started_at ?? null,
    ended_at: data?.ended_at ?? null,
  };
}

export function useTelemedicine(sessionId?: string): UseTelemedicineReturn {
  const [session, setSession] = useState<ApiSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [livekit, setLivekit] = useState<LiveKitConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [localMediaState, setLocalMediaState] = useState<MediaState>({
    video_enabled: false,
    audio_enabled: false,
    screen_sharing: false,
    video_muted_by_user: false,
    audio_muted_by_user: false,
  });

  const localStreamRef = useRef<MediaStream | null>(null);

  const fetchSession = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const query = sessionId ? `/api/telemedicine/session?sessionId=${encodeURIComponent(sessionId)}` : '/api/telemedicine/session';
      const res = await fetch(query, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo obtener la sesión');
      }
      const json = await res.json();
      if (json?.data) {
        const payload = json.data;
        const rawSession = payload.session ?? payload;
        setSession(mapApiSession(rawSession));
        setParticipants(payload.participants ?? []);
        setEvents(payload.events ?? []);
        setLivekit(payload.livekit ?? null);
      } else {
        setSession(null);
        setParticipants([]);
        setEvents([]);
        setLivekit(null);
      }
    } catch (err) {
      logger.error('[useTelemedicine] fetchSession error', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const startSession = useCallback(async (appointmentId: string, doctorId: string): Promise<StartSessionResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/telemedicine/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appointment_id: appointmentId, doctor_id: doctorId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo iniciar la sesión');
      }
      const json = await res.json();
      const apiSession = mapApiSession(json?.data?.session);
      setSession(apiSession);
      setParticipants(json?.data?.participants ?? []);
      setEvents(json?.data?.events ?? []);
      setLivekit(json?.data?.livekit ?? null);
      return json?.data as StartSessionResponse;
    } catch (err) {
      logger.error('[useTelemedicine] startSession error', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const endSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;
    setLoading(true);
    setError(null);
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      const res = await fetch(`/api/telemedicine/session/${session.session_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed', ended: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Error al finalizar sesión');
      }
      const json = await res.json().catch(() => null);
      if (json?.data) {
        setSession(prev => (prev ? { ...prev, status: json.data.status, ended_at: json.data.ended_at } : prev));
      }
      return true;
    } catch (err) {
      logger.error('[useTelemedicine] endSession error', err);
      setError(err instanceof Error ? err.message : 'Error al finalizar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const toggleVideo = useCallback(async () => {
    if (!session) return false;
    const newState = !localMediaState.video_enabled;
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) track.enabled = newState;
    }
    setLocalMediaState(prev => ({ ...prev, video_enabled: newState, video_muted_by_user: !newState }));
    return true;
  }, [localMediaState, session]);

  const toggleAudio = useCallback(async () => {
    if (!session) return false;
    const newState = !localMediaState.audio_enabled;
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) track.enabled = newState;
    }
    setLocalMediaState(prev => ({ ...prev, audio_enabled: newState, audio_muted_by_user: !newState }));
    return true;
  }, [localMediaState, session]);

  const toggleScreenShare = useCallback(async () => {
    if (!session) return false;
    setLocalMediaState(prev => ({ ...prev, screen_sharing: !prev.screen_sharing }));
    return true;
  }, [session]);

  const updateConnectionQuality = useCallback((quality: ConnectionQuality) => {
    setConnectionQuality(quality);
  }, []);

  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  const joinSession = useCallback(async (role = 'patient', sessionIdOverride?: string): Promise<boolean> => {
    const targetSession = sessionIdOverride ?? session?.session_id;
    if (!targetSession) return false;
    try {
      const res = await fetch(`/api/telemedicine/session/${targetSession}/participants`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'join_failed');
      }
      await fetchSession();
      return true;
    } catch (err) {
      logger.error('[useTelemedicine] joinSession error', err);
      setError(err instanceof Error ? err.message : 'Error al unir a la sesión');
      return false;
    }
  }, [session, fetchSession]);

  const leaveSession = useCallback(async (sessionIdOverride?: string): Promise<boolean> => {
    const targetSession = sessionIdOverride ?? session?.session_id;
    if (!targetSession) return false;
    try {
      const res = await fetch(`/api/telemedicine/session/${targetSession}/participants`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ left: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'leave_failed');
      }
      await fetchSession();
      return true;
    } catch (err) {
      logger.error('[useTelemedicine] leaveSession error', err);
      setError(err instanceof Error ? err.message : 'Error al abandonar la sesión');
      return false;
    }
  }, [session, fetchSession]);

  const logEvent = useCallback(async (eventType: string, details?: string, sessionIdOverride?: string) => {
    const targetSession = sessionIdOverride ?? session?.session_id;
    if (!targetSession) return;
    try {
      const payload = { event_type: eventType, event_data: details ? { details } : undefined };
      const res = await fetch(`/api/telemedicine/session/${targetSession}/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'event_failed');
      }
      await fetchSession();
    } catch (err) {
      logger.error('[useTelemedicine] logEvent error', err);
      setError(err instanceof Error ? err.message : 'Error al registrar evento');
    }
  }, [session, fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
    joinSession,
    leaveSession,
    logEvent,
    livekit,
  };
}
