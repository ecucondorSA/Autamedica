'use client'

import {
  Home,
  FileText,
  Heart,
  Shield,
  Calendar,
  Video,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  Brain,
  ClipboardList,
  ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@autamedica/auth'

const navigationItems = [
  { icon: Home, label: 'Inicio', href: '/', active: true },
  { icon: Brain, label: 'IA Diagnóstico', href: '/demo/symptom-analyzer', badge: 'NUEVO' },
  { icon: ClipboardList, label: 'Anamnesis', href: '/anamnesis' },
  { icon: FileText, label: 'Historia clínica', href: '/medical-history', disabled: true },
  { icon: Heart, label: 'Salud Reproductiva', href: '/reproductive-health' },
  { icon: ShieldCheck, label: 'Prevención Embarazo', href: '/pregnancy-prevention', badge: 'NUEVO' },
  { icon: Shield, label: 'Salud Preventiva', href: '/preventive-health' },
  { icon: Calendar, label: 'Citas', href: '/appointments', badge: 'PRÓX.' },
  { icon: Video, label: 'Videollamada', href: '#video', highlight: true },
  { icon: BarChart3, label: 'Indicadores', href: '/indicators', beta: true },
  { icon: Users, label: 'Equipo médico', href: '/team' },
]

const bottomItems = [
  { icon: Bot, label: 'ALTA IA', href: '#alta', assistant: true },
  { icon: Settings, label: 'Configuración', href: '/settings' },
  { icon: HelpCircle, label: 'Ayuda', href: '/help' },
]

export function CollapsibleSidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userInitials, setUserInitials] = useState<string>('U')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createBrowserClient()
        if (!supabase) return

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
        setUserName(name)

        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        setUserAvatar(avatar)

        const nameParts = name.split(' ')
        const initials = nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase()

        setUserInitials(initials)
      } catch (error) {
        logger.error('Error fetching user data', error)
      }
    }

    fetchUserData()
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <aside className={`relative flex flex-col border-r border-stone-200 bg-white py-6 shadow-sm transition-all duration-300 ${
      isCollapsed ? 'w-[64px]' : 'w-[240px]'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white shadow-md transition hover:bg-stone-50"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-stone-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-stone-600" />
        )}
      </button>

      {/* User Avatar */}
      <div className={`mb-8 px-4 ${isCollapsed ? 'px-2' : ''}`}>
        <div
          className={`relative mx-auto cursor-pointer group ${isCollapsed ? 'h-10 w-10' : 'h-12 w-12'}`}
          title={userName || 'Usuario'}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className={`rounded-xl object-cover shadow-md ring-2 ring-stone-200 group-hover:ring-stone-800 transition-all ${
                isCollapsed ? 'h-10 w-10' : 'h-12 w-12'
              }`}
            />
          ) : (
            <div className={`flex items-center justify-center rounded-xl bg-stone-700 text-white font-bold shadow-md group-hover:bg-stone-800 transition-colors ${
              isCollapsed ? 'h-10 w-10 text-xs' : 'h-12 w-12 text-sm'
            }`}>
              {isCollapsed ? userInitials[0] : userInitials || <User className="h-5 w-5" />}
            </div>
          )}
        </div>
        {!isCollapsed && userName && (
          <p className="mt-2 text-center text-xs font-medium text-stone-700 leading-tight truncate">
            {userName.split(' ')[0]}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isHovered = hoveredItem === item.label
          const isActive = item.active
          const isHighlight = item.highlight
          const isDisabled = item.disabled

          return (
            <div key={item.label} className="relative">
              <Link
                href={item.href}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all
                  ${isActive ? 'bg-stone-800 text-white shadow-md' : ''}
                  ${isHighlight && !isActive ? 'bg-stone-100 text-stone-900 ring-2 ring-stone-600' : ''}
                  ${!isActive && !isHighlight && !isDisabled ? 'text-stone-700 hover:bg-stone-100 hover:text-stone-900' : ''}
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => isDisabled && e.preventDefault()}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isHighlight ? 'animate-pulse' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}

                {item.badge && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}

                {item.beta && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-purple-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    BETA
                  </span>
                )}

                {isHighlight && !isActive && (
                  <div className="absolute inset-0 rounded-xl bg-stone-50 ring-2 ring-stone-600/60 -z-10" />
                )}
              </Link>

              {/* Tooltip cuando está colapsado */}
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-3 py-2 text-xs font-medium text-white shadow-xl">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-800" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-stone-300" />

      {/* Bottom items */}
      <div className="space-y-1 px-2">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isHovered = hoveredItem === item.label
          const isAssistant = item.assistant

          return (
            <div key={item.label} className="relative">
              <Link
                href={item.href}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all
                  ${isAssistant ? 'bg-gradient-to-br from-stone-700 to-stone-800 text-white shadow-md' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isAssistant ? 'animate-pulse' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}

                {isAssistant && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-stone-600 items-center justify-center text-[8px] text-white font-bold">AI</span>
                  </span>
                )}
              </Link>

              {/* Tooltip cuando está colapsado */}
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-3 py-2 text-xs font-medium text-white shadow-xl">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-800" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
