"use client"

import type { JSX } from 'react'
import { useState } from 'react'
import { FileText, Search, Plus, Eye, Edit, Calendar, User } from 'lucide-react'
import { useMedicalHistory } from '@/hooks'

export function RecordsPanel(): JSX.Element {
  // Por ahora usar patientId de ejemplo (María González)
  const [selectedPatientId] = useState<string>('550e8400-e29b-41d4-a716-446655440000')
  const { history, loading, error } = useMedicalHistory(selectedPatientId)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando historiales...</p>
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

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-500/20 text-blue-400'
      case 'diagnosis': return 'bg-red-500/20 text-red-400'
      case 'treatment': return 'bg-green-500/20 text-green-400'
      case 'prescription': return 'bg-purple-500/20 text-purple-400'
      case 'test_result': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta'
      case 'diagnosis': return 'Diagnóstico'
      case 'treatment': return 'Tratamiento'
      case 'prescription': return 'Prescripción'
      case 'test_result': return 'Resultado'
      default: return 'Registro'
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/20 p-2">
            <FileText className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Historiales Médicos</h1>
            <p className="text-slate-400">
              {history.length} registro{history.length !== 1 ? 's' : ''} médico{history.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Consultas</p>
              <p className="text-xl font-semibold text-slate-100">
                {history.filter(record => record.record_type === 'consultation').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Este Mes</p>
              <p className="text-xl font-semibold text-slate-100">
                {history.filter(record =>
                  new Date(record.record_date).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <User className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Paciente Activo</p>
              <p className="text-sm font-semibold text-slate-100">María González</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <FileText className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Último Registro</p>
              <p className="text-sm font-semibold text-slate-100">
                {history.length > 0 ? new Date(history[0].record_date).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="flex-1 overflow-hidden">
        {history.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No hay registros médicos</h3>
              <p className="text-slate-500 mb-4">Selecciona un paciente para ver sus registros</p>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Crear Registro
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid gap-4">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 transition hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-100">
                            {getRecordTypeLabel(record.record_type)}
                          </h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRecordTypeColor(record.record_type)}`}>
                            {record.record_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(record.record_date).toLocaleDateString('es-ES')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Dr. AutaMedica
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
                        title="Ver registro"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-700 p-2 text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
                        title="Editar registro"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Record Details */}
                  <div className="space-y-3">
                    {record.chief_complaint && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Motivo de Consulta</h4>
                        <p className="text-sm text-slate-400">{record.chief_complaint}</p>
                      </div>
                    )}

                    {record.assessment && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Diagnóstico</h4>
                        <p className="text-sm text-slate-400">{record.assessment}</p>
                      </div>
                    )}

                    {record.plan && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Plan de Tratamiento</h4>
                        <p className="text-sm text-slate-400">{record.plan}</p>
                      </div>
                    )}
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