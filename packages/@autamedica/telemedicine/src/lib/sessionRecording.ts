/**
 * Session Recording Management (HIPAA Compliant)
 * Handles recording consent, storage, and audit trails
 *
 * @module sessionRecording
 */

import { getSupabaseClient } from './supabaseClient';

/**
 * Recording Status Types
 */
export type RecordingStatus = 'pending' | 'recording' | 'processing' | 'completed' | 'ready' | 'failed' | 'deleted';

/**
 * Session Recording Interface
 */
export interface SessionRecording {
  id: string;
  session_id: string;
  file_path: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  format: string;
  status: RecordingStatus;
  transcription_url?: string;
  metadata?: Record<string, any>;

  // HIPAA consent
  patient_consent: boolean;
  patient_consent_at?: string;
  doctor_consent: boolean;
  doctor_consent_at?: string;

  // Audit trail
  accessed_by: Array<{
    user_id: string;
    accessed_at: string;
    ip_address?: string;
  }>;
  started_by_user_id?: string;
  started_at?: string;
  ended_at?: string;
  deleted_by_user_id?: string;
  deleted_at?: string;
  deletion_reason?: string;

  created_at: string;
}

/**
 * Check if both parties have consented to recording
 */
export async function checkRecordingConsent(sessionId: string): Promise<{
  canRecord: boolean;
  patientConsent: boolean;
  doctorConsent: boolean;
}> {
  const supabase = getSupabaseClient();

  const { data: session, error } = await supabase
    .from('telemedicine_sessions')
    .select('recording_consent_patient, recording_consent_doctor')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return {
      canRecord: false,
      patientConsent: false,
      doctorConsent: false,
    };
  }

  return {
    canRecord: session.recording_consent_patient && session.recording_consent_doctor,
    patientConsent: session.recording_consent_patient,
    doctorConsent: session.recording_consent_doctor,
  };
}

/**
 * Request recording consent from a participant
 */
export async function requestRecordingConsent(
  sessionId: string,
  userId: string,
  role: 'patient' | 'doctor'
): Promise<void> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, any> = {};

  if (role === 'patient') {
    updateData.recording_consent_patient = true;
  } else {
    updateData.recording_consent_doctor = true;
  }

  const { error } = await supabase
    .from('telemedicine_sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to update consent: ${error.message}`);
  }
}

/**
 * Start recording session
 */
export async function startRecording(
  sessionId: string,
  userId: string,
  format = 'webm'
): Promise<SessionRecording> {
  const supabase = getSupabaseClient();

  // Check consent first
  const consent = await checkRecordingConsent(sessionId);
  if (!consent.canRecord) {
    throw new Error('Both parties must consent before recording can start');
  }

  // Create recording record
  const { data, error } = await supabase
    .from('session_recordings')
    .insert({
      session_id: sessionId,
      file_path: `recordings/${sessionId}/${Date.now()}.${format}`,
      format,
      status: 'recording' as RecordingStatus,
      started_by_user_id: userId,
      started_at: new Date().toISOString(),
      patient_consent: consent.patientConsent,
      doctor_consent: consent.doctorConsent,
      accessed_by: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start recording: ${error.message}`);
  }

  // Update session to reflect recording is enabled
  await supabase
    .from('telemedicine_sessions')
    .update({ recording_enabled: true })
    .eq('id', sessionId);

  return data as SessionRecording;
}

/**
 * Stop recording session
 */
export async function stopRecording(
  recordingId: string,
  metadata?: {
    fileSizeBytes?: number;
    durationSeconds?: number;
  }
): Promise<SessionRecording> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, any> = {
    status: 'processing' as RecordingStatus,
    ended_at: new Date().toISOString(),
  };

  if (metadata?.fileSizeBytes) updateData.file_size_bytes = metadata.fileSizeBytes;
  if (metadata?.durationSeconds) updateData.duration_seconds = metadata.durationSeconds;

  const { data, error } = await supabase
    .from('session_recordings')
    .update(updateData)
    .eq('id', recordingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to stop recording: ${error.message}`);
  }

  return data as SessionRecording;
}

/**
 * Get recording by session ID
 */
export async function getSessionRecording(sessionId: string): Promise<SessionRecording | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_recordings')
    .select('*')
    .eq('session_id', sessionId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get recording: ${error.message}`);
  }

  return data as SessionRecording;
}

/**
 * Get recording by ID
 */
export async function getRecording(recordingId: string): Promise<SessionRecording | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_recordings')
    .select('*')
    .eq('id', recordingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get recording: ${error.message}`);
  }

  return data as SessionRecording;
}

/**
 * Log recording access (HIPAA audit trail)
 */
export async function logRecordingAccess(
  recordingId: string,
  userId: string,
  ipAddress?: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // Get current accessed_by array
  const { data: recording } = await supabase
    .from('session_recordings')
    .select('accessed_by')
    .eq('id', recordingId)
    .single();

  if (!recording) return;

  const accessLog = {
    user_id: userId,
    accessed_at: new Date().toISOString(),
    ip_address: ipAddress,
  };

  const accessedBy = Array.isArray(recording.accessed_by)
    ? [...recording.accessed_by, accessLog]
    : [accessLog];

  const { error } = await supabase
    .from('session_recordings')
    .update({ accessed_by: accessedBy })
    .eq('id', recordingId);

  if (error) {
    console.error('Failed to log recording access:', error.message);
  }
}

/**
 * Soft delete recording (HIPAA compliant)
 */
export async function deleteRecording(
  recordingId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('session_recordings')
    .update({
      status: 'deleted' as RecordingStatus,
      deleted_at: new Date().toISOString(),
      deleted_by_user_id: userId,
      deletion_reason: reason,
    })
    .eq('id', recordingId);

  if (error) {
    throw new Error(`Failed to delete recording: ${error.message}`);
  }
}

/**
 * Update recording status
 */
export async function updateRecordingStatus(
  recordingId: string,
  status: RecordingStatus,
  metadata?: Record<string, any>
): Promise<SessionRecording> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, any> = { status };
  if (metadata) {
    updateData.metadata = metadata;
  }

  const { data, error } = await supabase
    .from('session_recordings')
    .update(updateData)
    .eq('id', recordingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update recording status: ${error.message}`);
  }

  return data as SessionRecording;
}

/**
 * Get all recordings for a user (patient or doctor)
 */
export async function getUserRecordings(userId: string): Promise<SessionRecording[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_recordings')
    .select(`
      *,
      telemedicine_sessions!inner(patient_id, doctor_id)
    `)
    .or(`telemedicine_sessions.patient_id.eq.${userId},telemedicine_sessions.doctor_id.eq.${userId}`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user recordings: ${error.message}`);
  }

  return data as SessionRecording[];
}

/**
 * Get recording audit trail
 */
export async function getRecordingAuditTrail(recordingId: string): Promise<{
  recording: SessionRecording;
  accessLog: Array<{
    user_id: string;
    accessed_at: string;
    ip_address?: string;
  }>;
}> {
  const recording = await getRecording(recordingId);

  if (!recording) {
    throw new Error('Recording not found');
  }

  return {
    recording,
    accessLog: recording.accessed_by || [],
  };
}
