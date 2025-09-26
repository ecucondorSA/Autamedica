/**
 * Componente de historial médico para el portal de médicos
 */

'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import {
  FileText,
  Calendar,
  Search,
  Plus,
  Eye,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  Download
} from 'lucide-react'
import { useMedicalHistory } from '@/hooks'
import type { ConsultationType } from '@/types/medical'

interface MedicalHistoryTabProps {
  patientId: string | null
}

const CONSULTATION_TYPES: { value: ConsultationType; label: string; color: string }[] = [
  { value: 'general', label: 'General', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'seguimiento', label: 'Seguimiento', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'urgencia', label: 'Urgencia', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { value: 'especialidad', label: 'Especialidad', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
]

const DEFAULT_CONSULTATION_TYPE = CONSULTATION_TYPES.at(0) ?? {
  value: 'general' as ConsultationType,
  label: 'General',
  color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}

export function MedicalHistoryTab({ patientId }: MedicalHistoryTabProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ConsultationType | ''>('')
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  const { records, loading, error, loadMore, hasMore } = useMedicalHistory(patientId, {
    filters: {
      consultation_type: selectedType || undefined,
      diagnosis_contains: searchTerm || undefined
    }
  })

  const getConsultationTypeInfo = (type: ConsultationType) => {
    return CONSULTATION_TYPES.find(t => t.value === type) ?? DEFAULT_CONSULTATION_TYPE
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mx-auto"></div>
          <p className="text-slate-400">Cargando historial médico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Error al cargar historial</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!patientId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin paciente seleccionado</h3>
          <p className="text-slate-400">Selecciona un paciente para ver su historial médico</p>
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
            <h1 className="text-xl font-bold text-slate-100">Historial Médico</h1>
            <p className="text-sm text-slate-400">
              {records.length} registro{records.length !== 1 ? 's' : ''} encontrado{records.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/40 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 transition">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por diagnóstico, síntomas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/40 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ConsultationType | '')}
            className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos los tipos</option>
            {CONSULTATION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="flex-1 overflow-y-auto p-6">
        {records.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin registros médicos</h3>
              <p className="text-slate-400 mb-4">
                {searchTerm || selectedType
                  ? 'No se encontraron registros con los filtros aplicados'
                  : 'Este paciente aún no tiene registros médicos'
                }
              </p>
              <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition mx-auto">
                <Plus className="h-4 w-4" />
                Crear Primera Consulta
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const typeInfo = getConsultationTypeInfo(record.consultation_type)
              const isExpanded = expandedRecord === record.id

              return (
                <div
                  key={record.id}
                  className="rounded-lg border border-slate-800/60 bg-[#111f36] overflow-hidden"
                >
                  {/* Header del registro */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium border ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.consultation_date)}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                          {record.chief_complaint}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Stethoscope className="h-4 w-4" />
                            <span>Diagnóstico: {record.diagnosis}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 transition"
                      >
                        <Eye className="h-4 w-4" />
                        {isExpanded ? 'Ocultar' : 'Ver detalles'}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/60 bg-slate-900/40 p-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Síntomas</h4>
                          <div className="flex flex-wrap gap-2">
                            {record.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Plan de Tratamiento</h4>
                          <p className="text-sm text-slate-400">{record.treatment_plan}</p>
                        </div>

                        {record.follow_up_instructions && (
                          <div className="lg:col-span-2">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Instrucciones de Seguimiento</h4>
                            <p className="text-sm text-slate-400">{record.follow_up_instructions}</p>
                          </div>
                        )}

                        {record.attachments.length > 0 && (
                          <div className="lg:col-span-2">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Archivos Adjuntos</h4>
                            <div className="space-y-2">
                              {record.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 p-3"
                                >
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-300">{attachment.file_name}</p>
                                    <p className="text-xs text-slate-400">
                                      {(attachment.file_size / 1024).toFixed(1)} KB • {attachment.description}
                                    </p>
                                  </div>
                                  <button className="rounded-lg border border-slate-600 bg-slate-800/40 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800/60 transition">
                                    Descargar
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Botón cargar más */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-lg border border-slate-600 bg-slate-800/40 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800/60 transition disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Cargar más registros'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
