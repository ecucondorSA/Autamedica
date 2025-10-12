'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, User } from 'lucide-react'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'doctor' | 'patient'
  message: string
  timestamp: Date
  isLocal?: boolean
}

export interface ChatPanelProps {
  messages: ChatMessage[]
  localUserId: string
  localUserName: string
  onSendMessage: (message: string) => void | Promise<void>
  onClose: () => void
  isOpen: boolean
  className?: string
}

/**
 * ChatPanel - Panel lateral de chat para videoconsulta
 *
 * Features:
 * - Mensajes en tiempo real con timestamps
 * - Scroll automático a nuevos mensajes
 * - Indicador de mensajes propios vs remotos
 * - Badge de rol (Doctor/Paciente)
 * - Auto-focus en input al abrir
 * - Loading state al enviar mensaje
 *
 * @example
 * <ChatPanel
 *   messages={chatMessages}
 *   localUserId={currentUser.id}
 *   localUserName={currentUser.name}
 *   onSendMessage={handleSendMessage}
 *   onClose={() => setChatOpen(false)}
 *   isOpen={isChatOpen}
 * />
 */
export function ChatPanel({
  messages,
  localUserId,
  localUserName,
  onSendMessage,
  onClose,
  isOpen,
  className = '',
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll a nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus al abrir
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(trimmed)
      setInput('')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (!isOpen) return null

  return (
    <div className={`flex flex-col h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold">Chat</span>
          <span className="text-gray-400 text-sm">({messages.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Cerrar chat"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <User className="w-12 h-12 opacity-50" />
            <p className="text-sm">No hay mensajes aún</p>
            <p className="text-xs text-gray-600">Envía el primer mensaje</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isLocal = msg.senderId === localUserId || msg.isLocal
            return (
              <div
                key={msg.id}
                className={`flex ${isLocal ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isLocal ? 'order-2' : 'order-1'}`}>
                  {/* Sender Info */}
                  <div className={`flex items-center gap-2 mb-1 ${isLocal ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                    <span className="text-xs font-medium text-gray-300">{msg.senderName}</span>
                    {msg.senderRole === 'doctor' && (
                      <span className="text-xs text-emerald-400 font-semibold px-1.5 py-0.5 bg-emerald-500/20 rounded">
                        Doctor
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isLocal
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-100 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={isSending}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          aria-label="Enviar mensaje"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  )
}
