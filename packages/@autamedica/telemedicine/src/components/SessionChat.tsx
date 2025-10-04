/**
 * SessionChat Component
 * Componente de chat en tiempo real para sesiones de videoconsulta
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSessionChat } from '../../hooks/useSessionChat';
import type { SenderRole } from '../../lib/sessionChat';

export interface SessionChatProps {
  sessionId: string;
  userId: string;
  userRole: SenderRole;
  className?: string;
}

export function SessionChat({ sessionId, userId, userRole, className = '' }: SessionChatProps) {
  const {
    messages,
    unreadCount,
    isTyping,
    loading,
    error,
    sendMessage,
    deleteMessage,
    markAsRead,
    setTyping,
  } = useSessionChat({
    sessionId,
    userId,
    userRole,
    autoMarkAsRead: true,
    enableTypingIndicators: true,
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(inputMessage.trim());
      setInputMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if someone is typing (excluding self)
  const someoneIsTyping = Object.entries(isTyping).some(
    ([typingUserId, typing]) => typing && typingUserId !== userId
  );

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Chat de Consulta
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay mensajes aún. Envía el primero!
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.sender_id === userId;
          const isSystem = message.message_type === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {message.message}
                </span>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender role badge */}
                {!isOwn && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    {message.sender_role === 'doctor' ? 'Dr.' : 'Paciente'}
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {/* File attachment */}
                  {message.file_url && (
                    <div className="mb-2">
                      {message.message_type === 'image' ? (
                        <img
                          src={message.file_url}
                          alt={message.file_name || 'Imagen'}
                          className="max-w-full rounded"
                        />
                      ) : (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm underline"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{message.file_name}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message text */}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

                  {/* Timestamp and read status */}
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span
                      className={`text-xs ${
                        isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && (
                      <span className="text-xs text-blue-100">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button for own messages */}
                {isOwn && (
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="text-xs text-gray-500 hover:text-red-500 mt-1"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {someoneIsTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
