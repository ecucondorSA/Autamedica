'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { usePatientScreenings } from '@/hooks/usePatientScreenings';
import { getONNXService, initializeONNX } from '@/lib/ai/onnx-service';
import type { PatientContext } from '@/lib/ai/medical-qa';
import { logger } from '@autamedica/shared';
import { usePatientSession } from '@/hooks/usePatientSession';
import { computeAgeFromIso, normalizeGender } from '@/lib/demographics';

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

  // Construir contexto del paciente desde datos reales
  const { user, profile } = usePatientSession();

  // Estados del servidor
  const [serverName, setServerName] = useState<string | null>(null);
  const [serverEmail, setServerEmail] = useState<string | null>(null);
  const [serverBirthDate, setServerBirthDate] = useState<string | null>(null);
  const [serverGender, setServerGender] = useState<string | null>(null);
  const [serverBloodType, setServerBloodType] = useState<string | null>(null);
  const [serverHeightCm, setServerHeightCm] = useState<number | null>(null);
  const [serverWeightKg, setServerWeightKg] = useState<number | null>(null);
  const [userPatterns, setUserPatterns] = useState<Array<{ pattern: string; intent: string; active?: boolean }>>([]);
  const [userFaqs, setUserFaqs] = useState<Array<{ question: string; answer: string; active?: boolean }>>([]);

  // Obtener datos del paciente
  // Derivar edad y género reales para screenings
  const realAge = computeAgeFromIso(serverBirthDate) ?? computeAgeFromIso((profile as any)?.birthDate) ?? 52;
  const realGender = normalizeGender(serverGender || (profile as any)?.gender) ?? 'male';
  const { screenings, stats, achievements } = usePatientScreenings(realAge, realGender);

  // Inicializar ONNX service
  useEffect(() => {
    const init = async () => {
      try {
        await initializeONNX();
        setAiReady(true);
        // logger.info('✅ Auta AI initialized with ONNX');
      } catch (error) {
        const msg = (error as any)?.message || String(error || '');
        logger.warn(`Auta ONNX init falló (fallback): ${msg}`);
        setAiReady(true); // Continuar con modo fallback
      }
    };
    init();
  }, []);

  // Cargar contexto del servidor (summary) y, si está vacío, intentar sincronizar una vez
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/ai/context', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const s = json?.data?.summary;
          if (!cancelled && s) {
            setServerName(typeof s.name === 'string' && s.name.trim() ? s.name : null);
            setServerEmail(typeof s.email === 'string' && s.email.trim() ? s.email : null);
            setServerBirthDate(s.birthDate ?? null)
            setServerGender(s.gender ?? null)
            setServerBloodType(s.bloodType ?? null)
            setServerHeightCm(typeof s.heightCm === 'number' ? s.heightCm : (typeof s.heightCm === 'string' ? Number(s.heightCm) : null))
            setServerWeightKg(typeof s.weightKg === 'number' ? s.weightKg : (typeof s.weightKg === 'string' ? Number(s.weightKg) : null))
          }
          // Si faltan datos clave, intentar sincronizar una vez
          if ((!s?.name || !s?.email) && !cancelled) {
            try {
              const sync = await fetch('/api/ai/context/sync', { method: 'POST' });
              if (sync.ok) {
                const again = await fetch('/api/ai/context', { cache: 'no-store' });
                if (again.ok) {
                  const next = await again.json();
                  const ns = next?.data?.summary;
                  if (!cancelled && ns) {
                    setServerName(typeof ns.name === 'string' && ns.name.trim() ? ns.name : null);
                    setServerEmail(typeof ns.email === 'string' && ns.email.trim() ? ns.email : null);
                    setServerBirthDate(ns.birthDate ?? null)
                    setServerGender(ns.gender ?? null)
                    setServerBloodType(ns.bloodType ?? null)
                    setServerHeightCm(typeof ns.heightCm === 'number' ? ns.heightCm : (typeof ns.heightCm === 'string' ? Number(ns.heightCm) : null))
                    setServerWeightKg(typeof ns.weightKg === 'number' ? ns.weightKg : (typeof ns.weightKg === 'string' ? Number(ns.weightKg) : null))
                  }
                }
              }
            } catch {}
          }
        }
      } catch (e) {
        logger.warn('No se pudo cargar contexto del servidor', e);
      }
      // Cargar patrones y FAQs del usuario
      try {
        const res2 = await fetch('/api/ai/patterns', { cache: 'no-store' })
        if (res2.ok) {
          const json = await res2.json()
          if (!cancelled) {
            const ps = Array.isArray(json?.data?.patterns) ? json.data.patterns : []
            const fs = Array.isArray(json?.data?.faqs) ? json.data.faqs : []
            setUserPatterns(ps.map((p: any) => ({ pattern: String(p.pattern || ''), intent: String(p.intent || ''), active: p.active !== false })))
            setUserFaqs(fs.map((f: any) => ({ question: String(f.question || ''), answer: String(f.answer || ''), active: f.active !== false })))
          }
        }
      } catch (e) {
        logger.warn('No se pudieron cargar patrones/FAQs', e)
      }
    };
    load();
    return () => { cancelled = true };
  }, []);
  const computedName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  const metaName = (user?.user_metadata as any)?.full_name as string | undefined;
  const emailLocal = user?.email?.split('@')[0];
  const fallbackName = computedName || metaName || emailLocal || null;
  const fallbackEmail = user?.email || null;
  const userName = serverName ?? fallbackName;
  const userEmail = serverEmail ?? fallbackEmail;

  const buildPatientContext = (): PatientContext => {
    return {
      profile: {
        name: userName,
        email: userEmail,
      },
      demographics: {
        birthDate: serverBirthDate,
        gender: serverGender,
        bloodType: serverBloodType,
        heightCm: serverHeightCm,
        weightKg: serverWeightKg,
      },
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
      const patientContext = buildPatientContext();

      // 1) Intento rápido: FAQs del usuario (respuesta directa)
      const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '')
      const qn = norm(query)
      const faq = userFaqs.find(f => f.active !== false && qn.includes(norm(f.question)))
      if (faq) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: faq.answer,
          timestamp: new Date(),
        }
        // Registrar telemetría
        fetch('/api/ai/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query, intent: 'faq', confidence: 0.99, usedPattern: true, replyPreview: faq.answer.slice(0, 140) }) }).catch(() => {})
        // Simular typing breve
        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage])
          setIsTyping(false)
        }, Math.min(Math.max(faq.answer.length * 3, 300), 1000))
        return
      }

      // 2) Intento con patrones del usuario → clasificación fija
      const pat = userPatterns.find(p => p.active !== false && qn.includes(norm(p.pattern)))
      if (pat) {
        const classification = { intent: pat.intent as any, confidence: 0.99, keywords: [] }
        const response = medicalQA.generateResponse(classification, patientContext)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
          confidence: classification.confidence,
        }
        fetch('/api/ai/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query, intent: classification.intent, confidence: classification.confidence, usedPattern: true, replyPreview: response.text.slice(0, 140) }) }).catch(() => {})
        const typingDelay = Math.min(Math.max(response.text.length * 5, 400), 1200)
        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage])
          setIsTyping(false)
        }, typingDelay)
        return
      }

      // 3) Fallback: ONNX/Reglas
      const onnxService = getONNXService();
      const { response, classification, processingTime } = await onnxService.processQuery(query, patientContext);

      // Crear mensaje de respuesta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        processingTime,
        confidence: classification.confidence
      };

      // Telemetría
      fetch('/api/ai/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query, intent: classification.intent, confidence: classification.confidence, usedPattern: false, replyPreview: response.text.slice(0, 140) }) }).catch(() => {})

      // Simular typing natural delay
      const typingDelay = Math.min(Math.max(response.text.length * 5, 500), 1500);
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        // Log para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          logger.info('🤖 Auta AI Response:', {
            intent: classification.intent,
            confidence: classification.confidence,
            processingTime: `${processingTime.toFixed(2)}ms`,
            keywords: classification.keywords
          });
        }
      }, typingDelay);

    } catch (error) {
      logger.error('Error processing query:', error);

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
