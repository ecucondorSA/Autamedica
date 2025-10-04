/**
 * @autamedica/types - Telemedicine Types
 *
 * Tipos para el sistema de telemedicina (videollamadas médicas).
 * Incluye WebRTC, signaling, y gestión de sesiones.
 */

import type { Brand } from '../core/brand.types';
import type { PatientId, DoctorId, AppointmentId } from '../core/brand.types';
import type { ISODateString } from '../core/brand.types';
import type { BaseEntity } from '../core/base.types';

// ==========================================
// Branded IDs
// ==========================================

export type TelemedicineSessionId = Brand<string, 'TelemedicineSessionId'>;
export type WebRTCPeerId = Brand<string, 'WebRTCPeerId'>;
export type SignalingRoomId = Brand<string, 'SignalingRoomId'>;

// ==========================================
// Session Status
// ==========================================

export type SessionStatus =
  | 'scheduled'
  | 'waiting_room'
  | 'connecting'
  | 'active'
  | 'paused'
  | 'ended'
  | 'cancelled'
  | 'failed';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';

export type ParticipantRole = 'patient' | 'doctor' | 'observer';

// ==========================================
// Telemedicine Session
// ==========================================

export interface TelemedicineSession extends BaseEntity {
  id: TelemedicineSessionId;
  appointment_id: AppointmentId;
  patient_id: PatientId;
  doctor_id: DoctorId;
  status: SessionStatus;
  signaling_room_id: SignalingRoomId;
  scheduled_start: ISODateString;
  actual_start: ISODateString | null;
  actual_end: ISODateString | null;
  duration_seconds: number | null;
  connection_quality: ConnectionQuality;
  recording_enabled: boolean;
  recording_url: string | null;
  recording_consent_patient: boolean;
  recording_consent_doctor: boolean;
  technical_issues_reported: string[];
  metadata: TelemedicineSessionMetadata;
}

export interface TelemedicineSessionMetadata {
  patient_device: DeviceInfo;
  doctor_device: DeviceInfo;
  network_stats: NetworkStats;
  video_quality: VideoQualitySettings;
  audio_quality: AudioQualitySettings;
}

export interface DeviceInfo {
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  has_webcam: boolean;
  has_microphone: boolean;
  screen_resolution: string;
}

export interface NetworkStats {
  bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_percentage: number;
  jitter_ms: number;
  connection_type: 'wifi' | 'ethernet' | 'cellular' | 'unknown';
}

export interface VideoQualitySettings {
  resolution: '720p' | '480p' | '360p' | '240p';
  framerate: number;
  bitrate_kbps: number;
  codec: 'VP8' | 'VP9' | 'H264';
}

export interface AudioQualitySettings {
  bitrate_kbps: number;
  sample_rate: number;
  codec: 'Opus' | 'PCMU' | 'PCMA';
  echo_cancellation: boolean;
  noise_suppression: boolean;
}

// ==========================================
// WebRTC Signaling
// ==========================================

export interface SignalingMessage {
  type: SignalingMessageType;
  from: WebRTCPeerId;
  to: WebRTCPeerId;
  room_id: SignalingRoomId;
  payload: SignalingPayload;
  timestamp: ISODateString;
}

export type SignalingMessageType =
  | 'join'
  | 'leave'
  | 'offer'
  | 'answer'
  | 'ice_candidate'
  | 'renegotiate'
  | 'ping'
  | 'pong';

export type SignalingPayload =
  | JoinPayload
  | LeavePayload
  | OfferPayload
  | AnswerPayload
  | ICECandidatePayload
  | RenegotiatePayload;

export interface JoinPayload {
  peer_id: WebRTCPeerId;
  role: ParticipantRole;
  display_name: string;
  capabilities: MediaCapabilities;
}

export interface LeavePayload {
  peer_id: WebRTCPeerId;
  reason: 'user_action' | 'timeout' | 'error' | 'kicked';
}

export interface OfferPayload {
  sdp: string; // Session Description Protocol
  peer_id: WebRTCPeerId;
}

export interface AnswerPayload {
  sdp: string;
  peer_id: WebRTCPeerId;
}

export interface ICECandidatePayload {
  candidate: string;
  sdp_mid: string;
  sdp_m_line_index: number;
}

export interface RenegotiatePayload {
  reason: string;
}

export interface MediaCapabilities {
  video: boolean;
  audio: boolean;
  screen_share: boolean;
  data_channel: boolean;
}

// ==========================================
// Participant Management
// ==========================================

export interface SessionParticipant {
  peer_id: WebRTCPeerId;
  user_id: PatientId | DoctorId;
  role: ParticipantRole;
  display_name: string;
  joined_at: ISODateString;
  left_at: ISODateString | null;
  is_online: boolean;
  media_state: MediaState;
  connection_state: RTCPeerConnectionState;
}

export interface MediaState {
  video_enabled: boolean;
  audio_enabled: boolean;
  screen_sharing: boolean;
  video_muted_by_user: boolean;
  audio_muted_by_user: boolean;
}

export type RTCPeerConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

// ==========================================
// Session Events
// ==========================================

