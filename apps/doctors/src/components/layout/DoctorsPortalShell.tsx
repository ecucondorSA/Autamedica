"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import {
  Activity,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  Home,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  Star,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createBrowserClient } from '@autamedica/auth'
import { PatientInfoTab } from '@/components/patient/PatientInfoTab'
import { MedicalHistoryTab } from '@/components/medical/MedicalHistoryTab'
import { PrescriptionsTab } from '@/components/medical/PrescriptionsTab'
import { VitalSignsTab } from '@/components/medical/VitalSignsTab'
import { AIHistoryTab } from '@/components/medical/AIHistoryTab'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { SubscriptionPanel } from '@/components/subscription/SubscriptionPanel'
import { MarketplacePanel } from '@/components/marketplace/MarketplacePanel'
import { PatientsPanel } from '@/components/patients/PatientsPanel'
import { AppointmentsPanel } from '@/components/appointments/AppointmentsPanel'
import { RecordsPanel } from '@/components/records/RecordsPanel'
import { VitalSignsPanel } from '@/components/vitals/VitalSignsPanel'
import { DiagnosisPanel } from '@/components/diagnosis/DiagnosisPanel'
import { MedicalRankingPanel } from '@/components/ranking/MedicalRankingPanel'
import { useActiveSession } from '@/hooks'

type TabId = 'video-call' | 'patient-info' | 'medical-history' | 'prescriptions' | 'vital-signs' | 'ai-history'

type SidebarItem = {
  id: string
  icon: LucideIcon
  label: string
  count?: number
  badge?: string
}

type TabConfig = {
  id: TabId
  label: string
  icon: string
}

type PortalContextValue = {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  userName: string
  isFocusMode: boolean
  setFocusMode: (focus: boolean) => void
}

const PortalLayoutContext = createContext<PortalContextValue | null>(null)

export function useDoctorsPortal(): PortalContextValue {
  const value = useContext(PortalLayoutContext)
  if (!value) {
    throw new Error('useDoctorsPortal must be used within DoctorsPortalShell')
  }
  return value
}

const FALLBACK_USER = 'Dr. Invitado'

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DR'
  )
}

function TabPlaceholder({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#111b2e] text-center text-slate-300">
      <span className="text-4xl">🛠️</span>
      <div>
        <p className="text-lg font-semibold">{label}</p>
        <p className="text-sm text-slate-400">Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  )
}

