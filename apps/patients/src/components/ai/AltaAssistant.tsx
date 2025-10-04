'use client'

import { useState } from 'react'
import { Bot, Send, X, Minimize2, Sparkles } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'alta'
  content: string
  timestamp: Date
}

export function AltaAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'alta',
      content: '¡Hola! Soy ALTA, tu asistente de salud. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simular respuesta de ALTA (en producción, esto llamaría a la API de OpenAI)
    setTimeout(() => {
      const altaMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'alta',
        content: getAltaResponse(inputValue),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, altaMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-stone-700 to-stone-800 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-3xl"
        >
          <div className="relative">
            <Bot className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stone-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-stone-600">
                <Sparkles className="h-2 w-2 text-amber-400" />
              </span>
            </span>
          </div>
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-stone-300 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-br from-stone-700 to-stone-800 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">ALTA</p>
                <p className="text-xs text-stone-300">Asistente de Salud IA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition hover:bg-white/10"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-900'
                  }`}
                >
                  {message.sender === 'alta' && (
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-stone-600">
                      <Bot className="h-3 w-3" />
                      ALTA
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`mt-1 text-xs ${message.sender === 'user' ? 'text-stone-300' : 'text-stone-500'}`}>
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-stone-200 p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder-stone-500 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white transition hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-500 text-center">
              <Sparkles className="mr-1 inline-block h-3 w-3" />
              ALTA puede cometer errores. Consulta siempre a tu médico.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// Función helper para simular respuestas de ALTA
function getAltaResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('presión') || lowerMessage.includes('presion')) {
    return 'Para consultar tu presión arterial, ve a la sección de Historia Clínica > Signos Vitales. Allí encontrarás tus últimas mediciones y gráficos de evolución.\n\n¿Te gustaría registrar una nueva medición?'
  }

  if (lowerMessage.includes('medicamento') || lowerMessage.includes('medicina')) {
    return 'Puedes ver todos tus medicamentos activos en Historia Clínica > Medicamentos. Recuerda que es importante tomarlos a la hora indicada para mantener una buena adherencia.\n\n¿Necesitas un recordatorio?'
  }

  if (lowerMessage.includes('cita') || lowerMessage.includes('consulta')) {
    return 'Tu próxima cita es mañana a las 10:00 AM con el Dr. García (Cardiología). ¿Te gustaría ver los detalles o preparar preguntas para la consulta?'
  }

  if (lowerMessage.includes('resultado') || lowerMessage.includes('laboratorio')) {
    return 'Tus últimos resultados de laboratorio muestran:\n\n• Glucosa: 115 mg/dL (ligeramente elevada)\n• Colesterol: 195 mg/dL (normal)\n\nHe notificado a tu médico sobre la glucosa. ¿Quieres ver el informe completo?'
  }

  if (lowerMessage.includes('comunidad') || lowerMessage.includes('grupo')) {
    return 'Estás en 2 grupos: Diabetes Tipo 2 y Hipertensión. Hay 5 publicaciones nuevas que podrían interesarte. ¿Quieres que te las muestre?'
  }

  // Respuesta por defecto
  return 'Puedo ayudarte con:\n\n• Consultar signos vitales\n• Ver medicamentos y recordatorios\n• Información sobre citas\n• Resultados de laboratorio\n• Buscar en la comunidad\n\n¿Qué te gustaría saber?'
}
