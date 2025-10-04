'use client'

import type { CSSProperties, ReactNode, ChangeEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Calendar,
  FileText,
  HelpCircle,
  Monitor,
  Settings,
  Stethoscope,
  Video,
  Heart,
  Shield,
} from 'lucide-react'
import { PatientPortalProvider } from '@/components/layout/PatientPortalShell'

const formatClock = (date: Date): string =>
  new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

type ThemeId = 'autamedica' | 'marine' | 'midnight'

type ThemeDefinition = {
  name: string
  background: string
  surface: string
  border: string
  primary: string
  primarySoft: string
  text: string
  textMuted: string
}

const THEMES: Record<ThemeId, ThemeDefinition> = {
  autamedica: {
    name: 'AutaMedica',
    background: '#101014',
    surface: '#16161d',
    border: '#272734',
    primary: '#4fd1c5',
    primarySoft: '#2c7a7b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  },
  marine: {
    name: 'Azul Clínico',
    background: '#0b1620',
    surface: '#112030',
    border: '#1f3245',
    primary: '#60a5fa',
    primarySoft: '#2563eb',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
  },
  midnight: {
    name: 'Medianoche',
    background: '#05060a',
    surface: '#111217',
    border: '#1e202b',
    primary: '#c084fc',
    primarySoft: '#7c3aed',
    text: '#fdf4ff',
    textMuted: '#c4b5fd',
  },
}

type FontScale = 'sm' | 'md' | 'lg'

const FONT_SCALE_CLASS: Record<FontScale, string> = {
  sm: 'text-[13px] leading-5',
  md: 'text-[15px] leading-6',
  lg: 'text-[17px] leading-7',
}

type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

const _NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', href: '/', icon: Monitor },
  { id: 'medical-history', label: 'Historia clínica', href: '/medical-history', icon: FileText },
  { id: 'reproductive-health', label: 'Salud Reproductiva', href: '/reproductive-health', icon: Heart },
  { id: 'preventive-health', label: 'Salud Preventiva', href: '/preventive-health', icon: Shield },
  { id: 'appointments', label: 'Citas', href: '#', icon: Calendar, badge: 'Próx.' },
  { id: 'telemedicine', label: 'Videollamada', href: '#', icon: Video },
  { id: 'analytics', label: 'Indicadores', href: '#', icon: Activity, badge: 'Beta' },
  { id: 'care-team', label: 'Equipo médico', href: '#', icon: Stethoscope },
]

const _SECONDARY_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Configuración', href: '#', icon: Settings },
  { id: 'help', label: 'Ayuda', href: '#', icon: HelpCircle },
]

type PatientRootLayoutProps = {
  children: ReactNode
}

export function PatientRootLayout({ children }: PatientRootLayoutProps): JSX.Element {
  const _pathname = usePathname()
  const [themeId, setThemeId] = useState<ThemeId>('autamedica')
  const [_fontScale, _setFontScale] = useState<FontScale>('md')
  const [_highContrast, _setHighContrast] = useState(false)
  const [_clock, setClock] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  const theme = THEMES[themeId]

  const _cssVariables = useMemo(() => {
    return {
      '--patient-bg': theme.background,
      '--patient-surface': theme.surface,
      '--patient-border': theme.border,
      '--patient-primary': theme.primary,
      '--patient-primary-soft': theme.primarySoft,
      '--patient-text': theme.text,
      '--patient-text-muted': theme.textMuted,
    } satisfies CSSProperties
  }, [theme])

  const _mainClasses = clsx(
    'flex-1 overflow-y-auto px-6 py-6',
    FONT_SCALE_CLASS[_fontScale],
  )

  const _handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeId(event.target.value as ThemeId)
  }

  // Simplificado: solo envolver con providers, sin UI propia
  // AuthProvider ya está en el root layout (layout.tsx)
  return (
    <PatientPortalProvider>
      {children}
    </PatientPortalProvider>
  )
}
