/**
 * Room Manager para gestión de salas de videoconsulta
 * 
 * Gestiona:
 * - Creación y limpieza de salas
 * - Join/leave de usuarios
 * - Validación de permisos
 * - Tracking en Supabase (opcional)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger.js';
import type { Room, RoomUser } from './types.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Inicializar Supabase si hay credenciales
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      logger.info('[RoomManager] Supabase integration enabled');
    } else {
      logger.warn('[RoomManager] Supabase not configured, running in-memory only');
    }

    // Cleanup de salas inactivas cada 5 minutos
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000);
  }

  /**
   * Join room
   */
  async joinRoom(roomId: string, userId: string, role: 'patient' | 'doctor'): Promise<Room> {
    let room = this.rooms.get(roomId);

    if (!room) {
      // Crear nueva sala
      room = {
        id: roomId,
        users: [],
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      this.rooms.set(roomId, room);
      logger.info(`[RoomManager] Created new room: ${roomId}`);
    }

    // Verificar si usuario ya está en sala
    const existingUser = room.users.find(u => u.userId === userId);
    if (existingUser) {
      logger.warn(`[RoomManager] User ${userId} already in room ${roomId}`);
      return room;
    }

    // Verificar límite de usuarios (máximo 2: paciente + médico)
    if (room.users.length >= 2) {
      logger.error(`[RoomManager] Room ${roomId} is full`);
      throw new Error('Room is full');
    }

    // Agregar usuario a sala
    const roomUser: RoomUser = {
      userId,
      role,
      joinedAt: new Date(),
    };

    room.users.push(roomUser);
    room.lastActivity = new Date();

    logger.info(`[RoomManager] User ${userId} (${role}) joined room ${roomId}`);

    // Registrar en Supabase (opcional)
    if (this.supabase) {
      try {
        await this.supabase.from('telemedicine_room_participants').insert({
          room_id: roomId,
          user_id: userId,
          role,
          joined_at: roomUser.joinedAt.toISOString(),
        });
      } catch (error) {
        logger.error('[RoomManager] Failed to log to Supabase:', error);
        // No fallar si Supabase falla
      }
    }

    return room;
  }

  /**
   * Leave room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) {
      logger.warn(`[RoomManager] Room ${roomId} not found`);
      return;
    }

    // Remover usuario
    room.users = room.users.filter(u => u.userId !== userId);
    room.lastActivity = new Date();

    logger.info(`[RoomManager] User ${userId} left room ${roomId}. Remaining users: ${room.users.length}`);

    // Si sala está vacía, eliminarla
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
      logger.info(`[RoomManager] Deleted empty room: ${roomId}`);
    }

    // Registrar en Supabase (opcional)
    if (this.supabase) {
      try {
        await this.supabase
          .from('telemedicine_room_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .is('left_at', null);
      } catch (error) {
        logger.error('[RoomManager] Failed to log to Supabase:', error);
      }
    }
  }

  /**
   * Get room
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms for a user
   */
  async getUserRooms(userId: string): Promise<string[]> {
    const userRooms: string[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.some(u => u.userId === userId)) {
        userRooms.push(roomId);
      }
    }

    return userRooms;
  }

  /**
   * Get active rooms count
   */
  getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  /**
   * Cleanup inactive rooms (sin actividad en más de 1 hora)
   */
  private cleanupInactiveRooms(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.lastActivity < oneHourAgo) {
        this.rooms.delete(roomId);
        cleanedCount++;
        logger.info(`[RoomManager] Cleaned up inactive room: ${roomId}`);
      }
    }

    if (cleanedCount > 0) {
      logger.info(`[RoomManager] Cleanup complete. Removed ${cleanedCount} inactive rooms`);
    }
  }

  /**
   * Validate room access (para verificar permisos)
   */
  async validateRoomAccess(roomId: string, userId: string): Promise<boolean> {
    // Por ahora, permitir acceso a cualquier sala
    // TODO: Implementar validación con Supabase (verificar que userId pertenece a la sesión)

    if (!this.supabase) {
      return true; // Permitir sin validación si no hay Supabase
    }

    try {
      const { data, error } = await this.supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('id', roomId)
        .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
        .single();

      if (error || !data) {
        logger.warn(`[RoomManager] Access denied for user ${userId} to room ${roomId}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('[RoomManager] Error validating room access:', error);
      return false; // Denegar por defecto en caso de error
    }
  }
}
