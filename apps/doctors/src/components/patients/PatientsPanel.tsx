"use client"

import type { JSX } from 'react'
import { Users, Search, UserPlus, Calendar, FileText } from 'lucide-react'
import { usePatients } from '@autamedica/hooks'

export function PatientsPanel(): JSX.Element {
  const { patients, loading, error } = usePatients()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando pacientes...</p>
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

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/20 p-2">
            <Users className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Gestión de Pacientes</h1>
            <p className="text-slate-400">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar pacientes por nombre, email..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-4 py-3 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Patients List */}
      <div className="flex-1 overflow-hidden">
        {patients.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No hay pacientes registrados</h3>
              <p className="text-slate-500 mb-4">Comienza agregando tu primer paciente</p>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                Agregar Paciente
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid gap-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-100">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-slate-400">{patient.email}</p>
                        {patient.phone && (
                          <p className="text-sm text-slate-500">{patient.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
                        title="Ver historial"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
                        title="Agendar cita"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>Estado: {patient.status}</span>
                    <span>•</span>
                    <span>Última visita: {new Date(patient.lastVisit).toLocaleDateString('es-ES')}</span>
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