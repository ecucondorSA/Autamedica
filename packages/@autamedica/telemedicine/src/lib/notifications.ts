/**
 * Notification Service
 * Push notifications for telemedicine events
 *
 * @module notifications
 */

import { getSupabaseClient } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Notification types
 */
export type NotificationType =
  | 'incoming_call'
  | 'call_missed'
  | 'call_ended'
  | 'session_starting'
  | 'message_received'
  | 'recording_started';

/**
 * Notification status
 */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Call notification
 */
export interface CallNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  session_id?: string;
  title: string;
  body: string;
  action_url?: string;
  metadata: Record<string, any>;
  status: NotificationStatus;
  push_subscription?: PushSubscriptionJSON;
  priority: NotificationPriority;
  expires_at?: string;
  created_at: string;
}

/**
 * Send notification
 */
export async function sendNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sessionId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  expiresIn?: number; // minutes
}): Promise<CallNotification> {
  const supabase = getSupabaseClient();

  const expiresAt = params.expiresIn
    ? new Date(Date.now() + params.expiresIn * 60 * 1000).toISOString()
    : undefined;

  const { data, error } = await supabase
    .from('call_notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      session_id: params.sessionId,
      title: params.title,
      body: params.body,
      action_url: params.actionUrl,
      metadata: params.metadata || {},
      priority: params.priority || 'normal',
      expires_at: expiresAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }

  return data as CallNotification;
}

/**
 * Send incoming call notification
 */
export async function sendIncomingCallNotification(params: {
  userId: string;
  sessionId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor';
}): Promise<CallNotification> {
  return sendNotification({
    userId: params.userId,
    type: 'incoming_call',
    sessionId: params.sessionId,
    title: '📞 Llamada Entrante',
    body: `${params.callerName} (${params.callerRole === 'doctor' ? 'Médico' : 'Paciente'}) te está llamando`,
    actionUrl: `/telemedicine/session/${params.sessionId}`,
    metadata: {
      caller_name: params.callerName,
      caller_role: params.callerRole,
    },
    priority: 'urgent',
    expiresIn: 2, // 2 minutes for incoming calls
  });
}

/**
 * Send call missed notification
 */
export async function sendCallMissedNotification(params: {
  userId: string;
  sessionId: string;
  callerName: string;
}): Promise<CallNotification> {
  return sendNotification({
    userId: params.userId,
    type: 'call_missed',
    sessionId: params.sessionId,
    title: '📵 Llamada Perdida',
    body: `Perdiste una llamada de ${params.callerName}`,
    actionUrl: `/telemedicine/history`,
    metadata: {
      caller_name: params.callerName,
    },
    priority: 'normal',
  });
}

/**
 * Send session starting notification
 */
export async function sendSessionStartingNotification(params: {
  userId: string;
  sessionId: string;
  minutesUntilStart: number;
}): Promise<CallNotification> {
  return sendNotification({
    userId: params.userId,
    type: 'session_starting',
    sessionId: params.sessionId,
    title: '⏰ Consulta Próxima',
    body: `Tu consulta médica comienza en ${params.minutesUntilStart} minutos`,
    actionUrl: `/telemedicine/session/${params.sessionId}`,
    metadata: {
      minutes_until_start: params.minutesUntilStart,
    },
    priority: 'high',
  });
}

/**
 * Send message received notification
 */
export async function sendMessageReceivedNotification(params: {
  userId: string;
  sessionId: string;
  senderName: string;
  messagePreview: string;
}): Promise<CallNotification> {
  return sendNotification({
    userId: params.userId,
    type: 'message_received',
    sessionId: params.sessionId,
    title: `💬 Mensaje de ${params.senderName}`,
    body: params.messagePreview.substring(0, 100),
    actionUrl: `/telemedicine/session/${params.sessionId}`,
    metadata: {
      sender_name: params.senderName,
    },
    priority: 'normal',
  });
}

/**
 * Send recording started notification
 */
export async function sendRecordingStartedNotification(params: {
  userId: string;
  sessionId: string;
}): Promise<CallNotification> {
  return sendNotification({
    userId: params.userId,
    type: 'recording_started',
    sessionId: params.sessionId,
    title: '🔴 Grabación Iniciada',
    body: 'La consulta está siendo grabada',
    metadata: {},
    priority: 'normal',
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('call_notifications')
    .update({ status: 'read' })
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('call_notifications')
    .update({ status: 'read' })
    .eq('user_id', userId)
    .neq('status', 'read');

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(userId: string): Promise<CallNotification[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('call_notifications')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'read')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get unread notifications: ${error.message}`);
  }

  return data as CallNotification[];
}

/**
 * Get all notifications for user
 */
export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<CallNotification[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('call_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get notifications: ${error.message}`);
  }

  return data as CallNotification[];
}

/**
 * Get unread count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from('call_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'read');

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('call_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
}

/**
 * Delete expired notifications for user
 */
export async function deleteExpiredNotifications(userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('call_notifications')
    .delete()
    .eq('user_id', userId)
    .lt('expires_at', new Date().toISOString());

  if (error) {
    throw new Error(`Failed to delete expired notifications: ${error.message}`);
  }
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: CallNotification) => void
): RealtimeChannel {
  const supabase = getSupabaseClient();

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as CallNotification);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from notifications
 */
export async function unsubscribeFromNotifications(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe();
}

/**
 * Save push subscription (Web Push API)
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<void> {
  const supabase = getSupabaseClient();

  // Store subscription in user metadata or separate table
  // For now, we'll update the latest notification or create a preference record
  const { error } = await supabase.from('user_preferences').upsert({
    user_id: userId,
    push_subscription: subscription,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn('Failed to save push subscription:', error.message);
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show browser notification
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  return new Notification(title, {
    icon: '/icons/logo-192.png',
    badge: '/icons/badge-72.png',
    ...options,
  });
}
