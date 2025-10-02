import type { ReactNode } from 'react';

/**
 * Estados posibles de una videollamada
 */
export type CallStatus = 'idle' | 'connecting' | 'live' | 'ended';

/**
 * Calidad de la llamada
 */
export interface CallQuality {
  label: string;
  color: string;
}

/**
 * Configuración de stream de video
 */
export interface VideoStreamConfig {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    frameRate: { ideal: number };
  };
  audio: boolean;
}

/**
 * Props para botones de control de video
 */
export interface ControlButtonProps {
  active: boolean;
  iconActive: ReactNode;
  iconInactive: ReactNode;
  label: string;
  onClick: () => void;
  size?: 'sm' | 'md';
}

/**
 * Intención visual de acciones del paciente
 */
export type ActionIntent = 'default' | 'primary' | 'success' | 'warning';

/**
 * Props para acciones rápidas del paciente
 */
export interface PatientActionProps {
  label: string;
  icon: React.JSX.Element;
  intent?: ActionIntent;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Estado del hook de video
 */
export interface VideoCallState {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  callStatus: CallStatus;
  cameraError: string | null;
}

/**
 * Acciones del hook de video
 */
export interface VideoCallActions {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
}

/**
 * Props para el componente principal de videollamada
 */
export interface EnhancedVideoCallProps {
  roomId?: string;
  className?: string;
}

/**
 * Props para overlays de video
 */
export interface VideoOverlaysProps {
  callStatus: CallStatus;
  callQuality: CallQuality;
  isScreenSharing: boolean;
  isFocusMode: boolean;
  showControls: boolean;
  showQualityOverlay: boolean;
  currentSession?: {
    doctorName: string;
    appointmentType: string;
    sessionId: string;
  };
  formattedDuration?: string;
  onToggleFocusMode: () => void;
}

/**
 * Props para el stream de video
 */
export interface VideoStreamProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  screenShareRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isVideoEnabled: boolean;
  cameraError: string | null;
  callStatus: CallStatus;
  onStartCall: () => void;
}

/**
 * Props para controles de video
 */
export interface VideoControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  showControls: boolean;
  isFocusMode: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

/**
 * Props para panel de acciones del paciente
 */
export interface PatientActionsPanelProps {
  isFocusMode: boolean;
  isQuickActionsVisible: boolean;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onClose: () => void;
  onShowSymptomModal: () => void;
  onShowMedicationModal: () => void;
  onShowVitalSignsModal: () => void;
}
