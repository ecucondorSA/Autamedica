/**
 * Reconnection Indicator Component
 * Visual feedback for connection status and reconnection attempts
 *
 * @module ReconnectionIndicator
 */

'use client';

import type { ConnectionState } from '../hooks/useReconnection';

export interface ReconnectionIndicatorProps {
  /** Current connection state */
  state: ConnectionState;
  /** Number of reconnection attempts */
  attempts: number;
  /** Seconds until next retry */
  nextRetryIn?: number;
  /** Manually trigger reconnection */
  onRetry?: () => void;
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Custom className */
  className?: string;
}

/**
 * Reconnection Indicator Component
 */
export function ReconnectionIndicator({
  state,
  attempts,
  nextRetryIn = 0,
  onRetry,
  position = 'top',
  className = '',
}: ReconnectionIndicatorProps) {
  // Don't show anything when connected
  if (state === 'connected') {
    return null;
  }

  const config = {
    disconnected: {
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      icon: '⚠️',
      title: 'Conexión Perdida',
      message: 'Intentando reconectar...',
    },
    reconnecting: {
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: '🔄',
      title: 'Reconectando',
      message: nextRetryIn > 0
        ? `Intento ${attempts} - Próximo reintento en ${nextRetryIn}s`
        : `Intento ${attempts} - Reconectando...`,
    },
    failed: {
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      icon: '❌',
      title: 'Conexión Fallida',
      message: `No se pudo reconectar después de ${attempts} intentos`,
    },
  };

  const currentConfig = config[state];
  const positionClasses = position === 'top'
    ? 'top-0 rounded-b-lg'
    : 'bottom-0 rounded-t-lg';

  return (
    <div
      className={`fixed left-1/2 z-50 -translate-x-1/2 transform shadow-lg ${positionClasses} ${className}`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-3 ${currentConfig.bgColor} ${currentConfig.textColor}`}
      >
        {/* Icon with animation */}
        <div className="flex-shrink-0">
          <span
            className={`text-2xl ${state === 'reconnecting' ? 'animate-spin' : ''}`}
          >
            {currentConfig.icon}
          </span>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="font-semibold text-sm">{currentConfig.title}</p>
          <p className="text-xs opacity-90">{currentConfig.message}</p>
        </div>

        {/* Retry button for failed state */}
        {state === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 rounded bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Reintentar
          </button>
        )}

        {/* Loading spinner for reconnecting */}
        {state === 'reconnecting' && (
          <div className="flex-shrink-0">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Progress bar for reconnecting */}
      {state === 'reconnecting' && nextRetryIn > 0 && (
        <div className="h-1 w-full overflow-hidden bg-blue-700">
          <div
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{
              width: `${Math.max(0, 100 - (nextRetryIn / 30) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export interface ReconnectionBadgeProps {
  state: ConnectionState;
  attempts?: number;
  className?: string;
}

export function ReconnectionBadge({
  state,
  attempts = 0,
  className = '',
}: ReconnectionBadgeProps) {
  if (state === 'connected') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 ${className}`}
      >
        <span className="h-2 w-2 rounded-full bg-green-600"></span>
        Conectado
      </div>
    );
  }

  if (state === 'disconnected' || state === 'reconnecting') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 ${className}`}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-600"></span>
        Reconectando{attempts > 0 ? ` (${attempts})` : ''}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-red-600"></span>
      Desconectado
    </div>
  );
}

/**
 * Detailed status panel
 */
export interface ReconnectionStatusProps {
  state: ConnectionState;
  attempts: number;
  nextRetryIn?: number;
  onRetry?: () => void;
  className?: string;
}

export function ReconnectionStatus({
  state,
  attempts,
  nextRetryIn = 0,
  onRetry,
  className = '',
}: ReconnectionStatusProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Estado de Conexión
        </h3>
        <ReconnectionBadge state={state} attempts={attempts} />
      </div>

      {/* Connected */}
      {state === 'connected' && (
        <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Conexión estable
          </p>
        </div>
      )}

      {/* Reconnecting */}
      {(state === 'reconnecting' || state === 'disconnected') && (
        <div className="space-y-2">
          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Reconectando...
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Intento {attempts} {nextRetryIn > 0 && `- ${nextRetryIn}s hasta el próximo`}
            </p>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium">Consejos:</p>
            <ul className="ml-4 mt-1 list-disc space-y-0.5">
              <li>Verifica tu conexión a internet</li>
              <li>La reconexión es automática</li>
              <li>Tu sesión se mantiene activa</li>
            </ul>
          </div>
        </div>
      )}

      {/* Failed */}
      {state === 'failed' && (
        <div className="space-y-3">
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Conexión fallida
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              No se pudo reconectar después de {attempts} intentos
            </p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Intentar Nuevamente
            </button>
          )}

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium">Posibles soluciones:</p>
            <ul className="ml-4 mt-1 list-disc space-y-0.5">
              <li>Verifica tu conexión a internet</li>
              <li>Recarga la página</li>
              <li>Limpia caché del navegador</li>
              <li>Contacta soporte si persiste</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
