/**
 * Notifications Hook
 * React hook for managing telemedicine notifications
 *
 * @module useNotifications
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  getUnreadNotifications,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  requestNotificationPermission,
  showBrowserNotification,
  type CallNotification,
  type NotificationStatus,
} from '../lib/notifications';

export interface UseNotificationsOptions {
  userId: string;
  autoSubscribe?: boolean;
  showBrowserNotifications?: boolean;
  onNotification?: (notification: CallNotification) => void;
}

export interface UseNotificationsReturn {
  notifications: CallNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  permission: NotificationPermission | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotif: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

/**
 * Hook for managing notifications
 */
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const {
    userId,
    autoSubscribe = true,
    showBrowserNotifications = true,
    onNotification,
  } = options;

  const [notifications, setNotifications] = useState<CallNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  /**
   * Load notifications
   */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [notifs, count] = await Promise.all([
        getUserNotifications(userId),
        getUnreadNotificationCount(userId),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markNotificationAsRead(notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as read');
      }
    },
    []
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead(userId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as NotificationStatus }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, [userId]);

  /**
   * Delete notification
   */
  const deleteNotif = useCallback(
    async (notificationId: string) => {
      try {
        await deleteNotification(notificationId);

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Decrease unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && notification.status !== 'read') {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete notification');
      }
    },
    [notifications]
  );

  /**
   * Refresh notifications
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  /**
   * Request browser notification permission
   */
  const requestPermission = useCallback(async () => {
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      return perm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return 'denied' as NotificationPermission;
    }
  }, []);

  /**
   * Handle new notification
   */
  const handleNewNotification = useCallback(
    (notification: CallNotification) => {
      // Add to list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification
      if (showBrowserNotifications && permission === 'granted') {
        const browserNotif = showBrowserNotification(notification.title, {
          body: notification.body,
          tag: notification.id,
          data: {
            url: notification.action_url,
            notificationId: notification.id,
          },
        });

        // Handle click on browser notification
        if (browserNotif) {
          browserNotif.onclick = () => {
            if (notification.action_url) {
              window.location.href = notification.action_url;
            }
            markAsRead(notification.id);
          };
        }
      }

      // Call custom handler
      onNotification?.(notification);
    },
    [permission, showBrowserNotifications, markAsRead, onNotification]
  );

  /**
   * Subscribe to real-time notifications
   */
  useEffect(() => {
    if (!autoSubscribe) return;

    const channel = subscribeToNotifications(userId, handleNewNotification);
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribeFromNotifications(channelRef.current);
      }
    };
  }, [userId, autoSubscribe, handleNewNotification]);

  /**
   * Load initial data and check permission
   */
  useEffect(() => {
    loadNotifications();

    // Check browser notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    permission,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    refreshNotifications,
    requestPermission,
  };
}
