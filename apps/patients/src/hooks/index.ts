/**
 * Patient Portal Hooks
 *
 * Custom React hooks for patient-specific functionality.
 * All hooks use Supabase for data persistence and real-time updates.
 */

// Core hooks
export { useAnamnesis } from './useAnamnesis';
export { useTelemedicine } from './useTelemedicine';
export { useCommunity } from './useCommunity';
export { usePatientScreenings } from './usePatientScreenings';
export { useMedicalHistory } from './useMedicalHistory';
export { usePreventiveScreenings } from './usePreventiveScreenings';

// Reproductive health hooks
export { useReproductiveHealthSpecialists } from './useReproductiveHealthSpecialists';
export { useReproductiveHealthAppointments } from './useReproductiveHealthAppointments';
export { useHealthCentersGeolocation } from './useHealthCentersGeolocation';
export { useMedicalChats, useChatMessages } from './useMedicalChat';

// Telemedicine hooks
export { useTelemedicineSignaling } from './useTelemedicineSignaling';
export { useVideoCall } from './useVideoCall';

// Session hooks
export { usePatientSession } from './usePatientSession';

// Legacy hooks (deprecated - to be removed)
export function useActiveSession() {
  return { session: null };
}

export function usePatientData(patientId: string | null) {
  return { patient: null };
}

// Re-export types for convenience
export type {
  // Anamnesis
  Anamnesis,
  AnamnesisSection,
  AnamnesisStatus,
  AnamnesisSectionData,
  AnamnesisProgressResponse,

  // Telemedicine
  TelemedicineSession,
  SessionParticipant,
  SessionEvent,
  MediaState,
  ConnectionQuality,
  StartSessionResponse,

  // Community
  CommunityGroup,
  CommunityPost,
  PostComment,
  PostReaction,
  ReactionType,
  GroupMembership,
  CommunityFeedFilters,
} from '@autamedica/types';