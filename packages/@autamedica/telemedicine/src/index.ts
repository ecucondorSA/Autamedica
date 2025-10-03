/**
 * @autamedica/telemedicine
 * Shared telemedicine functionality for patient and doctor apps
 */

// ========== LIB EXPORTS ==========

// Session Management
export {
  createTelemedicineSession,
  getTelemedicineSession,
  getSessionByRoomId,
  updateSessionStatus,
  joinSessionAsParticipant,
  updateParticipantMediaState,
  updateConnectionStats,
  leaveSession,
  getSessionParticipants,
  logSessionEvent,
  getSessionEvents,
  getUserActiveSessions,
  getUserScheduledSessions,
  subscribeToSession,
  unsubscribeFromSession,
  generateRoomId,
  calculateSessionDuration,
  reportConnectionQuality,
  getSessionConnectionQuality,
  type SessionStatus,
  type ParticipantRole,
  type TelemedicineSession,
  type SessionParticipant,
  type SessionEvent,
} from './lib/telemedicine';

// Session Chat
export {
  sendChatMessage,
  getSessionMessages,
  getUnreadCount,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage,
  updateMessageMetadata,
  searchMessages,
  subscribeToSessionChat,
  unsubscribeFromChat,
  sendTypingIndicator,
  subscribeToTypingIndicators,
  getMessageStats,
  exportChatHistory,
  type MessageType,
  type SenderRole,
  type ChatMessage,
  type MessageStats,
  type TypingIndicator,
} from './lib/sessionChat';

// Session Recording (HIPAA)
export {
  checkRecordingConsent,
  requestRecordingConsent,
  startRecording,
  stopRecording,
  getSessionRecording,
  getRecording,
  logRecordingAccess,
  deleteRecording,
  updateRecordingStatus,
  getUserRecordings,
  getRecordingAuditTrail,
  type RecordingStatus,
  type SessionRecording,
} from './lib/sessionRecording';

// Session Files
export {
  validateFile,
  generateFilePath,
  uploadSessionFile,
  uploadMultipleFiles,
  deleteSessionFile,
  listSessionFiles,
  downloadSessionFile,
  getFileUrl,
  isImage,
  isDocument,
  formatFileSize,
  getFileExtension,
  getFileIcon,
  createImageThumbnail,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALL_ALLOWED_TYPES,
  type SessionFile,
  type FileUploadResult,
} from './lib/sessionFiles';

// Notifications
export {
  sendNotification,
  sendIncomingCallNotification,
  sendCallMissedNotification,
  sendSessionStartingNotification,
  sendMessageReceivedNotification,
  sendRecordingStartedNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotifications,
  getUserNotifications,
  getUnreadNotificationCount,
  deleteNotification,
  deleteExpiredNotifications,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  savePushSubscription,
  requestNotificationPermission,
  showBrowserNotification,
  type NotificationType,
  type NotificationStatus,
  type NotificationPriority,
  type CallNotification,
} from './lib/notifications';

// ========== HOOKS EXPORTS ==========

// Connection Quality
export {
  useConnectionQuality,
  type ConnectionQuality,
  type ConnectionStats,
  type DetailedStats,
  type UseConnectionQualityOptions,
  type UseConnectionQualityReturn,
} from './hooks/useConnectionQuality';

// Connection Monitor
export {
  useConnectionMonitor,
  type UseConnectionMonitorOptions,
  type UseConnectionMonitorReturn,
} from './hooks/useConnectionMonitor';

// Session Chat Hook
export {
  useSessionChat,
  type UseSessionChatOptions,
  type UseSessionChatReturn,
} from './hooks/useSessionChat';

// Session Recording Hook
export {
  useSessionRecording,
  type UseSessionRecordingOptions,
  type UseSessionRecordingReturn,
} from './hooks/useSessionRecording';

// Session Files Hook
export {
  useSessionFiles,
  type UseSessionFilesOptions,
  type UseSessionFilesReturn,
} from './hooks/useSessionFiles';

// Notifications Hook
export {
  useNotifications,
  type UseNotificationsOptions,
  type UseNotificationsReturn,
} from './hooks/useNotifications';

// Reconnection Hook
export {
  useReconnection,
  type ConnectionState,
  type ReconnectionConfig,
  type UseReconnectionOptions,
  type UseReconnectionReturn,
} from './hooks/useReconnection';

// ========== COMPONENTS EXPORTS ==========

// Connection Quality Indicator
export { ConnectionQualityIndicator } from './components/ConnectionQualityIndicator';
export type { ConnectionQualityIndicatorProps } from './components/ConnectionQualityIndicator';

// Session Chat Component
export { SessionChat } from './components/SessionChat';
export type { SessionChatProps } from './components/SessionChat';

// Recording Controls
export { RecordingControls } from './components/RecordingControls';
export type { RecordingControlsProps } from './components/RecordingControls';

// File Sharing
export { FileSharing } from './components/FileSharing';
export type { FileSharingProps } from './components/FileSharing';

// Waiting Room
export { WaitingRoom } from './components/WaitingRoom';
export type { WaitingRoomProps } from './components/WaitingRoom';

// Notification Center
export { NotificationCenter } from './components/NotificationCenter';
export type { NotificationCenterProps } from './components/NotificationCenter';

// Reconnection Indicator
export {
  ReconnectionIndicator,
  ReconnectionBadge,
  ReconnectionStatus,
} from './components/ReconnectionIndicator';
export type {
  ReconnectionIndicatorProps,
  ReconnectionBadgeProps,
  ReconnectionStatusProps,
} from './components/ReconnectionIndicator';
