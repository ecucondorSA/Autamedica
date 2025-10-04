/**
 * useSessionChat Hook
 * Hook de React para gestión de chat en tiempo real durante videoconsultas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  type ChatMessage,
  type SenderRole,
  type MessageType,
  sendChatMessage,
  getSessionMessages,
  getUnreadCount,
  markAllMessagesAsRead,
  deleteMessage,
  subscribeToSessionChat,
  subscribeToTypingIndicators,
  sendTypingIndicator,
  unsubscribeFromChat,
} from '../lib/sessionChat';

export interface UseSessionChatOptions {
  sessionId: string;
  userId: string;
  userRole: SenderRole;
  autoMarkAsRead?: boolean;
  enableTypingIndicators?: boolean;
}

export interface UseSessionChatReturn {
  messages: ChatMessage[];
  unreadCount: number;
  isTyping: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, type?: MessageType, file?: {
    url: string;
    name: string;
    size: number;
    type: string;
  }) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  refreshMessages: () => Promise<void>;
}

export function useSessionChat(options: UseSessionChatOptions): UseSessionChatReturn {
  const {
    sessionId,
    userId,
    userRole,
    autoMarkAsRead = true,
    enableTypingIndicators = true,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chatChannelRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load initial messages
   */
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [messagesData, unreadCountData] = await Promise.all([
        getSessionMessages(sessionId),
        getUnreadCount(sessionId, userId),
      ]);

      setMessages(messagesData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId]);

  /**
   * Send a new message
   */
  const handleSendMessage = useCallback(
    async (
      message: string,
      type: MessageType = 'text',
      file?: {
        url: string;
        name: string;
        size: number;
        type: string;
      }
    ) => {
      try {
        setError(null);

        await sendChatMessage({
          sessionId,
          senderId: userId,
          senderRole: userRole,
          message,
          messageType: type,
          fileUrl: file?.url,
          fileName: file?.name,
          fileSizeBytes: file?.size,
          fileType: file?.type,
        });

        // Stop typing indicator
        if (enableTypingIndicators) {
          await sendTypingIndicator(sessionId, userId, false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;
      }
    },
    [sessionId, userId, userRole, enableTypingIndicators]
  );

  /**
   * Delete a message
   */
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await deleteMessage(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  }, []);

  /**
   * Mark all messages as read
   */
  const markAsRead = useCallback(async () => {
    try {
      setError(null);
      await markAllMessagesAsRead(sessionId, userId);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
      console.error('Error marking messages as read:', err);
    }
  }, [sessionId, userId]);

  /**
   * Set typing indicator
   */
  const setTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!enableTypingIndicators) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing indicator
      sendTypingIndicator(sessionId, userId, isTyping).catch((err) => {
        console.error('Error sending typing indicator:', err);
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(sessionId, userId, false).catch((err) => {
            console.error('Error stopping typing indicator:', err);
          });
        }, 3000);
      }
    },
    [sessionId, userId, enableTypingIndicators]
  );

  /**
   * Setup real-time subscriptions
   */
  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    chatChannelRef.current = subscribeToSessionChat(sessionId, {
      onNewMessage: (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);

        // Auto-mark as read if enabled and not sent by current user
        if (autoMarkAsRead && newMessage.sender_id !== userId) {
          markAsRead();
        } else if (newMessage.sender_id !== userId) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      onMessageUpdate: (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
        );
      },
      onMessageDelete: (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      },
    });

    // Subscribe to typing indicators
    if (enableTypingIndicators) {
      typingChannelRef.current = subscribeToTypingIndicators(
        sessionId,
        ({ userId: typingUserId, isTyping: typing }) => {
          // Don't show own typing indicator
          if (typingUserId === userId) return;

          setIsTyping((prev) => ({
            ...prev,
            [typingUserId]: typing,
          }));

          // Auto-clear typing indicator after 5 seconds
          setTimeout(() => {
            setIsTyping((prev) => ({
              ...prev,
              [typingUserId]: false,
            }));
          }, 5000);
        }
      );
    }

    // Cleanup
    return () => {
      if (chatChannelRef.current) {
        unsubscribeFromChat(chatChannelRef.current);
      }
      if (typingChannelRef.current) {
        unsubscribeFromChat(typingChannelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sessionId, userId, autoMarkAsRead, enableTypingIndicators, loadMessages, markAsRead]);

  return {
    messages,
    unreadCount,
    isTyping,
    loading,
    error,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    markAsRead,
    setTyping: setTypingIndicator,
    refreshMessages: loadMessages,
  };
}
