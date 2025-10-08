/**
 * AutaChatbot - Chat persistente con Auta IA
 *
 * ✅ VERSIÓN PRODUCTION-READY con persistencia en Supabase
 * ✅ Historial completo por conversación
 * ✅ Retry automático en errores
 * ✅ Loading states y error handling
 *
 * @package apps/patients
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAutaChat } from '@/hooks/useAutaChat';
import { logger } from '@autamedica/shared';

interface AutaChatbotProps {
  patientId: string;
  conversationId?: string | null;
}

export function AutaChatbot({ patientId, conversationId: initialConversationId }: AutaChatbotProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook persistente de chat
  const {
    conversationId,
    messages,
    loading,
    error,
    send,
    retry,
    reset,
  } = useAutaChat({
    patientId,
    conversationId: initialConversationId,
    autoRetry: true,
    maxRetries: 3,
    onError: (err) => {
      logger.error('[AutaChatbot] Chat error:', err);
    },
  });

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida si no hay mensajes
  useEffect(() => {
    if (messages.length === 0 && !loading) {
      // Agregar mensaje de bienvenida solo visual (no se guarda en DB)
      // El primer mensaje real del asistente se guardará al enviar el primer query
    }
  }, [messages.length, loading]);

  // Handler para enviar mensaje
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    try {
      setInput(''); // Limpiar input inmediatamente
      await send(trimmedInput);
    } catch (err) {
      logger.error('[AutaChatbot] Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header con estado de IA */}
      <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-stone-700">
            IA Médica Activa - Conversación persistente
          </span>
          {conversationId && (
            <span className="ml-auto text-[10px] text-stone-500">
              ID: {conversationId.slice(0, 8)}...
            </span>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700">
              Error al enviar mensaje. <button onClick={retry} className="underline">Reintentar</button>
            </span>
          </div>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Mensaje de bienvenida si no hay mensajes */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-600 to-stone-800 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900">
                <div className="whitespace-pre-wrap text-sm">
                  ¡Hola! Soy <strong>Auta</strong>, tu asistente de salud inteligente potenciada por IA.
                  {' '}Tengo acceso completo a tu historial médico, medicamentos, citas y screenings preventivos.
                  {' '}¿En qué puedo ayudarte hoy? 🏥
                </div>
                <p className="mt-1 text-[10px] text-stone-500">
                  {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes de la conversación */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === 'user'
                    ? 'bg-stone-200 text-stone-700'
                    : 'bg-gradient-to-br from-stone-600 to-stone-800 text-white'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-stone-800 text-white'
                    : 'border border-stone-200 bg-white text-stone-900'
                }`}
              >
                <div
                  className="whitespace-pre-wrap text-sm"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
                <div className={`mt-1 flex items-center gap-2 text-[10px] ${
                  message.role === 'user' ? 'text-white/60' : 'text-stone-500'
                }`}>
                  <span>
                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.processingTime && message.role === 'assistant' && (
                    <span>• {message.processingTime}ms</span>
                  )}
                  {message.confidence && message.role === 'assistant' && (
                    <span>• {Math.round(message.confidence * 100)}% confianza</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-600 to-stone-800 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-stone-200 bg-white px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
                <span className="text-sm text-stone-600">Auta está pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 bg-stone-50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregúntale a Auta sobre tu salud..."
            disabled={loading}
            className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-500 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] text-stone-500">
            🤖 Auta AI con persistencia - Desarrollada por E.M Medicina UBA
          </p>
          {conversationId && (
            <button
              onClick={reset}
              className="text-[10px] text-stone-500 underline hover:text-stone-700"
            >
              Nueva conversación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
