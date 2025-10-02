import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  MedicalMessage,
  MedicalChatInsert,
  MedicalMessageInsert,
  MedicalChatWithLastMessage,
  ChatStatusType
} from '@autamedica/types';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseMedicalChatsOptions {
  patientId?: string;
  activeOnly?: boolean;
}

interface UseMedicalChatsResult {
  chats: MedicalChatWithLastMessage[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createChat: (data: MedicalChatInsert) => Promise<{ success: boolean; chatId?: string; error?: any }>;
  updateChatStatus: (chatId: string, status: ChatStatusType) => Promise<{ success: boolean; error?: any }>;
}

export function useMedicalChats(
  options: UseMedicalChatsOptions = {}
): UseMedicalChatsResult {
  const [chats, setChats] = useState<MedicalChatWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build query
      let query = supabase
        .from('medical_chats')
        .select(`
          *,
          specialist:reproductive_health_specialists!inner (
            doctor:doctors!inner (
              first_name,
              last_name
            )
          ),
          messages:medical_messages (
            content,
            author_type,
            created_at,
            is_read
          )
        `);

      // Apply filters
      if (options.patientId) {
        query = query.eq('patient_id', options.patientId);
      }

      if (options.activeOnly) {
        query = query.in('status', ['active', 'waiting_response']);
      }

      // Order by last message
      query = query.order('last_message_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data
      const transformedData: MedicalChatWithLastMessage[] = (data || []).map((item: any) => {
        const messages = item.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const unreadCount = messages.filter((m: any) => !m.is_read && m.author_type !== 'patient').length;

        return {
          id: item.id,
          patient_id: item.patient_id,
          specialist_id: item.specialist_id,
          appointment_id: item.appointment_id,
          status: item.status,
          subject: item.subject,
          is_urgent: item.is_urgent,
          last_message_at: item.last_message_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          last_message_content: lastMessage?.content || '',
          last_message_author: lastMessage?.author_type || 'system',
          unread_count: unreadCount,
          specialist_name: `Dr. ${item.specialist?.doctor?.first_name || ''} ${item.specialist?.doctor?.last_name || ''}`.trim()
        };
      });

      setChats(transformedData);
    } catch (err) {
      console.error('Error fetching medical chats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [options.patientId, options.activeOnly]);

  const createChat = useCallback(async (data: MedicalChatInsert) => {
    try {
      const supabase = createClient();

      const insertData = {
        patient_id: data.patient_id,
        specialist_id: data.specialist_id,
        subject: data.subject,
        is_urgent: data.is_urgent || false,
        status: 'active' as ChatStatusType,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: result, error: insertError } = await supabase
        .from('medical_chats')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Refetch to update list
      await fetchChats();

      return {
        success: true,
        chatId: result?.id
      };
    } catch (err) {
      console.error('Error creating chat:', err);
      return {
        success: false,
        error: err
      };
    }
  }, [fetchChats]);

  const updateChatStatus = useCallback(async (
    chatId: string,
    status: ChatStatusType
  ) => {
    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('medical_chats')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (updateError) throw updateError;

      // Refetch to update list
      await fetchChats();

      return { success: true };
    } catch (err) {
      console.error('Error updating chat status:', err);
      return {
        success: false,
        error: err
      };
    }
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
    createChat,
    updateChatStatus
  };
}

// Hook para mensajes de un chat específico con Realtime
interface UseChatMessagesResult {
  messages: MedicalMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, contentType?: 'text' | 'image' | 'document') => Promise<{ success: boolean; error?: any }>;
  markAsRead: (messageId: string) => Promise<void>;
}

export function useChatMessages(
  chatId: string | null,
  userId: string | null
): UseChatMessagesResult {
  const [messages, setMessages] = useState<MedicalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('medical_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []) as MedicalMessage[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (
    content: string,
    contentType: 'text' | 'image' | 'document' = 'text'
  ) => {
    if (!chatId || !userId) {
      return {
        success: false,
        error: 'Missing chatId or userId'
      };
    }

    try {
      const supabase = createClient();

      const messageData: MedicalMessageInsert = {
        chat_id: chatId,
        author_type: 'patient',
        author_id: userId,
        content_type: contentType,
        content,
        attachment_url: undefined
      };

      const { error: insertError } = await supabase
        .from('medical_messages')
        .insert({
          ...messageData,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Update chat's last_message_at
      await supabase
        .from('medical_chats')
        .update({
          last_message_at: new Date().toISOString(),
          status: 'waiting_response',
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      return { success: true };
    } catch (err) {
      console.error('Error sending message:', err);
      return {
        success: false,
        error: err
      };
    }
  }, [chatId, userId]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const supabase = createClient();

      await supabase
        .from('medical_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  // Setup Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`medical_chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'medical_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as MedicalMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead
  };
}
