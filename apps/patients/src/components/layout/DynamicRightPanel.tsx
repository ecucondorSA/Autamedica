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
import { useCommunityPosts } from '@/hooks/useCommunity'
import { usePatientStreak } from '@/hooks/usePatientStreak'
import { useWeeklyGoals } from '@/hooks/useWeeklyGoals'
import { useVitalSigns } from '@/hooks/useVitalSigns'
import { useMedications } from '@/hooks/useMedications'
import { useAllergies } from '@/hooks/useAllergies'
import { useAccessLog } from '@/hooks/useAccessLog'
import {
  BloodPressureModal,
  MedicationModal,
  SymptomModal,
  LabResultModal,
  CommunityPostModal,
} from '@/components/quick-actions/QuickActionModals'

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
          { id: 'medical' as PanelTab, label: 'Salud', icon: Heart },
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
  const { posts, loading, error, refetch } = useCommunityPosts(5);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    refetch(); // Recargar publicaciones
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-stone-900">💬 Tu Comunidad</h3>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto"></div>
              <p className="mt-2 text-xs text-stone-600">Cargando publicaciones...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-900">
              {error}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-600">No hay publicaciones aún</p>
              <p className="text-xs text-stone-500 mt-1">¡Sé el primero en publicar!</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="space-y-3">
              {posts.map((post) => (
                <CommunityPost
                  key={post.id}
                  group={post.group?.name || 'Grupo'}
                  members={post.group?.member_count || 0}
                  author={post.is_anonymous ? 'Anónimo' : (post.author_display_name || 'Usuario')}
                  content={post.title}
                  replies={post.comment_count}
                  likes={post.reaction_count}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full btn-primary-ivory py-2.5 text-sm"
        >
          + Crear publicación
        </button>
      </div>

      <CommunityPostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSuccess={handlePostCreated}
      />
    </>
  )
}

function ProgressPanel() {
  // ✅ Fase 1: Racha real desde DB
  const { streakDays, longestStreak, loading: streakLoading } = usePatientStreak();
  const streakProgress = (streakDays / 30) * 100;

  // ✅ Fase 2: Screenings y logros reales desde DB
  const { achievements, stats, loading: screeningsLoading } = usePatientScreenings();

  // ✅ Fase 3: Metas semanales reales desde DB
  const { goals: weeklyGoals, loading: goalsLoading } = useWeeklyGoals();

  // Calcular nivel basado en screenings completados
  const points = stats.upToDate * 250 + streakDays * 50;
  const levelProgress = (points / 2000) * 100;

  // Show loading state while fetching data
  if (streakLoading || screeningsLoading || goalsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
          <p className="ml-3 text-sm text-stone-600">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">🏆 Tu Progreso</h3>

        {/* Streak - Con datos reales */}
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
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-stone-600">{streakDays}/30 días para Nivel Oro</span>
            {longestStreak > 0 && (
              <span className="text-stone-500">🏅 Récord: {longestStreak} días</span>
            )}
          </div>
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

        {/* Weekly goals - ✅ Datos reales desde DB */}
        <div>
          <p className="mb-2 text-xs font-semibold text-stone-700">🎯 METAS SEMANALES</p>
          {weeklyGoals.length > 0 ? (
            <div className="space-y-2">
              {weeklyGoals.map(goal => (
                <GoalItem
                  key={goal.id}
                  label={goal.label}
                  completed={goal.currentCount}
                  total={goal.targetCount}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic py-2">
              No hay metas configuradas esta semana. Crea una desde el panel de acciones.
            </p>
          )}
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
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-900">⚡ Acciones Rápidas</h3>

        <ActionButton
          icon={<Activity className="h-4 w-4" />}
          label="Registrar presión arterial"
          onClick={() => setActiveModal('blood-pressure')}
          data-tour="action-blood-pressure"
        />
        <ActionButton
          icon={<Pill className="h-4 w-4" />}
          label="Confirmar medicamento"
          onClick={() => setActiveModal('medication')}
          data-tour="action-medication"
        />
        <ActionButton
          icon={<FileText className="h-4 w-4" />}
          label="Agregar síntoma"
          onClick={() => setActiveModal('symptom')}
          data-tour="action-symptom"
        />
        <ActionButton
          icon={<TrendingUp className="h-4 w-4" />}
          label="Subir resultado"
          onClick={() => setActiveModal('lab-result')}
          data-tour="action-lab-result"
        />
        <ActionButton
          icon={<MessageSquare className="h-4 w-4" />}
          label="Publicar en comunidad"
          onClick={() => setActiveModal('community-post')}
          data-tour="action-community-post"
        />
      </div>

      {/* Modales */}
      <BloodPressureModal
        isOpen={activeModal === 'blood-pressure'}
        onClose={() => setActiveModal(null)}
      />
      <MedicationModal
        isOpen={activeModal === 'medication'}
        onClose={() => setActiveModal(null)}
      />
      <SymptomModal
        isOpen={activeModal === 'symptom'}
        onClose={() => setActiveModal(null)}
      />
      <LabResultModal
        isOpen={activeModal === 'lab-result'}
        onClose={() => setActiveModal(null)}
      />
      <CommunityPostModal
        isOpen={activeModal === 'community-post'}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}

function MedicalInfoPanel() {
  const { vitalSigns, loading: vitalsLoading } = useVitalSigns()
  const { medications, loading: medsLoading } = useMedications()
  const { allergies, loading: allergiesLoading } = useAllergies()
  const { doctorSummaries, loading: accessLoading } = useAccessLog()

  // Helper to format blood pressure
  const formatBloodPressure = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return 'N/A'
    return `${systolic}/${diastolic}`
  }

  // Helper to get status color
  const getStatusColor = (status?: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-stone-500'
    }
  }

  // Helper to get status text
  const getStatusText = (status?: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return 'Normal'
      case 'warning':
        return 'Atención'
      case 'critical':
        return 'Crítico'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Vital Signs Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">🩺 Signos Vitales</h3>
        {vitalsLoading ? (
          <div className="text-center text-xs text-stone-500 py-4">Cargando...</div>
        ) : vitalSigns ? (
          <div className="space-y-3">
            {vitalSigns.systolic_bp && vitalSigns.diastolic_bp && (
              <VitalSign
                icon={<Heart className="h-5 w-5 text-red-400" />}
                label="Presión Arterial"
                value={formatBloodPressure(vitalSigns.systolic_bp, vitalSigns.diastolic_bp)}
                status={getStatusText(vitalSigns.status)}
                statusColor={getStatusColor(vitalSigns.status)}
              />
            )}
            {vitalSigns.heart_rate && (
              <VitalSign
                icon={<Activity className="h-5 w-5 text-blue-400" />}
                label="Frecuencia Cardíaca"
                value={`${vitalSigns.heart_rate} lpm`}
                status=""
                statusColor=""
              />
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-stone-500 py-4">
            No hay signos vitales registrados
          </div>
        )}
      </div>

      {/* Medications Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">💊 Medicamentos</h3>
        {medsLoading ? (
          <div className="text-center text-xs text-stone-500 py-4">Cargando...</div>
        ) : medications.length > 0 ? (
          <div className="space-y-2">
            {medications.map((med, index) => (
              <MedicationItem
                key={index}
                name={`${med.name} ${med.dosage || ''}`}
                time={med.time || med.frequency || 'Horario no especificado'}
                completed={med.completed}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-stone-500 py-4">
            No hay medicamentos registrados
          </div>
        )}
      </div>

      {/* Allergies Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">⚠️ Alergias</h3>
        {allergiesLoading ? (
          <div className="text-center text-xs text-stone-500 py-4">Cargando...</div>
        ) : allergies.length > 0 ? (
          <div className="space-y-2">
            {allergies.map((allergy, index) => (
              <div key={index} className="rounded-lg bg-red-50 p-3 border-2 border-red-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">{allergy.name}</span>
                  {allergy.severity && (
                    <span className="ml-auto text-xs text-red-700 font-semibold uppercase">
                      {allergy.severity}
                    </span>
                  )}
                </div>
                {allergy.reaction && (
                  <p className="mt-1 text-xs text-red-800">{allergy.reaction}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-800">Sin alergias registradas</span>
            </div>
          </div>
        )}
      </div>

      {/* Access Log Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-900">👁️ Visibilidad</h3>
        {accessLoading ? (
          <div className="text-center text-xs text-stone-500 py-4">Cargando...</div>
        ) : doctorSummaries.length > 0 ? (
          <>
            <div className="space-y-2">
              {doctorSummaries.slice(0, 3).map((summary, index) => (
                <AccessLog
                  key={index}
                  doctor={summary.doctor_name}
                  specialty={summary.specialty}
                  views={summary.views}
                />
              ))}
            </div>
            {doctorSummaries.length > 3 && (
              <button className="mt-2 w-full rounded-lg bg-stone-100 border border-stone-300 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-200">
                <Eye className="mr-2 inline-block h-3 w-3" />
                Ver log completo ({doctorSummaries.length} médicos)
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-xs text-stone-500 py-4">
            No hay accesos registrados
          </div>
        )}
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

function ActionButton({
  icon,
  label,
  onClick,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:border-stone-700 hover:text-stone-900"
      {...props}
    >
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
