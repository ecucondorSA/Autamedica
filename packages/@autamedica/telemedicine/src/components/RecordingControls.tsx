/**
 * Recording Controls Component
 * HIPAA-compliant consent and recording controls
 *
 * @module RecordingControls
 */

'use client';

import { useState } from 'react';
import { useSessionRecording } from '@/hooks/useSessionRecording';
import { logger } from '@autamedica/shared';

export interface RecordingControlsProps {
  sessionId: string;
  userId: string;
  userRole: 'patient' | 'doctor';
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  className?: string;
}

/**
 * Recording Controls Component
 */
export function RecordingControls({
  sessionId,
  userId,
  userRole,
  onRecordingStart,
  onRecordingStop,
  className = '',
}: RecordingControlsProps) {
  const {
    recording,
    isRecording,
    canRecord,
    consent,
    error,
    loading,
    giveConsent,
    startRecording,
    stopRecording,
  } = useSessionRecording({
    sessionId,
    userId,
    userRole,
  });

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showRecordingInfo, setShowRecordingInfo] = useState(false);

  const userHasConsented = userRole === 'patient' ? consent.patient : consent.doctor;
  const otherPartyConsent = userRole === 'patient' ? consent.doctor : consent.patient;

  const handleGiveConsent = async () => {
    try {
      await giveConsent();
      setShowConsentModal(false);
    } catch (err) {
      logger.error('Failed to give consent:', err);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      onRecordingStart?.();
    } catch (err) {
      logger.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
      onRecordingStop?.();
    } catch (err) {
      logger.error('Failed to stop recording:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-gray-100 p-3 ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
        <span className="text-sm text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Consent Status */}
      {!userHasConsented && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
          <div className="mb-3 flex items-start gap-2">
            <span className="text-2xl">🎥</span>
            <div>
              <p className="font-semibold text-blue-900">Consentimiento de Grabación</p>
              <p className="text-sm text-blue-700">
                Esta consulta puede ser grabada con fines médicos y de auditoría (HIPAA).
              </p>
            </div>
          </div>

          <div className="mb-3 space-y-2 rounded-lg bg-white p-3 text-xs text-gray-700">
            <p className="font-medium">Al dar su consentimiento, usted acepta que:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>La consulta será grabada en video y audio</li>
              <li>La grabación se almacenará de forma segura y encriptada</li>
              <li>Solo usted y su médico podrán acceder a la grabación</li>
              <li>Todos los accesos quedarán registrados (auditoría HIPAA)</li>
              <li>La grabación puede ser eliminada cuando lo solicite</li>
            </ul>
          </div>

          <button
            onClick={() => setShowConsentModal(true)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Dar Consentimiento
          </button>
        </div>
      )}

      {/* Waiting for Other Party */}
      {userHasConsented && !otherPartyConsent && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Esperando consentimiento
              </p>
              <p className="text-xs text-yellow-600">
                El {userRole === 'patient' ? 'médico' : 'paciente'} debe dar su consentimiento antes de iniciar la grabación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      {canRecord && (
        <div className="rounded-lg border border-gray-300 bg-white p-4">
          {!isRecording ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Listo para grabar</p>
                    <p className="text-xs text-gray-600">Ambas partes han dado consentimiento</p>
                  </div>
                </div>

                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                >
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                  Iniciar Grabación
                </button>
              </div>

              <button
                onClick={() => setShowRecordingInfo(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                ¿Cómo funciona la grabación?
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600">Grabando...</p>
                    <p className="text-xs text-gray-600">
                      Duración: {recording?.started_at && formatDuration(new Date(recording.started_at))}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-900"
                >
                  <div className="h-3 w-3 rounded-sm bg-white"></div>
                  Detener
                </button>
              </div>

              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                ⚠️ Esta consulta está siendo grabada con consentimiento de ambas partes
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Consentimiento de Grabación
            </h3>

            <div className="mb-4 space-y-3 text-sm text-gray-700">
              <p>
                Por favor, lea cuidadosamente antes de dar su consentimiento:
              </p>

              <div className="rounded-lg bg-gray-50 p-3 text-xs">
                <p className="mb-2 font-medium">Privacidad y Seguridad (HIPAA):</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Grabación encriptada end-to-end</li>
                  <li>Almacenamiento seguro en servidores certificados HIPAA</li>
                  <li>Acceso restringido solo a participantes de la consulta</li>
                  <li>Registro de auditoría de todos los accesos</li>
                  <li>Puede solicitar eliminación en cualquier momento</li>
                </ul>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 text-xs">
                <p className="mb-2 font-medium">Uso de la Grabación:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Fines médicos y de seguimiento del tratamiento</li>
                  <li>Revisión por parte del equipo médico si es necesario</li>
                  <li>Cumplimiento de regulaciones sanitarias</li>
                  <li>No se compartirá sin su autorización explícita</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGiveConsent}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Acepto y Doy Consentimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Info Modal */}
      {showRecordingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Información sobre la Grabación
            </h3>

            <div className="mb-4 space-y-3 text-sm text-gray-700">
              <div>
                <p className="mb-1 font-medium">¿Qué se graba?</p>
                <p className="text-xs">Video, audio y pantalla compartida durante la consulta.</p>
              </div>

              <div>
                <p className="mb-1 font-medium">¿Dónde se almacena?</p>
                <p className="text-xs">
                  En servidores seguros certificados HIPAA con encriptación AES-256.
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium">¿Quién puede acceder?</p>
                <p className="text-xs">
                  Solo usted y su médico. Todo acceso queda registrado para auditoría.
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium">¿Cuánto tiempo se conserva?</p>
                <p className="text-xs">
                  Según las regulaciones médicas (mínimo 7 años). Puede solicitar eliminación.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRecordingInfo(false)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-900"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format recording duration
 */
function formatDuration(startTime: Date): string {
  const seconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
