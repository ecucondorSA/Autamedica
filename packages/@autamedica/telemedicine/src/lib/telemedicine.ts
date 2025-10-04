/**
 * Telemedicine Session Management
 * Integración con Supabase para gestión de sesiones de videoconsulta
 *
 * @module telemedicine
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import { logger } from '@autamedica/shared';

/**
 * Session Status Types
 */
export type SessionStatus = 'scheduled' | 'waiting' | 'active' | 'ended' | 'cancelled' | 'failed';

/**
 * Participant Role Types
 */
export type ParticipantRole = 'patient' | 'doctor';

/**
 * Telemedicine Session
 */
export interface TelemedicineSession {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  status: SessionStatus;
  signaling_room_id: string;
  scheduled_start: string;
  actual_start?: string;
  actual_end?: string;
  duration_seconds?: number;
  connection_quality?: string;
  recording_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Session Participant
 */
export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
  left_at?: string;
  media_state: {
    video_enabled: boolean;
    audio_enabled: boolean;
    screen_sharing: boolean;
  };
  connection_stats?: {
    bitrate?: number;
    latency?: number;
    packet_loss?: number;
    quality?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  created_at: string;
  updated_at: string;
}

/**
 * Session Event
 */
export interface SessionEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
  created_at: string;
}

/**
 * Create a new telemedicine session
 */
export async function createTelemedicineSession(data: {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  scheduledStart?: string;
}): Promise<TelemedicineSession> {
  const supabase = getSupabaseClient();
  const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { data: session, error } = await supabase
    .from('telemedicine_sessions')
    .insert({
      appointment_id: data.appointmentId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      signaling_room_id: roomId,
      scheduled_start: data.scheduledStart || new Date().toISOString(),
      status: 'scheduled' as SessionStatus,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return session as TelemedicineSession;
}

/**
 * Get a telemedicine session by ID
 */
export async function getTelemedicineSession(sessionId: string): Promise<TelemedicineSession | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('telemedicine_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get session: ${error.message}`);
  }

  return data as TelemedicineSession;
}

/**
 * Get session by room ID
 */
export async function getSessionByRoomId(roomId: string): Promise<TelemedicineSession | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('telemedicine_sessions')
    .select('*')
    .eq('signaling_room_id', roomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get session by room: ${error.message}`);
  }

  return data as TelemedicineSession;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  metadata?: {
    actualStart?: string;
    actualEnd?: string;
    durationSeconds?: number;
    connectionQuality?: string;
    notes?: string;
  }
): Promise<TelemedicineSession> {
  const supabase = getSupabaseClient();
  const updateData: any = { status };

  if (metadata?.actualStart) updateData.actual_start = metadata.actualStart;
  if (metadata?.actualEnd) updateData.actual_end = metadata.actualEnd;
  if (metadata?.durationSeconds !== undefined) updateData.duration_seconds = metadata.durationSeconds;
  if (metadata?.connectionQuality) updateData.connection_quality = metadata.connectionQuality;
  if (metadata?.notes) updateData.notes = metadata.notes;

  const { data, error } = await supabase
    .from('telemedicine_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`);
  }

  return data as TelemedicineSession;
}

/**
 * Join session as participant
 */
export async function joinSessionAsParticipant(
  sessionId: string,
  userId: string,
  role: ParticipantRole
): Promise<SessionParticipant> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_participants')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
      media_state: {
        video_enabled: true,
        audio_enabled: true,
        screen_sharing: false,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to join session: ${error.message}`);
  }

  return data as SessionParticipant;
}

/**
 * Update participant media state
 */
export async function updateParticipantMediaState(
  participantId: string,
  mediaState: {
    videoEnabled?: boolean;
    audioEnabled?: boolean;
    screenSharing?: boolean;
  }
): Promise<SessionParticipant> {
  const supabase = getSupabaseClient();
  
  const { data: current, error: fetchError } = await supabase
    .from('session_participants')
    .select('media_state')
    .eq('id', participantId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch participant: ${fetchError.message}`);
  }

  const updatedMediaState = {
    video_enabled: mediaState.videoEnabled ?? current.media_state.video_enabled,
    audio_enabled: mediaState.audioEnabled ?? current.media_state.audio_enabled,
    screen_sharing: mediaState.screenSharing ?? current.media_state.screen_sharing,
  };

  const { data, error } = await supabase
    .from('session_participants')
    .update({ media_state: updatedMediaState })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update media state: ${error.message}`);
  }

  return data as SessionParticipant;
}

/**
 * Update connection statistics
 */
export async function updateConnectionStats(
  participantId: string,
  stats: {
    bitrate?: number;
    latency?: number;
    packetLoss?: number;
    quality?: 'excellent' | 'good' | 'fair' | 'poor';
  }
): Promise<SessionParticipant> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_participants')
    .update({
      connection_stats: {
        bitrate: stats.bitrate,
        latency: stats.latency,
        packet_loss: stats.packetLoss,
        quality: stats.quality,
      },
    })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update connection stats: ${error.message}`);
  }

  return data as SessionParticipant;
}

/**
 * Leave session
 */
