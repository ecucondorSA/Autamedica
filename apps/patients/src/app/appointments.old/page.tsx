'use client'

import { Calendar, Clock, Video, MapPin, User } from 'lucide-react'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'

export default function AppointmentsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory-base">
      <CollapsibleSidebar />

      <main className="flex flex-1 flex-col p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">📅 Mis Citas</h1>
          <p className="mt-2 text-sm text-stone-600">
            Gestiona tus citas médicas y videoconsultas
          </p>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto">
          {/* Próxima cita destacada */}
          <div className="rounded-2xl border-2 border-stone-300 bg-gradient-to-br from-stone-50 to-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-stone-700" />
              <span className="text-label text-stone-700">
                Próxima Cita
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <User className="h-8 w-8 text-stone-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900">Dr. García Martínez</h3>
                <p className="text-sm text-stone-600">Cardiología</p>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Calendar className="h-4 w-4 text-stone-700" />
                    <span>Mañana, 15 de Octubre - 10:00 AM</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Video className="h-4 w-4 text-stone-700" />
                    <span>Videoconsulta</span>
                  </div>
                </div>

                <button className="mt-4 btn-primary-ivory px-6 py-2 text-sm">
                  Unirme a la videollamada
                </button>
              </div>
            </div>
          </div>

          {/* Citas programadas */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-md p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">Citas Programadas</h2>

            <div className="space-y-3">
              <AppointmentCard
                doctor="Dra. Martínez López"
                specialty="Medicina General"
                date="20 Oct - 2:00 PM"
                type="presencial"
                location="Consultorio 302"
              />

              <AppointmentCard
                doctor="Dr. Rodríguez Sánchez"
                specialty="Endocrinología"
                date="25 Oct - 11:00 AM"
                type="video"
              />

              <AppointmentCard
                doctor="Dra. Fernández Cruz"
                specialty="Nutrición"
                date="30 Oct - 4:00 PM"
                type="video"
              />
            </div>
          </div>

          {/* Botón agendar nueva cita */}
          <button className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-stone-600 transition hover:border-stone-700 hover:bg-stone-100 hover:text-stone-900">
            <Calendar className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Agendar Nueva Cita</p>
          </button>
        </div>
      </main>

      <CollapsibleRightPanel context="appointments" />
    </div>
  )
}

interface AppointmentCardProps {
  doctor: string
  specialty: string
  date: string
  type: 'video' | 'presencial'
  location?: string
}

function AppointmentCard({ doctor, specialty, date, type, location }: AppointmentCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-stone-50 border border-stone-200 p-4 transition hover:bg-stone-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200">
        <User className="h-6 w-6 text-stone-600" />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-stone-900">{doctor}</h3>
        <p className="text-sm text-stone-600">{specialty}</p>
      </div>

      <div className="text-right">
        <div className="mb-1 flex items-center gap-1 text-sm text-stone-700">
          <Clock className="h-3 w-3" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-stone-600">
          {type === 'video' ? (
            <>
              <Video className="h-3 w-3 text-blue-400" />
              <span>Video</span>
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 text-orange-400" />
              <span>{location}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
