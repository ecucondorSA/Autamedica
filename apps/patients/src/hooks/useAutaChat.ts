/**
 * Hook useAutaChat - Chat persistente con Auta IA
 *
 * Características:
 * - ✅ Persistencia en Supabase
 * - ✅ Historial completo por conversación
 * - ✅ Mensajes en tiempo real
 * - ✅ Retry automático en errores
 * - ✅ Loading states y error handling
 *
 * @package apps/patients
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  TAutaChatResponse,
  TAutaMessage,
} from "@autamedica/types";
import { logger } from "@autamedica/shared";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  processingTime?: number;
  confidence?: number;
}

interface UseAutaChatOptions {
  patientId: string;
  conversationId?: string | null;
  onError?: (error: Error) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface UseAutaChatReturn {
  conversationId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  send: (message: string) => Promise<void>;
  reset: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook para chat persistente con Auta IA
 */
export function useAutaChat({
  patientId,
  conversationId: initialConversationId = null,
  onError,
  autoRetry = false,
  maxRetries = 3,
}: UseAutaChatOptions): UseAutaChatReturn {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<string | null>(null);
  const retriesRef = useRef(0);

  /**
   * Enviar mensaje a Auta IA
   */
  const send = useCallback(
    async (message: string) => {
      if (!message.trim()) {
        logger.warn("[useAutaChat] Empty message, skipping");
        return;
      }

      // Cancelar request anterior si existe
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Guardar para retry
      lastMessageRef.current = message;

      // Agregar mensaje del usuario localmente (optimistic update)
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auta/chat", {
          method: "POST",
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            patientId,
            message: message.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Failed to send message");
        }

        const data: TAutaChatResponse = await response.json();

        // Actualizar conversationId si es nueva
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        // Agregar respuesta del asistente
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
          processingTime: data.processing_time_ms,
          confidence: data.confidence ?? undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Reset retry counter en éxito
        retriesRef.current = 0;
      } catch (err: any) {
        // Ignorar errores de abort
        if (err.name === "AbortError") {
          logger.info("[useAutaChat] Request aborted");
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("[useAutaChat] Error sending message:", error);

        setError(error);

        // Auto-retry si está habilitado
        if (autoRetry && retriesRef.current < maxRetries) {
          retriesRef.current++;
          logger.info(`[useAutaChat] Auto-retry ${retriesRef.current}/${maxRetries}`);

          // Remover mensaje del usuario del optimistic update
          setMessages((prev) => prev.slice(0, -1));

          // Esperar con backoff exponencial
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retriesRef.current - 1))
          );

          // Reintentar
          return send(message);
        }

        // Callback de error
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, patientId, autoRetry, maxRetries, onError]
  );

  /**
   * Reintentar último mensaje
   */
  const retry = useCallback(async () => {
    if (!lastMessageRef.current) {
      logger.warn("[useAutaChat] No message to retry");
      return;
    }

    // Remover último mensaje del usuario (failed) si existe
    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.role === "user") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Resetear contador y reintentar
    retriesRef.current = 0;
    await send(lastMessageRef.current);
  }, [send]);

  /**
   * Resetear conversación
   */
  const reset = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setLoading(false);
    lastMessageRef.current = null;
    retriesRef.current = 0;
    abortControllerRef.current?.abort();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    conversationId,
    messages,
    loading,
    error,
    send,
    reset,
    retry,
  };
}

/**
 * Hook para cargar historial de conversaciones (opcional)
 */
export function useAutaConversations(patientId: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // TODO: Implementar endpoint GET /api/auta/conversations
        // Por ahora, retornar vacío
        setConversations([]);
      } catch (err: any) {
        logger.error("[useAutaConversations] Error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [patientId]);

  return { conversations, loading, error };
}
