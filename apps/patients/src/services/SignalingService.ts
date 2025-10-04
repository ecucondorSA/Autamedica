/**
 * Servicio de señalización para WebRTC
 *
 * Maneja la coordinación entre peers para establecer conexión WebRTC:
 * - Intercambio de SDP (Session Description Protocol)
 * - Intercambio de ICE candidates
 * - Gestión de salas y presencia
 *
 * NOTA: Este servicio se conectará al Signaling Server (FASE 4)
 * Por ahora incluye la interfaz y mock para desarrollo local
 */

import { EventEmitter } from 'events';

/**
 * Eventos que emite el servicio de señalización
 */
export enum SignalingEvent {
  /** Conexión establecida con servidor */
  CONNECTED = 'connected',
  /** Desconexión del servidor */
  DISCONNECTED = 'disconnected',
  /** Error de conexión */
  ERROR = 'error',

  /** Usuario se unió a la sala */
  USER_JOINED = 'user-joined',
  /** Usuario salió de la sala */
  USER_LEFT = 'user-left',

  /** Oferta SDP recibida */
  OFFER_RECEIVED = 'offer-received',
  /** Respuesta SDP recibida */
  ANSWER_RECEIVED = 'answer-received',
  /** ICE candidate recibido */
  ICE_CANDIDATE_RECEIVED = 'ice-candidate-received',

  /** Llamada iniciada por peer remoto */
  CALL_INITIATED = 'call-initiated',
  /** Llamada terminada */
  CALL_ENDED = 'call-ended',
}

/**
 * Mensajes del protocolo de señalización
 */
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'call-init' | 'call-end';
  roomId: string;
  userId: string;
  data?: any;
}

export interface SignalingConfig {
  /** URL del servidor de señalización (WebSocket) */
  serverUrl: string;
  /** ID del usuario actual */
  userId: string;
  /** Token de autenticación */
  authToken?: string;
  /** Auto-reconexión */
  autoReconnect?: boolean;
  /** Intervalo de heartbeat (ms) */
  heartbeatInterval?: number;
}

/**
 * Cliente de señalización para WebRTC
 */
