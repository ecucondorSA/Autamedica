'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { usePatientScreenings } from '@/hooks/usePatientScreenings';
import { getONNXService, initializeONNX } from '@/lib/ai/onnx-service';
import type { PatientContext } from '@/lib/ai/medical-qa';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  processingTime?: number;
  confidence?: number;
}

export function AutaChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy **Auta**, tu asistente de salud inteligente potenciada por IA. Tengo acceso completo a tu historial médico, medicamentos, citas y screenings preventivos. ¿En qué puedo ayudarte hoy? 🏥',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener datos del paciente
  const { screenings, stats, achievements } = usePatientScreenings(52, 'male');

  // Inicializar ONNX service
  useEffect(() => {
    const init = async () => {
      try {
        await initializeONNX();
        setAiReady(true);
        // console.log('✅ Auta AI initialized with ONNX');
      } catch (error) {
        console.error('⚠️ Failed to initialize ONNX, using fallback mode:', error);
        setAiReady(true); // Continuar con modo fallback
      }
    };
    init();
  }, []);

  // Construir contexto del paciente desde datos reales
  const buildPatientContext = (): PatientContext => {
    return {
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: '1 vez al día',
          nextDose: '8:00 AM'
        },
        {
          name: 'Metformina',
          dosage: '500mg',
          frequency: '2 veces al día',
          nextDose: '2:00 PM'
        },
      ],
      vitals: {
        bloodPressure: { systolic: 120, diastolic: 80, date: 'Hace 2 horas' },
        heartRate: { bpm: 72, date: 'Hace 2 horas' }
      },
      appointments: [
        { date: '15 de octubre', doctor: 'Dr. García', specialty: 'Cardiología', status: 'scheduled' },
        { date: '20 de octubre', doctor: 'Dr. Rodríguez', specialty: 'Urología', status: 'scheduled' },
      ],
      screenings: screenings.map(s => ({
        name: s.title,
        status: s.status === 'overdue' ? 'due' : s.status === 'due_soon' ? 'upcoming' : 'completed',
        lastCompleted: s.last_done_date,
        nextDue: s.next_due_date
      })),
      allergies: ['Penicilina'],
      progress: {
        level: Math.floor(achievements.filter(a => a.earned).length / 2) + 1,
        streak: 15,
        completedScreenings: stats.upToDate,
        totalScreenings: stats.total
      }
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Procesar query con ONNX AI Service
  const handleSend = async () => {
    if (!input.trim() || !aiReady) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      // Obtener servicio ONNX y procesar query
      const onnxService = getONNXService();
      const patientContext = buildPatientContext();

      const { response, classification, processingTime } = await onnxService.processQuery(
        query,
        patientContext
      );

      // Crear mensaje de respuesta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        processingTime,
        confidence: classification.confidence
      };

      // Simular typing natural delay
      const typingDelay = Math.min(Math.max(response.text.length * 5, 500), 1500);
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        // Log para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          // console.log('🤖 Auta AI Response:', {
            intent: classification.intent,
            confidence: classification.confidence,
            processingTime: `${processingTime.toFixed(2)}ms`,
            keywords: classification.keywords
          });
        }
      }, typingDelay);

    } catch (error) {
      console.error('Error processing query:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Lo siento, tuve un problema procesando tu pregunta. ¿Podrías reformularla?',
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 500);
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
      {/* AI Status Header */}
      <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className={`h-4 w-4 ${aiReady ? 'text-green-600' : 'text-stone-400'}`} />
          <span className="text-xs font-medium text-stone-700">
            {aiReady ? 'IA Médica Activa' : 'Inicializando IA...'}
          </span>
          {aiReady && (
            <span className="ml-auto text-[10px] text-stone-500">
              Desarrollada por E.M Medicina UBA
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
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

              {/* Message bubble */}
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
                <p className={`mt-1 text-[10px] ${message.role === 'user' ? 'text-white/60' : 'text-stone-500'}`}>
                  {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
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
            className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-500 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white transition hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-stone-500">
          🤖 Auta AI utiliza IA médica avanzada - Desarrollada por E.M Medicina UBA
        </p>
      </div>
    </div>
  );
}
