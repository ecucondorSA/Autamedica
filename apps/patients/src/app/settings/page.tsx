'use client'

import { User, Bell, Shield, Palette, Globe, Key } from 'lucide-react'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel'

export default function SettingsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CompactSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">⚙️ Configuración</h1>
          <p className="mt-2 text-sm text-stone-600">
            Personaliza tu experiencia en el portal de pacientes
          </p>
        </div>

        <div className="grid gap-4">
          {/* Perfil */}
          <SettingSection
            icon={<User className="h-5 w-5" />}
            title="Perfil Personal"
            description="Actualiza tu información personal y foto de perfil"
          >
            <div className="grid gap-4">
              <InputField label="Nombre completo" placeholder="Juan Pérez" />
              <InputField label="Email" placeholder="juan@ejemplo.com" type="email" />
              <InputField label="Teléfono" placeholder="+34 600 000 000" />
            </div>
          </SettingSection>

          {/* Notificaciones */}
          <SettingSection
            icon={<Bell className="h-5 w-5" />}
            title="Notificaciones"
            description="Gestiona cómo y cuándo recibes notificaciones"
          >
            <div className="space-y-3">
              <ToggleOption
                label="Recordatorios de medicamentos"
                description="Recibe alertas para tomar tus medicamentos"
                defaultChecked
              />
              <ToggleOption
                label="Recordatorios de citas"
                description="Notificaciones 24h antes de cada cita"
                defaultChecked
              />
              <ToggleOption
                label="Resultados de laboratorio"
                description="Aviso cuando lleguen nuevos resultados"
                defaultChecked
              />
              <ToggleOption
                label="Comunidad"
                description="Notificaciones de respuestas en la comunidad"
              />
            </div>
          </SettingSection>

          {/* Privacidad */}
          <SettingSection
            icon={<Shield className="h-5 w-5" />}
            title="Privacidad y Seguridad"
            description="Controla quién puede ver tu información médica"
          >
            <div className="space-y-3">
              <ToggleOption
                label="Compartir con médicos del equipo"
                description="Permite a otros médicos ver tu historial"
                defaultChecked
              />
              <ToggleOption
                label="Permitir búsqueda anónima"
                description="Contribuir a estudios médicos de forma anónima"
              />
              <button className="w-full rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                Ver log de accesos a mi historial
              </button>
            </div>
          </SettingSection>

          {/* Apariencia */}
          <SettingSection
            icon={<Palette className="h-5 w-5" />}
            title="Apariencia"
            description="Personaliza el tema visual del portal"
          >
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption name="AutaMedica" color="from-teal-500 to-cyan-500" active />
              <ThemeOption name="Marine" color="from-blue-500 to-indigo-500" />
              <ThemeOption name="Midnight" color="from-purple-500 to-pink-500" />
            </div>
          </SettingSection>

          {/* Idioma */}
          <SettingSection
            icon={<Globe className="h-5 w-5" />}
            title="Idioma y Región"
            description="Cambia el idioma de la interfaz"
          >
            <select className="w-full rounded-lg border border-stone-300 bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30">
              <option>Español (España)</option>
              <option>English (US)</option>
              <option>Français</option>
            </select>
          </SettingSection>

          {/* Seguridad */}
          <SettingSection
            icon={<Key className="h-5 w-5" />}
            title="Contraseña y Autenticación"
            description="Actualiza tu contraseña y métodos de autenticación"
          >
            <div className="space-y-3">
              <button className="w-full rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                Cambiar contraseña
              </button>
              <button className="w-full rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                Configurar autenticación de dos factores
              </button>
            </div>
          </SettingSection>
        </div>
      </main>

      <DynamicRightPanel context="dashboard" />
    </div>
  )
}

interface SettingSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SettingSection({ icon, title, description, children }: SettingSectionProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-md p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <p className="text-sm text-stone-600">{description}</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  )
}

interface InputFieldProps {
  label: string
  placeholder: string
  type?: string
}

function InputField({ label, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone-300 bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder-slate-500 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
      />
    </div>
  )
}

interface ToggleOptionProps {
  label: string
  description: string
  defaultChecked?: boolean
}

function ToggleOption({ label, description, defaultChecked = false }: ToggleOptionProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex-1">
        <p className="font-medium text-stone-900">{label}</p>
        <p className="text-sm text-stone-600">{description}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-600/30"></div>
      </label>
    </div>
  )
}

interface ThemeOptionProps {
  name: string
  color: string
  active?: boolean
}

function ThemeOption({ name, color, active = false }: ThemeOptionProps) {
  return (
    <button
      className={`rounded-lg p-4 transition ${
        active ? 'ring-2 ring-amber-600' : 'ring-1 ring-slate-700 hover:ring-slate-600'
      }`}
    >
      <div className={`mb-2 h-12 rounded-lg bg-gradient-to-r ${color}`} />
      <p className="text-sm font-medium text-stone-900">{name}</p>
    </button>
  )
}
