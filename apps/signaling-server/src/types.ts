/**
 * TypeScript types for signaling server
 */

/**
 * WebRTC types (not available in Node.js, so we define them here)
 */
export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'call-init' | 'call-end';
  roomId: string;
  userId: string;
  data?: any;
}

export interface Room {
  id: string;
  users: RoomUser[];
  createdAt: Date;
  lastActivity: Date;
}

export interface RoomUser {
  userId: string;
  role: 'patient' | 'doctor';
  joinedAt: Date;
}

/**
 * Connection Statistics
 */
export interface ConnectionStats {
  bitrate: number;
  latency: number;
  packetLoss: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Socket.io typed events
 */

// Events sent from client to server
export interface ClientToServerEvents {
  'join-room': (data: { roomId: string }) => void;
  'leave-room': (data: { roomId: string }) => void;
  'offer': (data: { roomId: string; offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { roomId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { roomId: string; candidate: RTCIceCandidateInit }) => void;
  'call-init': (data: { roomId: string }) => void;
  'call-end': (data: { roomId: string }) => void;
  'connection-stats': (data: { roomId: string; stats: ConnectionStats }) => void;
}

// Events sent from server to client
export interface ServerToClientEvents {
  'room-joined': (data: { roomId: string; users: RoomUser[] }) => void;
  'user-joined': (data: { roomId: string; userId: string; role: 'patient' | 'doctor' }) => void;
  'user-left': (data: { roomId: string; userId: string }) => void;
  'offer': (data: { roomId: string; userId: string; offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { roomId: string; userId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { roomId: string; userId: string; candidate: RTCIceCandidateInit }) => void;
  'call-init': (data: { roomId: string; userId: string }) => void;
  'call-end': (data: { roomId: string; userId: string }) => void;
  'peer-stats': (data: { roomId: string; userId: string; stats: ConnectionStats }) => void;
  'error': (data: { message: string }) => void;
}

// Socket data
export interface SocketData {
  userId: string;
  userRole: 'patient' | 'doctor';
}
