'use client'

import type { CSSProperties, ReactNode, ChangeEvent } from 'react'
import { AuthProvider } from '@autamedica/auth'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', href: '/', icon: Monitor },
  { id: 'medical-history', label: 'Historia clínica', href: '/medical-history', icon: FileText },
  { id: 'appointments', label: 'Citas', href: '#', icon: Calendar, badge: 'Próx.' },
  { id: 'telemedicine', label: 'Videollamada', href: '#', icon: Video },
  { id: 'analytics', label: 'Indicadores', href: '#', icon: Activity, badge: 'Beta' },
  { id: 'care-team', label: 'Equipo médico', href: '#', icon: Stethoscope },
]

const SECONDARY_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Configuración', href: '#', icon: Settings },
  { id: 'help', label: 'Ayuda', href: '#', icon: HelpCircle },
]

type PatientRootLayoutProps = {
  children: ReactNode
}

export function PatientRootLayout({ children }: PatientRootLayoutProps): JSX.Element {
  const pathname = usePathname()
  const [themeId, setThemeId] = useState<ThemeId>('autamedica')
  const [fontScale, setFontScale] = useState<FontScale>('md')
  const [highContrast, setHighContrast] = useState(false)
  const [clock, setClock] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  const theme = THEMES[themeId]

  const cssVariables = useMemo(() => {
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

  const mainClasses = clsx(
    'flex-1 overflow-y-auto px-6 py-6',
    FONT_SCALE_CLASS[fontScale],
  )

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setThemeId(event.target.value as ThemeId)
  }

  return (
    <AuthProvider>
      <PatientPortalProvider>
      <div
        className={clsx(
          'min-h-screen bg-[var(--patient-bg)] text-[var(--patient-text)] transition-colors duration-300',
          highContrast && 'contrast-125',
        )}
        style={cssVariables as CSSProperties}
      >
        <div className="grid min-h-screen grid-cols-[16rem,1fr]">
          <aside className="flex flex-col border-r border-[var(--patient-border)] bg-[var(--patient-surface)]/90 backdrop-blur">
            <div className="flex h-20 items-center gap-3 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--patient-primary)] text-slate-950">
                <span className="text-sm font-semibold">PT</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--patient-text)]">AutaMedica Patients</p>
                <p className="text-xs text-[var(--patient-text-muted)]">Portal personal de salud</p>
              </div>
            </div>

            <nav className="flex-1 space-y-6 px-4">
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href !== '#' && pathname === item.href

                  return item.href === '#' ? (
                    <button
                      key={item.id}
                      type="button"
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--patient-text-muted)] transition hover:bg-[var(--patient-surface)]/80 hover:text-[var(--patient-text)]"
                      disabled
                    >
                      <item.icon className="h-4 w-4 text-[var(--patient-text-muted)]" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-[var(--patient-primary)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--patient-primary)]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.href}
                      prefetch
                      className={clsx(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-[var(--patient-primary)]/15 text-[var(--patient-text)]'
                          : 'text-[var(--patient-text-muted)] hover:bg-[var(--patient-surface)]/80 hover:text-[var(--patient-text)]',
                      )}
                    >
                      <item.icon
                        className={clsx(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-[var(--patient-primary)]' : 'text-[var(--patient-text-muted)] group-hover:text-[var(--patient-text)]',
                        )}
                      />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-[var(--patient-primary)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--patient-primary)]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="space-y-1">
                <p className="px-3 text-[11px] uppercase tracking-wide text-[var(--patient-text-muted)]">Soporte</p>
                {SECONDARY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--patient-text-muted)] transition hover:bg-[var(--patient-surface)]/80 hover:text-[var(--patient-text)]"
                  >
                    <item.icon className="h-4 w-4 text-[var(--patient-text-muted)] group-hover:text-[var(--patient-primary)]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div className="px-4 pb-6">
              <div className="rounded-xl border border-[var(--patient-border)] bg-[var(--patient-surface)]/70 p-4 text-xs text-[var(--patient-text-muted)]">
                <p className="font-semibold text-[var(--patient-text)]">Recordatorio</p>
                <p className="mt-1 leading-relaxed">
                  Mantén tus datos de contacto y seguros al día para agilizar tus próximas consultas.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex min-h-screen flex-col bg-[var(--patient-bg)]">
            <header className="flex h-16 items-center justify-between border-b border-[var(--patient-border)] bg-[var(--patient-surface)]/70 px-6">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--patient-text)]">
                <span>Panel del paciente</span>
                <span className="rounded-full border border-[var(--patient-primary)]/40 bg-[var(--patient-primary)]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--patient-primary)]">
                  Beta
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--patient-text-muted)]">
                <span className="hidden items-center gap-2 rounded-lg border border-[var(--patient-border)] bg-[var(--patient-surface)]/80 px-3 py-2 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>En línea</span>
                </span>
                <span>{clock}</span>
                <label className="flex items-center gap-2">
                  <span className="hidden text-[var(--patient-text-muted)] md:inline">Tema</span>
                  <select
                    value={themeId}
                    onChange={handleThemeChange}
                    className="rounded-lg border border-[var(--patient-border)] bg-[var(--patient-surface)]/70 px-2 py-1 text-xs text-[var(--patient-text)] focus:outline-none focus:ring-2 focus:ring-[var(--patient-primary)]/40"
                  >
                    {Object.entries(THEMES).map(([id, option]) => (
                      <option key={id} value={id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-[var(--patient-border)] bg-[var(--patient-surface)]/70 p-1 text-[var(--patient-text)]">
                  {(['sm', 'md', 'lg'] as FontScale[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={clsx(
                        'rounded-md px-2 py-1 text-[11px] font-semibold transition',
                        fontScale === scale
                          ? 'bg-[var(--patient-primary)]/20 text-[var(--patient-primary)]'
                          : 'text-[var(--patient-text-muted)] hover:text-[var(--patient-text)]',
                      )}
                      aria-pressed={fontScale === scale}
                    >
                      {scale === 'sm' ? 'A-' : scale === 'md' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast((prev) => !prev)}
                  className={clsx(
                    'rounded-lg border border-[var(--patient-border)] px-3 py-2 text-xs font-semibold transition',
                    highContrast
                      ? 'bg-[var(--patient-primary)]/20 text-[var(--patient-primary)]'
                      : 'text-[var(--patient-text-muted)] hover:text-[var(--patient-text)]',
                  )}
                  aria-pressed={highContrast}
                >
                  Alto contraste
                </button>
              </div>
            </header>

            <main className={mainClasses}>{children}</main>

            <footer className="flex h-10 items-center justify-between border-t border-[var(--patient-border)] bg-[var(--patient-surface)]/70 px-6 text-[11px] text-[var(--patient-text-muted)]">
              <div className="flex items-center gap-3">
                <span>© {new Date().getFullYear()} AutaMedica</span>
                <span className="hidden items-center gap-1 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Datos protegidos</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>Versión 0.2.0</span>
                <span>Región: LATAM</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
      </PatientPortalProvider>
    </AuthProvider>
  )
}
