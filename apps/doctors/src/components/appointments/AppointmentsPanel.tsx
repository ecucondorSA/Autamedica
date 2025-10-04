"use client"

import type { JSX } from 'react'
import { Calendar, Clock, Video, User, Plus, Filter } from 'lucide-react'
import { useAppointments } from '@autamedica/hooks'

export function AppointmentsPanel(): JSX.Element {
  const { appointments, loading, error } = useAppointments()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando citas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400'
      case 'confirmed': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'telemedicine': return <Video className="h-4 w-4" />
      case 'consultation': return <User className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2">
            <Calendar className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Agenda de Citas</h1>
            <p className="text-slate-400">
              {appointments.length} cita{appointments.length !== 1 ? 's' : ''} programada{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
          >
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Hoy</p>
              <p className="text-xl font-semibold text-slate-100">
                {appointments.filter(apt => new Date(apt.start_time).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Video className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Telemedicina</p>
              <p className="text-xl font-semibold text-slate-100">
                {appointments.filter(apt => apt.type === 'telemedicine').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Pendientes</p>
              <p className="text-xl font-semibold text-slate-100">
                {appointments.filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Confirmadas</p>
              <p className="text-xl font-semibold text-slate-100">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No hay citas programadas</h3>
              <p className="text-slate-500 mb-4">Programa tu primera cita médica</p>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Programar Cita
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                        {getTypeIcon(appointment.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-slate-100">{appointment.patient_id ? `Paciente ${appointment.patient_id.slice(0, 8)}` : 'Sin asignar'}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status ?? 'scheduled')}`}>
                            {appointment.status ?? 'scheduled'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(appointment.start_time).toLocaleDateString('es-ES')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ({appointment.duration_minutes ?? 30} min)
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-slate-500">{appointment.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {appointment.type === 'telemedicine' && (
                        <button
                          type="button"
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          Iniciar Videollamada
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}