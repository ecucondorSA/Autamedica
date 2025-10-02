'use client'

import { User, Mail, Phone, Calendar, Video } from 'lucide-react'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'

export default function TeamPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CollapsibleSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">👥 Mi Equipo Médico</h1>
          <p className="mt-2 text-sm text-stone-600">
            Profesionales que gestionan tu atención médica
          </p>
        </div>

        <div className="grid gap-4">
          {/* Médico principal */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-600">
                Médico Principal
              </span>
            </div>

            <DoctorCard
              name="Dr. García Martínez"
              specialty="Cardiología"
              license="COL-12345"
              email="garcia@autamedica.com"
              phone="+34 600 123 456"
              consultations={24}
              isPrimary
            />
          </div>

          {/* Equipo de especialistas */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-md p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Especialistas</h2>

            <div className="space-y-4">
              <DoctorCard
                name="Dra. Martínez López"
                specialty="Medicina General"
                license="COL-23456"
                email="martinez@autamedica.com"
                phone="+34 600 234 567"
                consultations={12}
              />

              <DoctorCard
                name="Dr. Rodríguez Sánchez"
                specialty="Endocrinología"
                license="COL-34567"
                email="rodriguez@autamedica.com"
                phone="+34 600 345 678"
                consultations={8}
              />

              <DoctorCard
                name="Dra. Fernández Cruz"
                specialty="Nutrición"
                license="COL-45678"
                email="fernandez@autamedica.com"
                phone="+34 600 456 789"
                consultations={5}
              />
            </div>
          </div>

          {/* Botón solicitar nuevo especialista */}
          <button className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-stone-600 transition hover:border-amber-600 hover:bg-stone-100 hover:text-amber-600">
            <User className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Solicitar Nuevo Especialista</p>
          </button>
        </div>
      </main>

      <CollapsibleRightPanel context="dashboard" />
    </div>
  )
}

interface DoctorCardProps {
  name: string
  specialty: string
  license: string
  email: string
  phone: string
  consultations: number
  isPrimary?: boolean
}

function DoctorCard({
  name,
  specialty,
  license,
  email,
  phone,
  consultations,
  isPrimary = false,
}: DoctorCardProps) {
  return (
    <div className={`rounded-lg p-4 ${isPrimary ? 'bg-stone-50 border border-stone-200' : 'bg-stone-50 border border-stone-200'}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <User className="h-8 w-8 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-stone-900">{name}</h3>
          <p className="text-sm text-stone-600">{specialty}</p>
          <p className="mt-1 text-xs text-stone-600">Cédula: {license}</p>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Mail className="h-4 w-4 text-stone-600" />
              <span>{email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Phone className="h-4 w-4 text-stone-600" />
              <span>{phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Calendar className="h-4 w-4 text-stone-600" />
              <span>{consultations} consultas realizadas</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100">
              <Video className="h-4 w-4" />
              Videollamada
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200">
              <Calendar className="h-4 w-4" />
              Agendar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
