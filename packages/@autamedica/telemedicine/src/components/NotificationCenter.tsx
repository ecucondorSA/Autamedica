/**
 * Notification Center Component
 * Display and manage telemedicine notifications
 *
 * @module NotificationCenter
 */

'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { CallNotification } from '../lib/notifications';

export interface NotificationCenterProps {
  userId: string;
  onNotificationClick?: (notification: CallNotification) => void;
  className?: string;
}

/**
 * Notification Center Component
 */
export function NotificationCenter({
  userId,
  onNotificationClick,
  className = '',
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    permission,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    requestPermission,
  } = useNotifications({
    userId,
    autoSubscribe: true,
    showBrowserNotifications: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: CallNotification) => {
    markAsRead(notification.id);

    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.action_url) {
      window.location.href = notification.action_url;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incoming_call':
        return '📞';
      case 'call_missed':
        return '📵';
      case 'call_ended':
        return '☎️';
      case 'session_starting':
        return '⏰';
      case 'message_received':
        return '💬';
      case 'recording_started':
        return '🔴';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'normal':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'low':
        return 'bg-gray-100 border-gray-300 text-gray-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        aria-label="Notificaciones"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 max-w-screen rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Marcar todo como leído
                </button>
              )}
            </div>

            {/* Permission Request */}
            {permission === 'default' && (
              <div className="border-b border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔔</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Habilitar notificaciones
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Recibe alertas de llamadas entrantes
                    </p>
                  </div>
                  <button
                    onClick={requestPermission}
                    className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700"
                  >
                    Habilitar
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="border-b border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              </div>
            )}

            {/* Notifications List */}
            {!loading && (
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="mb-2 block text-4xl">📭</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay notificaciones
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          notification.status !== 'read' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {notification.body}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {notification.status !== 'read' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                title="Marcar como leído"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotif(notification.id);
                              }}
                              className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Eliminar"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
