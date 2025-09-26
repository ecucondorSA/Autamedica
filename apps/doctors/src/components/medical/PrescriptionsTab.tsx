/**
 * Componente de prescripciones para el portal de médicos
 */

'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import {
  Pill,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Edit3,
  Eye
} from 'lucide-react'
import { usePrescriptions } from '@/hooks'
import type { PrescriptionStatus } from '@/types/medical'

interface PrescriptionsTabProps {
  patientId: string | null
}

const STATUS_CONFIG: Record<PrescriptionStatus, {
  label: string
  icon: React.ElementType
  color: string
}> = {
  activa: {
    label: 'Activa',
    icon: CheckCircle,
    color: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  completada: {
    label: 'Completada',
    icon: CheckCircle,
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'bg-red-500/20 text-red-300 border-red-500/30'
  },
  pausada: {
    label: 'Pausada',
    icon: Pause,
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  }
}

export function PrescriptionsTab({ patientId }: PrescriptionsTabProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | ''>('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const { prescriptions, loading, error } = usePrescriptions(patientId, {
    filters: {
      medication_name: searchTerm || undefined,
      status: selectedStatus || undefined,
      active_only: showActiveOnly
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string | null): number | null => {
    if (!endDate) return null

    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const isExpiringSoon = (endDate: string | null): boolean => {
    const daysRemaining = getDaysRemaining(endDate)
    return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0
  }

  if (loading && prescriptions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mx-auto"></div>
          <p className="text-slate-400">Cargando prescripciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Error al cargar prescripciones</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!patientId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Pill className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin paciente seleccionado</h3>
          <p className="text-slate-400">Selecciona un paciente para ver sus prescripciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a1525]">

      {/* Header con controles */}
      <div className="border-b border-slate-800/60 bg-[#111f36] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Prescripciones</h1>
            <p className="text-sm text-slate-400">
              {prescriptions.length} prescripción{prescriptions.length !== 1 ? 'es' : ''} encontrada{prescriptions.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
            <Plus className="h-4 w-4" />
            Nueva Prescripción
          </button>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/40 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PrescriptionStatus | '')}
            className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
            />
            Solo activas
          </label>
        </div>
      </div>

      {/* Lista de prescripciones */}
      <div className="flex-1 overflow-y-auto p-6">
        {prescriptions.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Pill className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin prescripciones</h3>
              <p className="text-slate-400 mb-4">
                {searchTerm || selectedStatus || showActiveOnly
                  ? 'No se encontraron prescripciones con los filtros aplicados'
                  : 'Este paciente aún no tiene prescripciones'
                }
              </p>
              <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition mx-auto">
                <Plus className="h-4 w-4" />
                Crear Primera Prescripción
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((prescription) => {
              const statusConfig = STATUS_CONFIG[prescription.status]
              const StatusIcon = statusConfig.icon
              const daysRemaining = getDaysRemaining(prescription.end_date)
              const expiringSoon = isExpiringSoon(prescription.end_date)

              return (
                <div
                  key={prescription.id}
                  className={`rounded-lg border border-slate-800/60 bg-[#111f36] p-4 ${
                    expiringSoon ? 'ring-2 ring-orange-500/50' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-emerald-400" />
                      <span className={`rounded-full px-2 py-1 text-xs font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="inline h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button className="rounded-lg border border-slate-700 bg-slate-800/40 p-1.5 text-slate-300 hover:bg-slate-800/60 transition">
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button className="rounded-lg border border-slate-700 bg-slate-800/40 p-1.5 text-slate-300 hover:bg-slate-800/60 transition">
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Medicamento */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-slate-100 mb-1">
                      {prescription.medication_name}
                    </h3>
                    <p className="text-sm text-slate-400">{prescription.dosage}</p>
                  </div>

                  {/* Frecuencia y duración */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{prescription.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{prescription.duration}</span>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="border-t border-slate-800/60 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">Inicio</p>
                        <p className="text-slate-300">{formatDate(prescription.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Fin</p>
                        <p className="text-slate-300">
                          {prescription.end_date ? formatDate(prescription.end_date) : 'Indefinido'}
                        </p>
                      </div>
                    </div>

                    {daysRemaining !== null && (
                      <div className="mt-2">
                        {daysRemaining > 0 ? (
                          <p className={`text-xs ${expiringSoon ? 'text-orange-300' : 'text-slate-400'}`}>
                            {expiringSoon && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                            {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
                          </p>
                        ) : daysRemaining === 0 ? (
                          <p className="text-xs text-orange-300">
                            <AlertTriangle className="inline h-3 w-3 mr-1" />
                            Expira hoy
                          </p>
                        ) : (
                          <p className="text-xs text-red-300">
                            Expiró hace {Math.abs(daysRemaining)} día{Math.abs(daysRemaining) !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Instrucciones */}
                  {prescription.instructions && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <p className="text-xs text-slate-400">Instrucciones:</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {prescription.instructions}
                      </p>
                    </div>
                  )}

                  {/* Advertencias */}
                  {prescription.side_effects_warning && (
                    <div className="mt-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2">
                      <p className="text-xs text-yellow-300 flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {prescription.side_effects_warning}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