export async function leaveSession(participantId: string): Promise<SessionParticipant> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to leave session: ${error.message}`);
  }

  return data as SessionParticipant;
}

/**
 * Get session participants
 */
export async function getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get participants: ${error.message}`);
  }

  return data as SessionParticipant[];
}

/**
 * Log session event
 */
export async function logSessionEvent(
  sessionId: string,
  eventType: string,
  eventData?: Record<string, any>,
  userId?: string
): Promise<SessionEvent> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_events')
    .insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log event: ${error.message}`);
  }

  return data as SessionEvent;
}

/**
 * Get session events
 */
export async function getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get events: ${error.message}`);
  }

  return data as SessionEvent[];
}

/**
 * Get user's active sessions
 */
export async function getUserActiveSessions(userId: string): Promise<TelemedicineSession[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('telemedicine_sessions')
    .select('*')
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
    .in('status', ['waiting', 'active'])
    .order('scheduled_start', { ascending: false });

  if (error) {
    throw new Error(`Failed to get active sessions: ${error.message}`);
  }

  return data as TelemedicineSession[];
}

/**
 * Get user's scheduled sessions
 */
export async function getUserScheduledSessions(userId: string): Promise<TelemedicineSession[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('telemedicine_sessions')
    .select('*')
    .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
    .eq('status', 'scheduled')
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true });

  if (error) {
    throw new Error(`Failed to get scheduled sessions: ${error.message}`);
  }

  return data as TelemedicineSession[];
}

/**
 * Subscribe to session real-time updates
 */
export function subscribeToSession(
  sessionId: string,
  callbacks: {
    onSessionUpdate?: (session: TelemedicineSession) => void;
    onParticipantUpdate?: (participant: SessionParticipant) => void;
    onEventLogged?: (event: SessionEvent) => void;
  }
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channel = supabase.channel(`session-${sessionId}`);

  // Subscribe to session updates
  if (callbacks.onSessionUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'telemedicine_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        callbacks.onSessionUpdate?.(payload.new as TelemedicineSession);
      }
    );
  }

  // Subscribe to participant updates
  if (callbacks.onParticipantUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callbacks.onParticipantUpdate?.(payload.new as SessionParticipant);
      }
    );
  }

  // Subscribe to new events
  if (callbacks.onEventLogged) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_events',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callbacks.onEventLogged?.(payload.new as SessionEvent);
      }
    );
  }

  channel.subscribe();

  return channel;
}

/**
 * Unsubscribe from session updates
 */
export async function unsubscribeFromSession(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe();
}

/**
 * Helper: Generate unique room ID
 */
export function generateRoomId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper: Calculate session duration
 */
export function calculateSessionDuration(actualStart: string, actualEnd: string): number {
  const start = new Date(actualStart).getTime();
  const end = new Date(actualEnd).getTime();
  return Math.floor((end - start) / 1000); // seconds
}

/**
 * Report connection quality stats
 * Updates participant connection stats in real-time
 */
export async function reportConnectionQuality(
  participantId: string,
  stats: {
    bitrate: number;
    latency: number;
    packetLoss: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  }
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('session_participants')
    .update({
      connection_stats: {
        bitrate: Math.round(stats.bitrate),
        latency: Math.round(stats.latency),
        packet_loss: parseFloat(stats.packetLoss.toFixed(2)),
        quality: stats.quality,
      },
    })
    .eq('id', participantId);

  if (error) {
    logger.error('Failed to report connection quality:', error.message);
  }
}

/**
 * Get average connection quality for session
 * Analyzes all participants' stats to get session-level quality
 */
export async function getSessionConnectionQuality(
  sessionId: string
): Promise<{
  averageBitrate: number;
  averageLatency: number;
  averagePacketLoss: number;
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
} | null> {
  const supabase = getSupabaseClient();

  const { data: participants, error } = await supabase
    .from('session_participants')
    .select('connection_stats')
    .eq('session_id', sessionId)
    .not('connection_stats', 'is', null);

  if (error || !participants || participants.length === 0) {
    return null;
  }

  let totalBitrate = 0;
  let totalLatency = 0;
  let totalPacketLoss = 0;
  let count = 0;

  const qualityScores: Record<string, number> = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1,
  };

  let totalQualityScore = 0;

  participants.forEach((p) => {
    if (p.connection_stats) {
      totalBitrate += p.connection_stats.bitrate || 0;
      totalLatency += p.connection_stats.latency || 0;
      totalPacketLoss += p.connection_stats.packet_loss || 0;
      totalQualityScore += qualityScores[p.connection_stats.quality] || 0;
      count++;
    }
  });

  if (count === 0) return null;

  const avgQualityScore = totalQualityScore / count;
  let overallQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

  if (avgQualityScore >= 3.5) overallQuality = 'excellent';
  else if (avgQualityScore >= 2.5) overallQuality = 'good';
  else if (avgQualityScore >= 1.5) overallQuality = 'fair';

  return {
    averageBitrate: totalBitrate / count,
    averageLatency: totalLatency / count,
    averagePacketLoss: totalPacketLoss / count,
    overallQuality,
  };
}
