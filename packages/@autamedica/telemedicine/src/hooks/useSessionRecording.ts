/**
 * Session Recording Hook
 * Manages recording lifecycle with consent tracking
 *
 * @module useSessionRecording
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  checkRecordingConsent,
  requestRecordingConsent,
  startRecording,
  stopRecording,
  getSessionRecording,
  logRecordingAccess,
  type SessionRecording,
  type RecordingStatus,
} from '@/lib/sessionRecording';

export interface UseSessionRecordingOptions {
  sessionId: string;
  userId: string;
  userRole: 'patient' | 'doctor';
  autoLoadRecording?: boolean;
}

export interface UseSessionRecordingReturn {
  // State
  recording: SessionRecording | null;
  isRecording: boolean;
  canRecord: boolean;
  consent: {
    patient: boolean;
    doctor: boolean;
  };
  error: string | null;
  loading: boolean;

  // Actions
  giveConsent: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  refreshRecording: () => Promise<void>;

  // MediaRecorder (if recording locally)
  mediaRecorder: MediaRecorder | null;
}

/**
 * Hook: Manage session recording with HIPAA consent
 */
export function useSessionRecording(options: UseSessionRecordingOptions): UseSessionRecordingReturn {
  const { sessionId, userId, userRole, autoLoadRecording = true } = options;

  const [recording, setRecording] = useState<SessionRecording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [consent, setConsent] = useState({ patient: false, doctor: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Load existing recording and check consent
  const loadRecordingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check consent status
      const consentStatus = await checkRecordingConsent(sessionId);
      setCanRecord(consentStatus.canRecord);
      setConsent({
        patient: consentStatus.patientConsent,
        doctor: consentStatus.doctorConsent,
      });

      // Load existing recording if available
      if (autoLoadRecording) {
        const existingRecording = await getSessionRecording(sessionId);
        if (existingRecording) {
          setRecording(existingRecording);
          setIsRecording(existingRecording.status === 'recording');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recording data';
      setError(errorMessage);
      console.error('Error loading recording data:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, autoLoadRecording]);

  // Load on mount
  useEffect(() => {
    loadRecordingData();
  }, [loadRecordingData]);

  // Give consent
  const handleGiveConsent = useCallback(async () => {
    try {
      setError(null);
      await requestRecordingConsent(sessionId, userId, userRole);

      // Reload consent status
      const consentStatus = await checkRecordingConsent(sessionId);
      setCanRecord(consentStatus.canRecord);
      setConsent({
        patient: consentStatus.patientConsent,
        doctor: consentStatus.doctorConsent,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to give consent';
      setError(errorMessage);
      throw err;
    }
  }, [sessionId, userId, userRole]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    try {
      setError(null);

      if (!canRecord) {
        throw new Error('Cannot start recording without consent from both parties');
      }

      // Create recording record in database
      const newRecording = await startRecording(sessionId, userId);
      setRecording(newRecording);
      setIsRecording(true);

      // Note: Actual MediaRecorder setup would be done in the component
      // that uses this hook, as it needs access to MediaStream
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      throw err;
    }
  }, [sessionId, userId, canRecord]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    try {
      setError(null);

      if (!recording) {
        throw new Error('No active recording to stop');
      }

      // Stop MediaRecorder if exists
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // Calculate metadata
      const metadata = {
        fileSizeBytes: recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0),
        durationSeconds: recording.started_at
          ? Math.floor((Date.now() - new Date(recording.started_at).getTime()) / 1000)
          : undefined,
      };

      // Update recording record
      const updatedRecording = await stopRecording(recording.id, metadata);
      setRecording(updatedRecording);
      setIsRecording(false);

      // Clear chunks
      recordedChunksRef.current = [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      throw err;
    }
  }, [recording]);

  // Refresh recording
  const refreshRecording = useCallback(async () => {
    await loadRecordingData();
  }, [loadRecordingData]);

  return {
    recording,
    isRecording,
    canRecord,
    consent,
    error,
    loading,
    giveConsent: handleGiveConsent,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    refreshRecording,
    mediaRecorder: mediaRecorderRef.current,
  };
}