export interface SessionEvent {
  session_id: TelemedicineSessionId;
  event_type: SessionEventType;
  timestamp: ISODateString;
  actor: WebRTCPeerId;
  details: string;
}

export type SessionEventType =
  | 'session_started'
  | 'session_ended'
  | 'participant_joined'
  | 'participant_left'
  | 'video_toggled'
  | 'audio_toggled'
  | 'screen_share_started'
  | 'screen_share_stopped'
  | 'connection_issue'
  | 'recording_started'
  | 'recording_stopped'
  | 'technical_issue_reported';

// ==========================================
// Quick Actions during Telemedicine
// ==========================================

export interface TelemedicineQuickAction {
  session_id: TelemedicineSessionId;
  action_type: QuickActionType;
  timestamp: ISODateString;
  data: QuickActionData;
}

export type QuickActionType =
  | 'report_symptom'
  | 'share_vital_signs'
  | 'share_medication_list'
  | 'request_prescription'
  | 'schedule_followup'
  | 'share_lab_result'
  | 'take_note';

export interface QuickActionData {
  symptom?: {
    description: string;
    severity: 1 | 2 | 3 | 4 | 5;
    duration: string;
  };
  vital_signs?: {
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature_celsius?: number;
    oxygen_saturation?: number;
  };
  medication_list?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  prescription_request?: {
    medication: string;
    reason: string;
  };
  followup_request?: {
    preferred_date?: ISODateString;
    reason: string;
  };
  lab_result_url?: string;
  note?: string;
}

// ==========================================
// Waiting Room
// ==========================================

export interface WaitingRoomEntry {
  session_id: TelemedicineSessionId;
  patient_id: PatientId;
  appointment_id: AppointmentId;
  joined_at: ISODateString;
  estimated_wait_minutes: number;
  priority: 'normal' | 'urgent' | 'emergency';
  pre_call_checklist_completed: boolean;
  technical_check_passed: boolean;
}

export interface PreCallChecklist {
  camera_working: boolean;
  microphone_working: boolean;
  audio_output_working: boolean;
  internet_speed_adequate: boolean;
  browser_compatible: boolean;
  consent_forms_signed: boolean;
  payment_verified: boolean;
}

// ==========================================
// API Responses
// ==========================================

export interface TelemedicineSessionAPIResponse {
  session: TelemedicineSession;
  participants: SessionParticipant[];
  events: SessionEvent[];
}

export interface StartSessionRequest {
  appointment_id: AppointmentId;
  patient_id: PatientId;
  doctor_id: DoctorId;
  recording_enabled?: boolean;
}

export interface StartSessionResponse {
  session_id: TelemedicineSessionId;
  signaling_room_id: SignalingRoomId;
  signaling_server_url: string;
  turn_servers: TURNServerConfig[];
  ice_servers: ICEServerConfig[];
}

export interface TURNServerConfig {
  urls: string[];
  username: string;
  credential: string;
}

export interface ICEServerConfig {
  urls: string[];
}

// ==========================================
// Utility Functions
// ==========================================

export function isSessionActive(session: TelemedicineSession): boolean {
  return session.status === 'active' || session.status === 'connecting';
}

export function canJoinSession(session: TelemedicineSession, userId: string): boolean {
  return (
    (session.status === 'scheduled' || session.status === 'waiting_room') &&
    (session.patient_id === userId || session.doctor_id === userId)
  );
}

export function getConnectionQualityScore(quality: ConnectionQuality): number {
  const scores: Record<ConnectionQuality, number> = {
    excellent: 100,
    good: 80,
    fair: 60,
    poor: 40,
    disconnected: 0,
  };
  return scores[quality];
}

export function calculateSessionDuration(session: TelemedicineSession): number | null {
  if (!session.actual_start || !session.actual_end) {
    return null;
  }
  const start = new Date(session.actual_start).getTime();
  const end = new Date(session.actual_end).getTime();
  return Math.floor((end - start) / 1000); // seconds
}

export function requiresRecordingConsent(session: TelemedicineSession): boolean {
  return (
    session.recording_enabled &&
    (!session.recording_consent_patient || !session.recording_consent_doctor)
  );
}

export function getQualityRecommendation(stats: NetworkStats): VideoQualitySettings {
  if (stats.bandwidth_mbps >= 5 && stats.latency_ms < 100) {
    return {
      resolution: '720p',
      framerate: 30,
      bitrate_kbps: 2500,
      codec: 'VP9',
    };
  } else if (stats.bandwidth_mbps >= 2.5 && stats.latency_ms < 150) {
    return {
      resolution: '480p',
      framerate: 24,
      bitrate_kbps: 1500,
      codec: 'VP8',
    };
  } else if (stats.bandwidth_mbps >= 1 && stats.latency_ms < 200) {
    return {
      resolution: '360p',
      framerate: 20,
      bitrate_kbps: 800,
      codec: 'VP8',
    };
  } else {
    return {
      resolution: '240p',
      framerate: 15,
      bitrate_kbps: 400,
      codec: 'VP8',
    };
  }
}