function SectionPlaceholder({ title, icon, description }: { title: string; icon: string; description: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-800/60 bg-[#101d32] p-8 text-center">
      <span className="text-6xl">{icon}</span>
      <div>
        <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-600"
      >
        Actualizar página
      </button>
    </div>
  )
}


export function DoctorsPortalShell({ children }: { children: ReactNode }): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('video-call')
  const [userName, setUserName] = useState(FALLBACK_USER)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    fetch('http://localhost:4312/active-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activeSection }),
    }).catch(() => {
      // Debug server not running; ignore
    })
  }, [activeSection])


  // Hook para obtener la sesión activa con el paciente
  const { session } = useActiveSession()

  // Contadores para sidebar - funcionalidad production sin dependencias problemáticas
  const patients = { length: 0 } // Se conectará con Supabase cuando esté configurado
  const appointments = { length: 0 } // Se conectará con Supabase cuando esté configurado
  const history = { length: 0 } // Se conectará con Supabase cuando esté configurado

  // Efecto para plegar el sidebar automáticamente cuando inicia una videollamada
  useEffect(() => {
    if (session?.status === 'en_progreso' && activeTab === 'video-call' && !activeSection) {
      setIsSidebarCollapsed(true)
    }
  }, [session?.status, activeTab, activeSection])

  useEffect(() => {
    if (isFocusMode) {
      setIsSidebarCollapsed(true)
    }
  }, [isFocusMode])

  const handleSidebarItemClick = (itemId: string) => {
        setIsSidebarOpen(false)

    if (isFocusMode) {
      setIsFocusMode(false)
    }

    switch (itemId) {
      case 'settings':
        setActiveSection('settings')
        break
      case 'subscription':
        setActiveSection('subscription')
        break
      case 'marketplace':
        setActiveSection('marketplace')
        break
      case 'ranking':
        setActiveSection('ranking')
        break
      case 'patients':
        setActiveSection('patients')
        break
      case 'appointments':
        setActiveSection('appointments')
        break
      case 'records':
        setActiveSection('records')
        break
      case 'vitals':
        setActiveSection('vitals')
        break
      case 'chat':
        setActiveSection('chat')
        break
      case 'diagnosis':
        setActiveSection('diagnosis')
        break
      case 'history':
        setActiveSection('history')
        break
      default:
                setActiveSection(null)
    }
  }

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Intl.DateTimeFormat('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      )
    }

    updateClock()
    const interval = setInterval(updateClock, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createBrowserClient()

        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.warn('[DoctorsPortalShell] No se pudo obtener el usuario actual', error.message)
          return
        }

        const user = data.user
        if (!user) {
          console.info('[DoctorsPortalShell] No hay usuario autenticado, usando fallback')
          return
        }

        const metadata = user.user_metadata as Record<string, unknown> | null
        const resolvedName =
          (metadata?.name as string | undefined) ||
          (metadata?.full_name as string | undefined) ||
          user.email?.split('@')[0]?.replaceAll('.', ' ') ||
          FALLBACK_USER

        setUserName(`Dr. ${resolvedName}`)
        console.info('[DoctorsPortalShell] Usuario cargado:', resolvedName)
      } catch (error) {
        console.error('[DoctorsPortalShell] Error al obtener usuario:', error)
      }
    }

    fetchUser()
  }, [])

  const sidebarItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'patients', icon: Users, label: 'Pacientes', count: patients.length },
      { id: 'appointments', icon: Calendar, label: 'Citas', count: appointments.length },
      { id: 'records', icon: FileText, label: 'Historiales', count: history.length },
      { id: 'vitals', icon: Activity, label: 'Signos Vitales' },
      { id: 'chat', icon: MessageSquare, label: 'Chat', count: 0 },
      { id: 'diagnosis', icon: Brain, label: 'IA Diagnosis', badge: 'NEW' },
      { id: 'history', icon: History, label: 'Historial IA', count: 0 },
      { id: 'ranking', icon: Star, label: 'Ranking', badge: 'GOLD' },
      { id: 'subscription', icon: CreditCard, label: 'Suscripción', badge: 'PRO' },
      { id: 'marketplace', icon: MapPin, label: 'Trabajo Médico', badge: 'HOT' },
      { id: 'settings', icon: Settings, label: 'Configuración' },
    ],
    [patients.length, appointments.length, history.length],
  )

  const resumeFocusIfLive = () => {
    if (session?.status === 'en_progreso') {
      setIsFocusMode(true)
    }
  }

  const tabs = useMemo<TabConfig[]>(
    () => [
      { id: 'video-call', label: 'Videollamada Activa', icon: '🎥' },
      { id: 'patient-info', label: 'Información Paciente', icon: '👤' },
      { id: 'medical-history', label: 'Historial Médico', icon: '📋' },
      { id: 'prescriptions', label: 'Prescripciones', icon: '💊' },
      { id: 'vital-signs', label: 'Signos Vitales', icon: '📊' },
      { id: 'ai-history', label: 'Historial IA', icon: '🧠' },
    ],
    [],
  )

  const portalContext: PortalContextValue = {
    activeTab,
    setActiveTab,
    userName,
    isFocusMode,
    setFocusMode: setIsFocusMode,
  }

  const navItems = sidebarItems.map(({ id, icon: Icon, label, count, badge }) => (
    <button
      key={id}
      type="button"
      className={`flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-slate-700 hover:bg-slate-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
        activeSection === id ? 'bg-slate-800/60 border-slate-600' : 'bg-transparent'
      }`}
      onClick={() => handleSidebarItemClick(id)}
    >
      <span className="flex items-center gap-3 text-sm">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-slate-200">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {typeof count === 'number' && (
          <span className="rounded-full bg-[#ee58a6] px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
        )}
        {badge && (
          <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-slate-900">{badge}</span>
        )}
      </span>
    </button>
  ))

  return (
    <PortalLayoutContext.Provider value={portalContext}>
      <div
        className={`app h-screen ${isFocusMode ? 'app--focus' : ''} bg-[#07101e] text-slate-100`}
        suppressHydrationWarning
      >
        <header className="header z-10 flex items-center justify-between gap-3 border-b border-slate-800/60 bg-[#0f1f35] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/60 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isFocusMode ? '' : 'md:hidden'
              }`}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex gap-1">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">AutaMedica Doctor Portal</p>
              <p className="text-xs text-slate-400">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="hidden items-center gap-1 text-emerald-400 sm:flex">
              <span>●</span>
              Conectado
            </span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span>{currentTime}</span>
          </div>
        </header>

        <div className="tabs border-b border-slate-800/60 bg-[#0f1f35]">
          <div className="flex h-full w-full items-center overflow-x-auto px-2 sm:px-6">
            <div className="flex min-w-full snap-x snap-mandatory gap-2 md:min-w-0 md:gap-0">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-w-[180px] snap-start items-center gap-2 rounded-lg px-4 py-2 text-sm transition md:min-w-0 md:rounded-none md:border-r md:border-transparent md:px-5 md:py-2.5 ${
                      isActive
                        ? 'bg-[#172d4f] font-medium text-white md:bg-[#172d4f] md:border-slate-700'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <div
            className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm ${isFocusMode ? '' : 'md:hidden'}`}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative h-full w-72 max-w-[85vw] bg-[#111f36] px-5 py-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                                        setActiveSection(null)
                    setActiveTab('video-call')
                    setIsSidebarOpen(false)
                    resumeFocusIfLive()
                  }}
                  className="text-sm font-semibold text-slate-200 transition-colors hover:text-emerald-400"
                >
                  Portal Médico
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2 overflow-y-auto pb-16">{navItems}</nav>
              <div className="absolute inset-x-5 bottom-6 rounded-xl border border-slate-800/60 bg-slate-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-slate-900">
                    {getInitials(userName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{userName}</p>
                    <p className="text-xs text-emerald-400">● Disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="app__layout flex min-h-0 overflow-hidden">
          <aside
            className={`left-rail relative hidden flex-col border-r border-slate-800/60 bg-[#111f36] px-2 py-4 transition-all duration-300 md:flex ${
              !isSidebarCollapsed ? 'left-rail--expanded' : ''
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                                        setActiveSection(null)
                    setActiveTab('video-call')
                    resumeFocusIfLive()
                  }}
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-emerald-400"
                >
                  Portal Médico
                </button>
              )}
              {isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                                        setActiveSection(null)
                    setActiveTab('video-call')
                    resumeFocusIfLive()
                  }}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-emerald-400"
                  title="Portal Médico"
                >
                  <Home className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-1.5 text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map(({ id, icon: Icon, label, count, badge }) => (
                <button
                  key={id}
                  type="button"
                  className={`sidebar-button flex w-full items-center justify-between rounded-lg border border-transparent px-2 py-2 text-left text-xs transition hover:border-slate-700 hover:bg-slate-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible-outline-blue-500 ${
                    activeSection === id ? 'border-slate-600 bg-slate-800/60' : ''
                  } ${isSidebarCollapsed ? 'flex-col gap-1 text-center' : 'gap-2'}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleSidebarItemClick(id)
                  }}
                  title={isSidebarCollapsed ? label : undefined}
                >
                  <span className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <Icon className="h-4 w-4 text-slate-400" />
                    {!isSidebarCollapsed && <span className="text-slate-200">{label}</span>}
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="flex items-center gap-2">
                      {typeof count === 'number' && (
                        <span className="rounded-full bg-[#ee58a6] px-2 py-0.5 text-[10px] font-semibold text-white">{count}</span>
                      )}
                      {badge && (
                        <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">{badge}</span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className={`mt-auto rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 ${isSidebarCollapsed ? 'px-2' : ''}`}>
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'flex-col text-center' : ''}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-900">
                  {getInitials(userName)}
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <p className="text-sm font-medium text-slate-200">{userName}</p>
                    <p className="text-xs text-emerald-400">● Disponible</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-1 flex-col bg-[#07101e]">
            <section
              className={`flex min-h-0 flex-1 overflow-hidden ${
                isFocusMode ? 'p-0' : 'p-0'
              }`}
            >
              <div
                className="flex h-full w-full flex-col overflow-auto p-6"
                role="main"
                aria-label="Panel de contenido médico principal"
              >
                {activeSection === 'settings' && <SettingsPanel />}
                {activeSection === 'subscription' && <SubscriptionPanel />}
                {activeSection === 'marketplace' && <MarketplacePanel />}
                {activeSection === 'ranking' && (
                  <SectionPlaceholder
                    title="Sistema de Ranking Médico"
                    icon="⭐"
                    description="Visualiza tu ranking profesional basado en evaluaciones de pacientes, volumen de consultas y reconocimientos AutaMedica"
                  />
                )}
                {activeSection === 'patients' && <PatientsPanel />}
                {activeSection === 'appointments' && <AppointmentsPanel />}
                {activeSection === 'records' && <RecordsPanel />}
                {activeSection === 'vitals' && <VitalSignsPanel />}
                {activeSection === 'chat' && (
                  <SectionPlaceholder
                    title="Chat Médico"
                    icon="💬"
                    description="Comunicación segura con pacientes y colegas"
                  />
                )}
                {activeSection === 'diagnosis' && <DiagnosisPanel />}
                {activeSection === 'history' && (
                  <SectionPlaceholder
                    title="Historial IA"
                    icon="🤖"
                    description="Historial de análisis y recomendaciones de IA"
                  />
                )}
                {activeSection === 'ranking' && <MedicalRankingPanel />}

                {!activeSection && (
                  <div className="flex min-h-0 flex-1 overflow-hidden">
                    {activeTab === 'video-call' ? (
                      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
                        {children}
                      </div>
                    ) : (
                      <div className="flex min-h-0 w-full flex-1 overflow-y-auto rounded-xl border border-slate-800/60 bg-[#101d32] p-6">
                        {activeTab === 'patient-info' && <PatientInfoTab patientId={session?.patientId || null} />}
                        {activeTab === 'medical-history' && <MedicalHistoryTab patientId={session?.patientId || null} />}
                        {activeTab === 'prescriptions' && <PrescriptionsTab patientId={session?.patientId || null} />}
                        {activeTab === 'vital-signs' && <VitalSignsTab patientId={session?.patientId || null} />}
                        {activeTab === 'ai-history' && <AIHistoryTab patientId={session?.patientId || null} />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
            <footer className="flex flex-col items-center gap-2 border-t border-slate-800/60 bg-[#0f1f35] px-4 py-3 text-xs text-slate-300 sm:flex-row sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="flex items-center gap-1">
                  <span role="img" aria-label="hospital">
                    🏥
                  </span>
                  <span className="font-semibold text-slate-100">AutaMedica</span>
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span>●</span>
                  Consultas activas 8/12
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span>Próxima: 16:00 - Carlos Ruiz</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span role="img" aria-label="energía">
                    ⚡
                  </span>
                  <span>AutaMedica Medical</span>
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span>●</span>
                  API Online
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </PortalLayoutContext.Provider>
  )
}
