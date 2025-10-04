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
  MessageSquare,
  Brain,
  ClipboardList
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const navigationItems = [
  { icon: Home, label: 'Inicio', href: '/', active: true },
  { icon: Brain, label: 'IA Diagnóstico', href: '/demo/symptom-analyzer', badge: 'NUEVO' },
  { icon: ClipboardList, label: 'Anamnesis', href: '/anamnesis' },
  { icon: FileText, label: 'Historia clínica', href: '/medical-history' },
  { icon: Heart, label: 'Salud Reproductiva', href: '/reproductive-health' },
  { icon: Shield, label: 'Salud Preventiva', href: '/preventive-health' },
  { icon: Calendar, label: 'Citas', href: '/appointments', badge: 'PRÓX.' },
  { icon: Video, label: 'Videollamada', href: '#video', highlight: true },
  { icon: MessageSquare, label: 'Comunidad', href: '/community' },
  { icon: BarChart3, label: 'Indicadores', href: '/indicators', beta: true },
  { icon: Users, label: 'Equipo médico', href: '/team' },
]

const bottomItems = [
  { icon: Bot, label: 'ALTA IA', href: '#alta', assistant: true },
  { icon: Settings, label: 'Configuración', href: '/settings' },
  { icon: HelpCircle, label: 'Ayuda', href: '/help' },
]

export function CompactSidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userInitials, setUserInitials] = useState<string>('U')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Obtener nombre del usuario
        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
        setUserName(name)

        // Obtener foto del usuario (Google OAuth o avatar personalizado)
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        setUserAvatar(avatar)

        // Generar iniciales (primera letra del nombre y apellido si existe)
        const nameParts = name.split(' ')
        const initials = nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase()

        setUserInitials(initials)
      } catch (error) {
        console.error('Error fetching user data', error)
      }
    }

    fetchUserData()
  }, [])

  return (
    <aside className="flex w-[12%] min-w-[80px] max-w-[120px] flex-col border-r border-stone-200 bg-white py-6 shadow-sm">
      {/* User Avatar */}
      <div className="mb-8 px-4">
        <div
          className="relative h-10 w-10 mx-auto cursor-pointer group"
          title={userName || 'Usuario'}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-stone-200 group-hover:ring-stone-800 transition-all"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-700 text-white font-bold text-sm shadow-md group-hover:bg-stone-800 transition-colors">
              {userInitials || <User className="h-5 w-5" />}
            </div>
          )}
        </div>
        {userName && (
          <p className="mt-2 text-center text-[9px] font-medium text-stone-700 leading-tight">
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
                  group relative flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-all
                  ${isActive ? 'bg-stone-800 text-white shadow-md' : ''}
                  ${isHighlight && !isActive ? 'bg-stone-100 text-stone-900 ring-2 ring-stone-600' : ''}
                  ${!isActive && !isHighlight && !isDisabled ? 'text-stone-700 hover:bg-stone-100 hover:text-stone-900' : ''}
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                `}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => isDisabled && e.preventDefault()}
              >
                <Icon className={`h-5 w-5 ${isHighlight ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label.split(' ')[0]}
                </span>

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
                  <div className="absolute inset-0 rounded-xl bg-stone-50 ring-2 ring-stone-600/60" />
                )}
              </Link>

              {/* Tooltip on hover */}
              {isHovered && (
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
                  group relative flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-all
                  ${isAssistant ? 'bg-gradient-to-br from-stone-700 to-stone-800 text-white shadow-md' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'}
                `}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Icon className={`h-5 w-5 ${isAssistant ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label.split(' ')[0]}
                </span>

                {isAssistant && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-stone-600 items-center justify-center text-[8px] text-white font-bold">AI</span>
                  </span>
                )}
              </Link>

              {/* Tooltip */}
              {isHovered && (
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
