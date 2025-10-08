/**
 * Servicio de Señalización WebRTC usando Supabase Realtime
 *
 * En lugar de un servidor WebSocket dedicado, usamos Supabase Realtime
 * como canal de comunicación para intercambiar SDP offers/answers e ICE candidates.
 *
 * Ventajas:
 * - No requiere servidor adicional
 * - Escalable automáticamente
 * - Autenticación integrada con Supabase Auth
 * - Real-time bidireccional
 */

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@autamedica/shared';

export type SignalingMessageType =
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'join-room'
  | 'leave-room'
  | 'peer-joined'
  | 'peer-left';

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  from: string;
  to?: string;
  data?: any;
  timestamp: number;
}

export interface SignalingCallbacks {
  onOffer?: (offer: RTCSessionDescriptionInit, from: string) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit, from: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, from: string) => void;
  onPeerJoined?: (peerId: string) => void;
  onPeerLeft?: (peerId: string) => void;
  onError?: (error: Error) => void;
}

export class SupabaseSignalingService {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private currentRoomId: string | null = null;
  private userId: string;
  private callbacks: SignalingCallbacks;

  constructor(
    supabase: SupabaseClient,
    userId: string,
    callbacks: SignalingCallbacks = {}
  ) {
    this.supabase = supabase;
    this.userId = userId;
    this.callbacks = callbacks;
  }

  /**
   * Unirse a una sala de videollamada
   */
  async joinRoom(roomId: string): Promise<void> {
    try {
      // Salir de sala anterior si existe
      if (this.currentRoomId) {
        await this.leaveRoom();
      }

      this.currentRoomId = roomId;

      // Crear canal de Realtime para esta sala
      this.channel = this.supabase.channel(`webrtc:${roomId}`, {
        config: {
          broadcast: { self: true }, // Recibir propios mensajes para debugging
          presence: { key: this.userId },
        },
      });

      // Suscribirse a mensajes broadcast
      this.channel.on('broadcast', { event: 'signaling' }, (payload) => {
        this.handleSignalingMessage(payload.payload as SignalingMessage);
      });

      // Suscribirse a eventos de presencia
      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logger.info('[Signaling] Peer joined:', key);
        if (key !== this.userId && this.callbacks.onPeerJoined) {
          this.callbacks.onPeerJoined(key);
        }
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logger.info('[Signaling] Peer left:', key);
        if (key !== this.userId && this.callbacks.onPeerLeft) {
          this.callbacks.onPeerLeft(key);
        }
      });

      // Suscribirse al canal
      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('[Signaling] Subscribed to room:', roomId);

          // Trackear presencia
          await this.channel?.track({
            user_id: this.userId,
            online_at: new Date().toISOString(),
          });

          // Notificar que nos unimos
          await this.sendMessage({
            type: 'join-room',
            roomId,
            from: this.userId,
            timestamp: Date.now(),
          });
        }
      });
    } catch (error) {
      logger.error('[Signaling] Error joining room:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Salir de la sala actual
   */
  async leaveRoom(): Promise<void> {
    if (!this.channel || !this.currentRoomId) {
      return;
    }

    try {
      // Notificar que salimos
      await this.sendMessage({
        type: 'leave-room',
        roomId: this.currentRoomId,
        from: this.userId,
        timestamp: Date.now(),
      });

      // Untrack presencia
      await this.channel.untrack();

      // Desuscribirse del canal
      await this.supabase.removeChannel(this.channel);

      this.channel = null;
      this.currentRoomId = null;

      logger.info('[Signaling] Left room');
    } catch (error) {
      logger.error('[Signaling] Error leaving room:', error);
    }
  }

  /**
   * Enviar oferta SDP a peer remoto
   */
  async sendOffer(offer: RTCSessionDescriptionInit, to?: string): Promise<void> {
    if (!this.currentRoomId) {
      throw new Error('Not in a room');
    }

    await this.sendMessage({
      type: 'offer',
      roomId: this.currentRoomId,
      from: this.userId,
      to,
      data: offer,
      timestamp: Date.now(),
    });

    logger.info('[Signaling] Sent offer to:', to || 'room');
  }

  /**
   * Enviar respuesta SDP a peer remoto
   */
  async sendAnswer(answer: RTCSessionDescriptionInit, to: string): Promise<void> {
    if (!this.currentRoomId) {
      throw new Error('Not in a room');
    }

    await this.sendMessage({
      type: 'answer',
      roomId: this.currentRoomId,
      from: this.userId,
      to,
      data: answer,
      timestamp: Date.now(),
    });

    logger.info('[Signaling] Sent answer to:', to);
  }

  /**
   * Enviar ICE candidate a peer remoto
   */
  async sendIceCandidate(candidate: RTCIceCandidateInit, to?: string): Promise<void> {
    if (!this.currentRoomId) {
      throw new Error('Not in a room');
    }

    await this.sendMessage({
      type: 'ice-candidate',
      roomId: this.currentRoomId,
      from: this.userId,
      to,
      data: candidate,
      timestamp: Date.now(),
    });
  }

  /**
   * Enviar mensaje genérico de señalización
   */
  private async sendMessage(message: SignalingMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message,
    });
  }

  /**
   * Manejar mensaje de señalización recibido
   */
  private handleSignalingMessage(message: SignalingMessage): void {
    // Ignorar mensajes propios
    if (message.from === this.userId) {
      return;
    }

    // Si el mensaje tiene destinatario específico, verificar que seamos nosotros
    if (message.to && message.to !== this.userId) {
      return;
    }

    logger.info('[Signaling] Received message:', message.type, 'from:', message.from);

    switch (message.type) {
      case 'offer':
        if (this.callbacks.onOffer) {
          this.callbacks.onOffer(message.data, message.from);
        }
        break;

      case 'answer':
        if (this.callbacks.onAnswer) {
          this.callbacks.onAnswer(message.data, message.from);
        }
        break;

      case 'ice-candidate':
        if (this.callbacks.onIceCandidate) {
          this.callbacks.onIceCandidate(message.data, message.from);
        }
        break;

      case 'peer-joined':
        if (this.callbacks.onPeerJoined) {
          this.callbacks.onPeerJoined(message.from);
        }
        break;

      case 'peer-left':
        if (this.callbacks.onPeerLeft) {
          this.callbacks.onPeerLeft(message.from);
        }
        break;

      default:
        logger.warn('[Signaling] Unknown message type:', message.type);
    }
  }

  /**
   * Obtener peers actuales en la sala
   */
  async getPeersInRoom(): Promise<string[]> {
    if (!this.channel) {
      return [];
    }

    const presenceState = this.channel.presenceState();
    return Object.keys(presenceState).filter(key => key !== this.userId);
  }

  /**
   * Cleanup
   */
  async disconnect(): Promise<void> {
    await this.leaveRoom();
  }
}