export class SignalingService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<SignalingConfig>;
  private currentRoomId: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(config: SignalingConfig) {
    super();

    this.config = {
      serverUrl: config.serverUrl,
      userId: config.userId,
      authToken: config.authToken || '',
      autoReconnect: config.autoReconnect ?? true,
      heartbeatInterval: config.heartbeatInterval ?? 30000, // 30s
    };
  }

  /**
   * Conectar al servidor de señalización
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // console.log('[SignalingService] Connecting to:', this.config.serverUrl);

      try {
        // Crear WebSocket connection
        const wsUrl = `${this.config.serverUrl}?userId=${this.config.userId}${
          this.config.authToken ? `&token=${this.config.authToken}` : ''
        }`;

        this.ws = new WebSocket(wsUrl);

        // Handler: Connection opened
        this.ws.onopen = () => {
          // console.log('[SignalingService] Connected successfully');
          this.isConnected = true;
          this.emit(SignalingEvent.CONNECTED);
          this.startHeartbeat();
          resolve();
        };

        // Handler: Message received
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // Handler: Connection error
        this.ws.onerror = (error) => {
          console.error('[SignalingService] WebSocket error:', error);
          this.emit(SignalingEvent.ERROR, error);
          reject(error);
        };

        // Handler: Connection closed
        this.ws.onclose = (event) => {
          // console.log('[SignalingService] Connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit(SignalingEvent.DISCONNECTED);

          // Auto-reconnect si está habilitado
          if (this.config.autoReconnect && event.code !== 1000) {
            // console.log('[SignalingService] Attempting reconnection in 5s...');
            this.reconnectTimer = setTimeout(() => {
              this.connect();
            }, 5000);
          }
        };
      } catch (error) {
        console.error('[SignalingService] Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    // console.log('[SignalingService] Disconnecting...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.currentRoomId = null;
  }

  /**
   * Unirse a una sala de videoconsulta
   */
  joinRoom(roomId: string): void {
    // console.log('[SignalingService] Joining room:', roomId);

    this.currentRoomId = roomId;

    const message: SignalingMessage = {
      type: 'join-room',
      roomId,
      userId: this.config.userId,
    };

    this.send(message);
  }

  /**
   * Salir de la sala actual
   */
  leaveRoom(): void {
    if (!this.currentRoomId) {
      console.warn('[SignalingService] Not in any room');
      return;
    }

    // console.log('[SignalingService] Leaving room:', this.currentRoomId);

    const message: SignalingMessage = {
      type: 'leave-room',
      roomId: this.currentRoomId,
      userId: this.config.userId,
    };

    this.send(message);
    this.currentRoomId = null;
  }

  /**
   * Enviar oferta SDP al peer remoto
   */
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void {
    // console.log('[SignalingService] Sending SDP offer to room:', roomId);

    const message: SignalingMessage = {
      type: 'offer',
      roomId,
      userId: this.config.userId,
      data: offer,
    };

    this.send(message);
  }

  /**
   * Enviar respuesta SDP al peer remoto
   */
  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): void {
    // console.log('[SignalingService] Sending SDP answer to room:', roomId);

    const message: SignalingMessage = {
      type: 'answer',
      roomId,
      userId: this.config.userId,
      data: answer,
    };

    this.send(message);
  }

  /**
   * Enviar ICE candidate al peer remoto
   */
  sendIceCandidate(roomId: string, candidate: RTCIceCandidate): void {
    // console.log('[SignalingService] Sending ICE candidate to room:', roomId);

    const message: SignalingMessage = {
      type: 'ice-candidate',
      roomId,
      userId: this.config.userId,
      data: {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
      },
    };

    this.send(message);
  }

  /**
   * Enviar mensaje al servidor
   */
  private send(message: SignalingMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[SignalingService] Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[SignalingService] Failed to send message:', error);
    }
  }

  /**
   * Manejar mensajes recibidos del servidor
   */
  private handleMessage(data: string): void {
    try {
      const message: SignalingMessage = JSON.parse(data);

      // console.log('[SignalingService] Message received:', message.type);

      switch (message.type) {
        case 'offer':
          this.emit(SignalingEvent.OFFER_RECEIVED, {
            roomId: message.roomId,
            userId: message.userId,
            offer: message.data,
          });
          break;

        case 'answer':
          this.emit(SignalingEvent.ANSWER_RECEIVED, {
            roomId: message.roomId,
            userId: message.userId,
            answer: message.data,
          });
          break;

        case 'ice-candidate':
          this.emit(SignalingEvent.ICE_CANDIDATE_RECEIVED, {
            roomId: message.roomId,
            userId: message.userId,
            candidate: message.data,
          });
          break;

        case 'call-init':
          this.emit(SignalingEvent.CALL_INITIATED, {
            roomId: message.roomId,
            userId: message.userId,
          });
          break;

        case 'call-end':
          this.emit(SignalingEvent.CALL_ENDED, {
            roomId: message.roomId,
            userId: message.userId,
          });
          break;

        default:
          console.warn('[SignalingService] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[SignalingService] Failed to parse message:', error);
    }
  }

  /**
   * Iniciar heartbeat para mantener conexión viva
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Detener heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  get connected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtener sala actual
   */
  get roomId(): string | null {
    return this.currentRoomId;
  }
}

/**
 * Instancia singleton del servicio de señalización
 * (se inicializa cuando el usuario inicia una llamada)
 */
let signalingInstance: SignalingService | null = null;

/**
 * Obtener instancia del servicio de señalización
 */
export function getSignalingService(config?: SignalingConfig): SignalingService {
  if (!signalingInstance && config) {
    signalingInstance = new SignalingService(config);
  }

  if (!signalingInstance) {
    throw new Error('SignalingService not initialized. Provide config on first call.');
  }

  return signalingInstance;
}

/**
 * Limpiar instancia singleton (útil para testing)
 */
export function resetSignalingService(): void {
  if (signalingInstance) {
    signalingInstance.disconnect();
    signalingInstance = null;
  }
}
