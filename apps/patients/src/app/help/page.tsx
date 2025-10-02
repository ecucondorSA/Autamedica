'use client'

import { HelpCircle, Book, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel'

export default function HelpPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CompactSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">❓ Centro de Ayuda</h1>
          <p className="mt-2 text-sm text-stone-600">
            Encuentra respuestas y obtén soporte técnico
          </p>
        </div>

        <div className="grid gap-4">
          {/* Contacto de emergencia */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-400" />
              <span className="text-sm font-semibold uppercase tracking-wide text-red-400">
                Emergencia 24/7
              </span>
            </div>

            <p className="mb-4 text-stone-700">
              Si experimentas una emergencia médica, llama inmediatamente:
            </p>

            <div className="flex gap-3">
              <button className="rounded-lg bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400">
                📞 112 - Emergencias
              </button>

              <button className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-400">
                🏥 +34 900 123 456
              </button>
            </div>
          </div>

          {/* Preguntas frecuentes */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <Book className="h-5 w-5 text-amber-600" />
              Preguntas Frecuentes
            </h2>

            <div className="space-y-3">
              <FaqItem
                question="¿Cómo agendar una videoconsulta?"
                answer="Ve a 'Mis Citas' y selecciona 'Agendar Nueva Cita'. Elige el especialista y el horario disponible."
              />

              <FaqItem
                question="¿Cómo ver mis resultados de laboratorio?"
                answer="Accede a 'Historia Clínica' > 'Resultados de Laboratorio'. Todos tus análisis estarán disponibles ahí."
              />

              <FaqItem
                question="¿Puedo cambiar mi medicación?"
                answer="No. Cualquier cambio en tu medicación debe ser autorizado por tu médico. Agenda una consulta."
              />

              <FaqItem
                question="¿Cómo funciona la comunidad de pacientes?"
                answer="Puedes unirte a grupos según tu condición y compartir experiencias de forma anónima y segura."
              />
            </div>
          </div>

          {/* Contacto de soporte */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              Contactar Soporte
            </h2>

            <div className="space-y-3">
              <ContactOption
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                value="soporte@autamedica.com"
                description="Respuesta en 24h"
              />

              <ContactOption
                icon={<Phone className="h-5 w-5" />}
                title="Teléfono"
                value="+34 900 800 700"
                description="Lun-Vie: 9:00 - 18:00"
              />

              <ContactOption
                icon={<MessageCircle className="h-5 w-5" />}
                title="Chat en Vivo"
                value="Iniciar chat"
                description="Disponible ahora"
                isButton
              />
            </div>
          </div>

          {/* Recursos adicionales */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-900">
              <ExternalLink className="h-5 w-5 text-amber-600" />
              Recursos Útiles
            </h2>

            <div className="space-y-2">
              <ResourceLink title="Guía del Portal de Pacientes" url="#" />
              <ResourceLink title="Términos y Condiciones" url="#" />
              <ResourceLink title="Política de Privacidad" url="#" />
              <ResourceLink title="Derechos del Paciente" url="#" />
            </div>
          </div>
        </div>
      </main>

      <DynamicRightPanel context="dashboard" />
    </div>
  )
}

interface FaqItemProps {
  question: string
  answer: string
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details className="group rounded-lg bg-stone-50 border border-stone-200 p-4 transition hover:bg-stone-100">
      <summary className="cursor-pointer font-semibold text-stone-900 group-open:mb-2">
        {question}
      </summary>
      <p className="text-sm text-stone-600">{answer}</p>
    </details>
  )
}

interface ContactOptionProps {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  isButton?: boolean
}

function ContactOption({ icon, title, value, description, isButton = false }: ContactOptionProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-stone-600">{title}</p>
        {isButton ? (
          <button className="text-left font-semibold text-amber-600 hover:text-amber-500">
            {value}
          </button>
        ) : (
          <p className="font-semibold text-stone-900">{value}</p>
        )}
        <p className="text-xs text-stone-500">{description}</p>
      </div>
    </div>
  )
}

interface ResourceLinkProps {
  title: string
  url: string
}

function ResourceLink({ title, url }: ResourceLinkProps) {
  return (
    <a
      href={url}
      className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 p-3 text-stone-700 transition hover:bg-stone-100 hover:text-amber-600"
    >
      <span className="text-sm">{title}</span>
      <ExternalLink className="h-4 w-4 text-stone-500" />
    </a>
  )
}
