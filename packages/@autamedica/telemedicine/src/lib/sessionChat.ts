/**
 * Session Chat Management
 * Sistema de chat en tiempo real para sesiones de videoconsulta
 *
 * @module sessionChat
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

/**
 * Message Types
 */
export type MessageType = 'text' | 'file' | 'image' | 'system';

/**
 * Sender Role
 */
export type SenderRole = 'patient' | 'doctor';

/**
 * Chat Message
 */
export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_role: SenderRole;
  message: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size_bytes?: number;
  file_type?: string;
  delivered: boolean;
  read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Send a chat message
 */
export async function sendChatMessage(data: {
  sessionId: string;
  senderId: string;
  senderRole: SenderRole;
  message: string;
  messageType?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileType?: string;
  metadata?: Record<string, any>;
}): Promise<ChatMessage> {
  const supabase = getSupabaseClient();

  const { data: chatMessage, error } = await supabase
    .from('session_chat_messages')
    .insert({
      session_id: data.sessionId,
      sender_id: data.senderId,
      sender_role: data.senderRole,
      message: data.message,
      message_type: data.messageType || 'text',
      file_url: data.fileUrl,
      file_name: data.fileName,
      file_size_bytes: data.fileSizeBytes,
      file_type: data.fileType,
      metadata: data.metadata || {},
      delivered: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return chatMessage as ChatMessage;
}

/**
 * Get all messages for a session
 */
export async function getSessionMessages(
  sessionId: string,
  limit?: number
): Promise<ChatMessage[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('session_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  return data as ChatMessage[];
}

/**
 * Get unread messages count for a session
 */
export async function getUnreadCount(
  sessionId: string,
  userId: string
): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from('session_chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('read', false)
    .neq('sender_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<ChatMessage> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_chat_messages')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark message as read: ${error.message}`);
  }

  return data as ChatMessage;
}

/**
 * Mark all messages in a session as read
 */
export async function markAllMessagesAsRead(
  sessionId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('session_chat_messages')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('read', false)
    .neq('sender_id', userId);

  if (error) {
    throw new Error(`Failed to mark all messages as read: ${error.message}`);
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('session_chat_messages')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
}

/**
 * Update message metadata (for reactions, etc.)
 */
export async function updateMessageMetadata(
  messageId: string,
  metadata: Record<string, any>
): Promise<ChatMessage> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_chat_messages')
    .update({ metadata })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update metadata: ${error.message}`);
  }

  return data as ChatMessage;
}

/**
 * Search messages in a session
 */
export async function searchMessages(
  sessionId: string,
  searchTerm: string
): Promise<ChatMessage[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .ilike('message', `%${searchTerm}%`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to search messages: ${error.message}`);
  }

  return data as ChatMessage[];
}

/**
 * Subscribe to new messages in real-time
 */
export function subscribeToSessionChat(
  sessionId: string,
  callbacks: {
    onNewMessage?: (message: ChatMessage) => void;
    onMessageUpdate?: (message: ChatMessage) => void;
    onMessageDelete?: (messageId: string) => void;
  }
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channel = supabase.channel(`session-chat-${sessionId}`);

  // Subscribe to new messages
  if (callbacks.onNewMessage) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callbacks.onNewMessage?.(payload.new as ChatMessage);
      }
    );
  }

  // Subscribe to message updates (read status, metadata)
  if (callbacks.onMessageUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'session_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callbacks.onMessageUpdate?.(payload.new as ChatMessage);
      }
    );
  }

  // Subscribe to message deletes
  if (callbacks.onMessageDelete) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'session_chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        const message = payload.new as ChatMessage;
        if (message.deleted_at) {
          callbacks.onMessageDelete?.(message.id);
        }
      }
    );
  }

  channel.subscribe();

  return channel;
}

/**
 * Unsubscribe from chat updates
 */
export async function unsubscribeFromChat(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe();
}

/**
 * Send typing indicator (ephemeral, not stored)
 */
export async function sendTypingIndicator(
  sessionId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const supabase = getSupabaseClient();
  const channel = supabase.channel(`session-chat-${sessionId}`);

  await channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      userId,
      isTyping,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Listen for typing indicators
 */
export function subscribeToTypingIndicators(
  sessionId: string,
  onTyping: (data: { userId: string; isTyping: boolean }) => void
): RealtimeChannel {
  const supabase = getSupabaseClient();
  const channel = supabase.channel(`session-chat-${sessionId}`);

  channel.on('broadcast', { event: 'typing' }, (payload) => {
    onTyping({
      userId: payload.payload.userId,
      isTyping: payload.payload.isTyping,
    });
  });

  channel.subscribe();

  return channel;
}

/**
 * Get message statistics for a session
 */
export async function getMessageStats(sessionId: string): Promise<{
  total: number;
  byType: Record<MessageType, number>;
  bySender: Record<string, number>;
}> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('session_chat_messages')
    .select('message_type, sender_id')
    .eq('session_id', sessionId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to get message stats: ${error.message}`);
  }

  const stats = {
    total: data.length,
    byType: {} as Record<MessageType, number>,
    bySender: {} as Record<string, number>,
  };

  data.forEach((msg) => {
    // Count by type
    stats.byType[msg.message_type as MessageType] =
      (stats.byType[msg.message_type as MessageType] || 0) + 1;

    // Count by sender
    stats.bySender[msg.sender_id] = (stats.bySender[msg.sender_id] || 0) + 1;
  });

  return stats;
}

/**
 * Export chat history
 */
export async function exportChatHistory(sessionId: string): Promise<string> {
  const messages = await getSessionMessages(sessionId);

  const chatHistory = messages.map((msg) => ({
    timestamp: msg.created_at,
    sender: msg.sender_role,
    message: msg.message,
    type: msg.message_type,
  }));

  return JSON.stringify(chatHistory, null, 2);
}
