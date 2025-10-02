'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Activity,
  Trophy,
  Zap,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  Eye,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'
import { usePatientScreenings } from '@/hooks/usePatientScreenings'

type PanelTab = 'community' | 'progress' | 'actions' | 'medical'

interface DynamicRightPanelProps {
  context?: 'dashboard' | 'video' | 'appointments' | 'history'
}

export function DynamicRightPanel({ context = 'dashboard' }: DynamicRightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('community')

  // Determinar tabs según contexto
  const getTabs = () => {
    switch (context) {
      case 'video':
        return [
          { id: 'chat' as PanelTab, label: 'Chat', icon: MessageSquare },
          { id: 'medical' as PanelTab, label: 'Info Médica', icon: FileText },
        ]
      case 'appointments':
        return [
          { id: 'actions' as PanelTab, label: 'Preguntas', icon: Zap },
          { id: 'medical' as PanelTab, label: 'Preparación', icon: FileText },
        ]
      case 'history':
        return [
          { id: 'medical' as PanelTab, label: 'Gráficos', icon: TrendingUp },
          { id: 'actions' as PanelTab, label: 'Accesos', icon: Eye },
        ]
      default:
        return [
          { id: 'community' as PanelTab, label: 'Comunidad', icon: MessageSquare },
          { id: 'progress' as PanelTab, label: 'Progreso', icon: Trophy },
          { id: 'actions' as PanelTab, label: 'Acciones', icon: Zap },
        ]
    }
  }

  const tabs = getTabs()

  return (
    <aside className="flex w-[30%] min-w-[320px] max-w-[400px] flex-col border-l border-stone-300 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-all
                ${isActive
                  ? 'border-b-2 border-stone-800 bg-stone-50 text-stone-900'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'community' && <CommunityPanel />}
        {activeTab === 'progress' && <ProgressPanel />}
        {activeTab === 'actions' && <QuickActionsPanel />}
        {activeTab === 'medical' && <MedicalInfoPanel />}
        {activeTab === 'chat' && <ChatPanel />}
      </div>
    </aside>
  )
}

function CommunityPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">💬 Tu Comunidad</h3>
        <div className="space-y-3">
          <CommunityPost
            group="Diabetes Tipo 2"
            members={1200}
            author="María, 45 años"
            content="¿Alguien más tiene bajones de azúcar después del ejercicio?"
            replies={23}
            likes={45}
          />
          <CommunityPost
            group="Hipertensión"
            members={850}
            author="Carlos, 52 años"
            content="Mi médico cambió mi dosis de Lisinopril, ¿experiencias?"
            replies={18}
            likes={32}
          />
        </div>
      </div>

      <button className="w-full btn-primary-ivory py-2.5 text-sm">
        + Crear publicación
      </button>
    </div>
  )
}

function ProgressPanel() {
  // Hook con datos de screenings y logros calculados
  const { achievements, weeklyGoals, stats } = usePatientScreenings(52, 'male');

  // Calcular racha basada en adherencia
  const streakDays = 15; // En producción vendría de tracking real
  const streakProgress = (streakDays / 30) * 100;

  // Calcular nivel basado en screenings completados
  const points = stats.upToDate * 250 + streakDays * 50;
  const levelProgress = (points / 2000) * 100;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">🏆 Tu Progreso</h3>

        {/* Streak */}
        <div className="mb-4 rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 p-4 ring-1 ring-stone-300">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{streakDays} días</p>
              <p className="text-xs text-stone-600">Racha actual</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-gradient-to-r from-stone-600 to-stone-800" style={{ width: `${streakProgress}%` }} />
          </div>
          <p className="mt-2 text-xs text-stone-600">{streakDays}/30 días para Nivel Oro</p>
        </div>

        {/* Level */}
        <div className="mb-4 rounded-lg bg-stone-50 border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-stone-900">
              💎 Nivel: {points >= 2000 ? 'Oro' : points >= 1000 ? 'Plata' : 'Bronce'}
            </span>
            <span className="text-xs text-stone-600">{points}/2,000 pts</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-gradient-to-r from-stone-400 to-stone-300" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Weekly goals */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-700">🎯 METAS SEMANALES</p>
          <div className="space-y-2">
            {weeklyGoals.map(goal => (
              <GoalItem key={goal.id} label={goal.label} completed={goal.completed} total={goal.total} />
            ))}
          </div>
        </div>

        {/* Badges - Dinámicos basados en screenings */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-stone-700">🏅 LOGROS VINCULADOS A SCREENINGS</p>
          <div className="grid grid-cols-2 gap-2">
            {achievements.slice(0, 4).map(badge => (
              <div
                key={badge.id}
                className={`rounded-lg p-3 text-center ${
                  badge.earned
                    ? badge.level === 'gold'
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : 'bg-stone-100 border-2 border-stone-400'
                    : 'bg-stone-50 border border-stone-200 opacity-60'
                }`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className={`mt-1 text-[10px] font-medium ${
                  badge.earned
                    ? badge.level === 'gold' ? 'text-yellow-700' : 'text-stone-600'
                    : 'text-stone-400'
                }`}>
                  {badge.title}
                </p>
                <p className="text-[9px] text-stone-500 mt-0.5">
                  {badge.progress}/{badge.maxProgress}
                </p>
              </div>
            ))}
          </div>

          {/* Info sobre screenings */}
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-900 font-medium">
              📊 {stats.upToDate}/{stats.total} screenings al día
            </p>
            {stats.overdue > 0 && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ {stats.overdue} atrasados (PSA, Colonoscopia)
              </p>
            )}
            {stats.dueSoon > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⏰ {stats.dueSoon} próximos a vencer
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionsPanel() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-900">⚡ Acciones Rápidas</h3>

      <ActionButton icon={<Activity className="h-4 w-4" />} label="Registrar presión arterial" />
      <ActionButton icon={<Pill className="h-4 w-4" />} label="Confirmar medicamento" />
      <ActionButton icon={<FileText className="h-4 w-4" />} label="Agregar síntoma" />
      <ActionButton icon={<TrendingUp className="h-4 w-4" />} label="Subir resultado" />
      <ActionButton icon={<MessageSquare className="h-4 w-4" />} label="Publicar en comunidad" />
    </div>
  )
}

function MedicalInfoPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">🩺 Signos Vitales</h3>
        <div className="space-y-3">
          <VitalSign
            icon={<Heart className="h-5 w-5 text-red-400" />}
            label="Presión Arterial"
            value="120/80"
            status="Normal"
            statusColor="text-green-400"
          />
          <VitalSign
            icon={<Activity className="h-5 w-5 text-blue-400" />}
            label="Frecuencia Cardíaca"
            value="72 lpm"
            status=""
            statusColor=""
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">💊 Medicamentos Hoy</h3>
        <div className="space-y-2">
          <MedicationItem name="Lisinopril 10mg" time="Tomado" completed />
          <MedicationItem name="Metformina 500mg" time="2:00 PM" />
          <MedicationItem name="Aspirina 100mg" time="8:00 PM" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">⚠️ Alergias</h3>
        <div className="rounded-lg bg-red-50 p-3 border-2 border-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">Penicilina</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">👁️ Visibilidad</h3>
        <div className="space-y-2">
          <AccessLog doctor="Dr. García" specialty="Cardiología" views={12} />
          <AccessLog doctor="Dra. Martínez" specialty="Med. General" views={8} />
        </div>
        <button className="mt-2 w-full rounded-lg bg-stone-100 border border-stone-300 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-200">
          <Eye className="mr-2 inline-block h-3 w-3" />
          Ver log completo
        </button>
      </div>
    </div>
  )
}

function ChatPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">💬 Chat en Vivo</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        <ChatMessage sender="Dr. García" message="¿Cómo está la presión arterial?" />
        <ChatMessage sender="Tú" message="Bien, 120/80 esta mañana" isOwn />
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Escribe aquí..."
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-500 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
        />
      </div>
    </div>
  )
}

// Helper Components
function CommunityPost({ group, members, author, content, replies, likes }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 transition hover:bg-stone-100">
      <div className="mb-2 flex items-center gap-2 text-xs text-stone-600">
        <Shield className="h-3 w-3" />
        <span>{group} ({members} miembros)</span>
      </div>
      <p className="mb-1 text-xs font-medium text-stone-700">{author}</p>
      <p className="mb-3 text-sm text-stone-900">{content}</p>
      <div className="flex items-center gap-4 text-xs text-stone-600">
        <span>💬 {replies} respuestas</span>
        <span>👍 {likes}</span>
      </div>
    </div>
  )
}

function GoalItem({ label, completed, total }: { label: string; completed: number; total: number }) {
  const percentage = (completed / total) * 100
  const isComplete = completed === total

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={isComplete ? 'text-emerald-600 font-semibold' : 'text-stone-700'}>
          {isComplete && '✅ '}{label}
        </span>
        <span className="text-stone-600">{completed}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full transition-all ${isComplete ? 'bg-emerald-600' : 'bg-stone-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:border-stone-700 hover:text-stone-900">
      <span className="text-stone-700">{icon}</span>
      {label}
    </button>
  )
}

function VitalSign({ icon, label, value, status, statusColor }: any) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-stone-50 border border-stone-200 p-3">
      <div>{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-stone-600">{label}</p>
        <p className="text-lg font-semibold text-stone-900">{value}</p>
        {status && <p className={`text-xs ${statusColor}`}>{status}</p>}
      </div>
    </div>
  )
}

function MedicationItem({ name, time, completed }: { name: string; time: string; completed?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg p-2 ${
      completed ? 'bg-green-50 border border-green-200' : 'bg-stone-50 border border-stone-200'
    }`}>
      <div className="flex items-center gap-2">
        {completed ? (
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-[10px] text-white">✓</span>
          </div>
        ) : (
          <Clock className="h-4 w-4 text-orange-500" />
        )}
        <span className="text-sm text-stone-900">{name}</span>
      </div>
      <span className={`text-xs ${completed ? 'text-green-600 font-semibold' : 'text-stone-600'}`}>
        {time}
      </span>
    </div>
  )
}

function AccessLog({ doctor, specialty, views }: { doctor: string; specialty: string; views: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 p-2">
      <div>
        <p className="text-sm font-medium text-stone-900">{doctor}</p>
        <p className="text-xs text-stone-600">{specialty}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-stone-800">{views}</p>
        <p className="text-[10px] text-stone-500">veces</p>
      </div>
    </div>
  )
}

function ChatMessage({ sender, message, isOwn }: { sender: string; message: string; isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isOwn ? 'bg-stone-100 border border-stone-300' : 'bg-stone-50 border border-stone-200'
      }`}>
        <p className="mb-1 text-xs font-medium text-stone-600">{sender}</p>
        <p className="text-sm text-stone-900">{message}</p>
      </div>
    </div>
  )
}
