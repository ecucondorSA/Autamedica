"use client"

import { useState } from 'react'
import type { JSX } from 'react'
import {
  Bell,
  Lock,
  Palette,
  Shield,
  User,
  Video
} from 'lucide-react'

type SettingsCategory = {
  id: string
  title: string
  icon: typeof User
  description: string
}

type SettingItem = {
  id: string
  label: string
  description: string
  type: 'toggle' | 'select' | 'input'
  value: boolean | string | number
  options?: string[]
}

export function SettingsPanel(): JSX.Element {
  const [activeCategory, setActiveCategory] = useState('profile')
  const [settings, setSettings] = useState<Record<string, boolean | string | number>>({
    notifications: true,
    darkMode: true,
    language: 'es',
    videoQuality: 'HD',
    microphoneGain: 75,
    cameraResolution: '1080p',
    autoRecording: false,
    privacyMode: true,
  })

  const categories: SettingsCategory[] = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: User,
      description: 'Información personal y preferencias de cuenta'
    },
    {
      id: 'video',
      title: 'Video y Audio',
      icon: Video,
      description: 'Configuración de cámara, micrófono y calidad'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      description: 'Alertas, recordatorios y comunicaciones'
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: Shield,
      description: 'Seguridad y protección de datos médicos'
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      description: 'Temas, idioma y personalización visual'
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Lock,
      description: 'Autenticación y acceso a la cuenta'
    }
  ]

  const settingsByCategory: Record<string, SettingItem[]> = {
    profile: [
      {
        id: 'fullName',
        label: 'Nombre completo',
        description: 'Tu nombre como aparece en el sistema',
        type: 'input',
        value: 'Dr. Juan Pérez'
      },
      {
        id: 'specialty',
        label: 'Especialidad médica',
        description: 'Tu área de especialización',
        type: 'select',
        value: 'Cardiología',
        options: ['Cardiología', 'Pediatría', 'Neurología', 'Oncología', 'Medicina General']
      },
      {
        id: 'license',
        label: 'Número de licencia médica',
        description: 'Tu número de colegiatura profesional',
        type: 'input',
        value: '12345678'
      }
    ],
    video: [
      {
        id: 'videoQuality',
        label: 'Calidad de video',
        description: 'Resolución predeterminada para videollamadas',
        type: 'select',
        value: 'HD',
        options: ['SD', 'HD', '4K']
      },
      {
        id: 'cameraResolution',
        label: 'Resolución de cámara',
        description: 'Calidad de captura de video',
        type: 'select',
        value: '1080p',
        options: ['720p', '1080p', '4K']
      },
      {
        id: 'microphoneGain',
        label: 'Ganancia del micrófono',
        description: 'Nivel de amplificación del audio',
        type: 'input',
        value: 75
      },
      {
        id: 'autoRecording',
        label: 'Grabación automática',
        description: 'Grabar consultas automáticamente (con consentimiento)',
        type: 'toggle',
        value: false
      }
    ],
    notifications: [
      {
        id: 'notifications',
        label: 'Notificaciones push',
        description: 'Recibir alertas en tiempo real',
        type: 'toggle',
        value: true
      },
      {
        id: 'emailNotifications',
        label: 'Notificaciones por email',
        description: 'Recibir resúmenes y recordatorios por correo',
        type: 'toggle',
        value: true
      },
      {
        id: 'appointmentReminders',
        label: 'Recordatorios de citas',
        description: 'Alertas antes de consultas programadas',
        type: 'toggle',
        value: true
      }
    ],
    privacy: [
      {
        id: 'privacyMode',
        label: 'Modo privacidad mejorada',
        description: 'Encriptación adicional para datos sensibles',
        type: 'toggle',
        value: true
      },
      {
        id: 'dataRetention',
        label: 'Retención de datos',
        description: 'Tiempo de almacenamiento de información médica',
        type: 'select',
        value: '7 años',
        options: ['1 año', '3 años', '5 años', '7 años', '10 años']
      },
      {
        id: 'shareAnalytics',
        label: 'Compartir análisis anónimos',
        description: 'Ayudar a mejorar el sistema con datos anónimos',
        type: 'toggle',
        value: false
      }
    ],
    appearance: [
      {
        id: 'darkMode',
        label: 'Modo oscuro',
        description: 'Interfaz con colores oscuros para reducir fatiga visual',
        type: 'toggle',
        value: true
      },
      {
        id: 'language',
        label: 'Idioma',
        description: 'Idioma de la interfaz',
        type: 'select',
        value: 'es',
        options: ['es', 'en', 'pt', 'fr']
      },
      {
        id: 'fontSize',
        label: 'Tamaño de fuente',
        description: 'Tamaño del texto en la interfaz',
        type: 'select',
        value: 'medium',
        options: ['small', 'medium', 'large', 'extra-large']
      }
    ],
    security: [
      {
        id: 'twoFactorAuth',
        label: 'Autenticación de dos factores',
        description: 'Seguridad adicional para tu cuenta',
        type: 'toggle',
        value: false
      },
      {
        id: 'sessionTimeout',
        label: 'Tiempo de sesión',
        description: 'Cerrar sesión automáticamente por inactividad',
        type: 'select',
        value: '30 minutos',
        options: ['15 minutos', '30 minutos', '1 hora', '2 horas', 'Nunca']
      },
      {
        id: 'loginAlerts',
        label: 'Alertas de inicio de sesión',
        description: 'Notificar cuando se accede a tu cuenta',
        type: 'toggle',
        value: true
      }
    ]
  }

  const handleSettingChange = (settingId: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }))
  }

  const renderSettingControl = (setting: SettingItem) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings[setting.id] ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
            onClick={() => handleSettingChange(setting.id, !settings[setting.id])}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings[setting.id] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )
      case 'select':
        return (
          <select
            value={settings[setting.id] as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {setting.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'input':
        return (
          <input
            type={typeof setting.value === 'number' ? 'number' : 'text'}
            value={settings[setting.id] as string | number}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        )
    }
  }

  const currentSettings = settingsByCategory[activeCategory] || []

  return (
    <div className="flex h-full rounded-xl border border-slate-800/60 bg-[#101d32] shadow-xl">
      {/* Sidebar de categorías */}
      <div className="w-64 border-r border-slate-800/60 bg-[#0a1526] p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Configuración</h2>
          <p className="text-sm text-slate-400">Personaliza tu experiencia médica</p>
        </div>

        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'hover:bg-slate-800/40 text-slate-300 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <p className="text-sm font-medium">{category.title}</p>
                  <p className="text-xs text-slate-500">{category.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel de configuraciones */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-100">
            {categories.find(c => c.id === activeCategory)?.title}
          </h3>
          <p className="text-sm text-slate-400">
            {categories.find(c => c.id === activeCategory)?.description}
          </p>
        </div>

        <div className="space-y-6">
          {currentSettings.map((setting) => (
            <div key={setting.id} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-200">{setting.label}</h4>
                <p className="text-xs text-slate-400">{setting.description}</p>
              </div>
              <div className="flex-shrink-0">
                {renderSettingControl(setting)}
              </div>
            </div>
          ))}
        </div>

        {/* Botón de guardar */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/40"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}