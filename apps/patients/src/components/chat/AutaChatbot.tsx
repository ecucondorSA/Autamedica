'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { usePatientScreenings } from '@/hooks/usePatientScreenings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PatientContext {
  name: string;
  age: number;
  gender: 'male' | 'female';
  medications: Array<{ name: string; dosage: string; time: string; completed: boolean }>;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    lastUpdated: string;
  };
  allergies: string[];
  upcomingAppointments: Array<{ doctor: string; specialty: string; date: string }>;
}

export function AutaChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy **Auta**, tu asistente de salud inteligente. Tengo acceso completo a tu historial médico, medicamentos, citas y screenings preventivos. ¿En qué puedo ayudarte hoy? 🏥',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener datos del paciente
  const { screenings, stats, achievements } = usePatientScreenings(52, 'male');

  // Contexto del paciente (en producción vendría de API)
  const patientContext: PatientContext = {
    name: 'Juan Pérez',
    age: 52,
    gender: 'male',
    medications: [
      { name: 'Lisinopril 10mg', dosage: '10mg', time: '8:00 AM', completed: true },
      { name: 'Metformina 500mg', dosage: '500mg', time: '2:00 PM', completed: false },
      { name: 'Aspirina 100mg', dosage: '100mg', time: '8:00 PM', completed: false },
    ],
    vitals: {
      bloodPressure: '120/80',
      heartRate: '72 lpm',
      lastUpdated: 'Hace 2 horas',
    },
    allergies: ['Penicilina'],
    upcomingAppointments: [
      { doctor: 'Dr. García', specialty: 'Cardiología', date: '2025-10-15' },
      { doctor: 'Dr. Rodríguez', specialty: 'Urología', date: '2025-10-20' },
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Motor de IA de Auta - analiza contexto y genera respuestas inteligentes
  const generateAutaResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Análisis de intenciones
    if (lowerMessage.includes('medicamento') || lowerMessage.includes('pastilla') || lowerMessage.includes('tomar')) {
      const pending = patientContext.medications.filter(m => !m.completed);
      if (pending.length > 0) {
        return `📊 **Estado de tus medicamentos hoy:**

✅ **Tomado**: ${patientContext.medications.filter(m => m.completed).map(m => m.name).join(', ')}

⏰ **Pendientes**:
${pending.map(m => `- ${m.name} a las ${m.time}`).join('\n')}

💡 **Recomendación**: No olvides tomar la Metformina con las comidas para mejor absorción.`;
      }
      return '¡Excelente! Ya completaste todos tus medicamentos del día. 🎉';
    }

    if (lowerMessage.includes('presión') || lowerMessage.includes('tensión') || lowerMessage.includes('pa')) {
      return `💓 **Tu presión arterial actual:**

**${patientContext.vitals.bloodPressure} mmHg** (${patientContext.vitals.lastUpdated})
**Frecuencia cardíaca**: ${patientContext.vitals.heartRate}

✅ **Estado**: Normal - Sigue así! Tu presión está dentro del rango óptimo (<120/80).

📊 **Tendencia**: Has mantenido valores estables los últimos 15 días.

💡 **Consejo**: Continúa con tu rutina actual y registra tu presión cada mañana.`;
    }

    if (lowerMessage.includes('cita') || lowerMessage.includes('consulta') || lowerMessage.includes('doctor')) {
      return `📅 **Tus próximas citas médicas:**

${patientContext.upcomingAppointments.map((apt, i) =>
  `**${i + 1}. ${apt.doctor}** - ${apt.specialty}
  📆 ${new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`).join('\n')}

⏰ **Recordatorio**: Lleva tus últimos análisis a la cita con ${patientContext.upcomingAppointments[0].doctor}.`;
    }

    if (lowerMessage.includes('screening') || lowerMessage.includes('control') || lowerMessage.includes('examen') || lowerMessage.includes('chequeo')) {
      const overdue = screenings.filter(s => s.status === 'overdue');
      const dueSoon = screenings.filter(s => s.status === 'due_soon');

      let response = `🔬 **Estado de tus screenings preventivos:**\n\n`;
      response += `✅ **Al día**: ${stats.upToDate}/${stats.total} controles\n\n`;

      if (overdue.length > 0) {
        response += `⚠️ **URGENTE - Atrasados:**\n`;
        overdue.forEach(s => {
          response += `- **${s.title}**: Vencido el ${new Date(s.next_due_date).toLocaleDateString('es-ES')}\n`;
        });
        response += `\n`;
      }

      if (dueSoon.length > 0) {
        response += `⏰ **Próximos a vencer:**\n`;
        dueSoon.forEach(s => {
          response += `- **${s.title}**: ${new Date(s.next_due_date).toLocaleDateString('es-ES')}\n`;
        });
        response += `\n`;
      }

      response += `💡 **Recomendación**: ${overdue.length > 0
        ? `Agenda urgentemente tu ${overdue[0].title}. Es crucial para hombres mayores de 50 años.`
        : 'Excelente trabajo manteniendo tus controles al día!'
      }`;

      return response;
    }

    if (lowerMessage.includes('psa') || lowerMessage.includes('próstata') || lowerMessage.includes('prostata')) {
      const psaScreening = screenings.find(s => s.id === 'psa');
      if (psaScreening) {
        return `🩺 **Screening PSA (Próstata):**

**Estado**: ${psaScreening.status === 'due_soon' ? '⏰ Próximo a vencer' : psaScreening.status === 'overdue' ? '⚠️ Atrasado' : '✅ Al día'}
**Último control**: ${psaScreening.last_done_date ? new Date(psaScreening.last_done_date).toLocaleDateString('es-ES') : 'No registrado'}
**Próximo control**: ${new Date(psaScreening.next_due_date).toLocaleDateString('es-ES')}

📋 **Preparación**:
- No eyacular 48h antes del examen
- Ayuno de 8 horas
- Informar medicamentos actuales

¿Quieres que te ayude a agendar la cita con el urólogo?`;
      }
    }

    if (lowerMessage.includes('colonoscopia') || lowerMessage.includes('colon') || lowerMessage.includes('colorrectal')) {
      const colonScreening = screenings.find(s => s.id === 'colorectal');
      if (colonScreening) {
        return `🔬 **Screening Colonoscopia (Cáncer Colorrectal):**

**Estado**: ${colonScreening.status === 'overdue' ? '⚠️ URGENTE - Atrasado' : '⏰ Próximo'}
**Último control**: ${colonScreening.last_done_date ? new Date(colonScreening.last_done_date).toLocaleDateString('es-ES') : 'No registrado'}
**Próximo control**: ${new Date(colonScreening.next_due_date).toLocaleDateString('es-ES')}

⚠️ **Importante**: Llevas ${Math.floor((new Date().getTime() - new Date(colonScreening.last_done_date!).getTime()) / (1000 * 60 * 60 * 24 * 365))} años sin este control crítico.

📋 **Preparación (día anterior)**:
- Dieta líquida clara
- Laxante según indicación médica
- Ayuno de 8 horas antes

💡 **Consejo**: A tu edad (${patientContext.age} años), la colonoscopia se recomienda cada 10 años o según hallazgos previos.`;
      }
    }

    if (lowerMessage.includes('logro') || lowerMessage.includes('progreso') || lowerMessage.includes('nivel')) {
      const earnedBadges = achievements.filter(a => a.earned);
      return `🏆 **Tu progreso en salud:**

**Nivel actual**: ${earnedBadges.length >= 3 ? '💎 Oro' : earnedBadges.length >= 2 ? '🥈 Plata' : '🥉 Bronce'}
**Puntos**: ${stats.upToDate * 250 + 15 * 50}/2,000

🏅 **Logros desbloqueados** (${earnedBadges.length}/${achievements.length}):
${earnedBadges.map(a => `${a.emoji} **${a.title}**: ${a.description}`).join('\n')}

📊 **Estadísticas**:
- Racha actual: 15 días
- Adherencia medicamentos: 100%
- Screenings al día: ${stats.upToDate}/${stats.total}

¡Sigue así! 💪`;
    }

    if (lowerMessage.includes('alergia')) {
      return `⚠️ **Tus alergias registradas:**

${patientContext.allergies.map(a => `🔴 **${a}** - Evitar antibióticos beta-lactámicos`).join('\n')}

💡 **Importante**: Siempre informa esta alergia antes de cualquier procedimiento o prescripción.

¿Tienes alguna nueva alergia que deba registrar?`;
    }

    if (lowerMessage.includes('resumen') || lowerMessage.includes('estado') || lowerMessage.includes('salud')) {
      return `📊 **Resumen completo de tu salud:**

**👤 Paciente**: ${patientContext.name}, ${patientContext.age} años

**💊 Medicamentos hoy**:
${patientContext.medications.map(m => `${m.completed ? '✅' : '⏰'} ${m.name} - ${m.time}`).join('\n')}

**💓 Signos vitales**:
- PA: ${patientContext.vitals.bloodPressure} mmHg ✅
- FC: ${patientContext.vitals.heartRate} ✅

**🔬 Screenings**:
- Al día: ${stats.upToDate}/${stats.total}
- Atrasados: ${stats.overdue} ⚠️

**🏆 Logros**: ${achievements.filter(a => a.earned).length} desbloqueados

**📅 Próxima cita**: ${patientContext.upcomingAppointments[0].doctor} (${new Date(patientContext.upcomingAppointments[0].date).toLocaleDateString('es-ES')})

¿Hay algo específico en lo que pueda ayudarte?`;
    }

    // Respuesta por defecto con sugerencias
    return `Puedo ayudarte con:

🩺 **"¿Cómo está mi presión?"** - Estado de signos vitales
💊 **"¿Qué medicamentos debo tomar?"** - Recordatorios
📅 **"¿Cuándo es mi próxima cita?"** - Agenda médica
🔬 **"Estado de mis screenings"** - Controles preventivos
🏆 **"¿Cómo va mi progreso?"** - Logros y metas
📊 **"Dame un resumen"** - Estado completo de salud

También puedo responder preguntas específicas sobre PSA, colonoscopia, colesterol, etc.

¿En qué te puedo ayudar? 😊`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simular delay de procesamiento
    setTimeout(() => {
      const response = generateAutaResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
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
          Auta tiene acceso completo a tu historial médico para brindarte asistencia personalizada
        </p>
      </div>
    </div>
  );
}
