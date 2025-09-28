/**
 * Componente de signos vitales para el portal de médicos
 */

'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Scale,
  Ruler,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar,
  Edit3,
  BarChart3
} from 'lucide-react'
import { useVitalSigns } from '@/hooks'

interface VitalSignsTabProps {
  patientId: string | null
}

const VITAL_SIGNS_RANGES = {
  blood_pressure_systolic: { min: 90, max: 120, unit: 'mmHg', label: 'Presión sistólica' },
  blood_pressure_diastolic: { min: 60, max: 80, unit: 'mmHg', label: 'Presión diastólica' },
  heart_rate: { min: 60, max: 100, unit: 'BPM', label: 'Frecuencia cardíaca' },
  temperature: { min: 36.1, max: 37.5, unit: '°C', label: 'Temperatura' },
  oxygen_saturation: { min: 95, max: 100, unit: '%', label: 'Saturación de oxígeno' },
  respiratory_rate: { min: 12, max: 20, unit: '/min', label: 'Frecuencia respiratoria' },
  weight: { min: null, max: null, unit: 'kg', label: 'Peso' },
  height: { min: null, max: null, unit: 'cm', label: 'Altura' },
  bmi: { min: 18.5, max: 24.9, unit: '', label: 'IMC' }
}

export function VitalSignsTab({ patientId }: VitalSignsTabProps): JSX.Element {
  const [showForm, setShowForm] = useState(false)
  const { vitalSigns, loading, error, addVitalSigns, latest } = useVitalSigns(patientId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVitalSignStatus = (value: number | null, key: keyof typeof VITAL_SIGNS_RANGES): 'normal' | 'low' | 'high' | 'unknown' => {
    if (value === null) return 'unknown'

    const range = VITAL_SIGNS_RANGES[key]
    if (range.min === null || range.max === null) return 'normal'

    if (value < range.min) return 'low'
    if (value > range.max) return 'high'
    return 'normal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400'
      case 'low': return 'text-blue-400'
      case 'high': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <TrendingUp className="h-4 w-4" />
      case 'low': return <TrendingDown className="h-4 w-4" />
      case 'normal': return <Minus className="h-4 w-4" />
      default: return null
    }
  }

  const calculateBMICategory = (bmi: number | null): string => {
    if (!bmi) return 'No calculado'
    if (bmi < 18.5) return 'Bajo peso'
    if (bmi < 25) return 'Peso normal'
    if (bmi < 30) return 'Sobrepeso'
    return 'Obesidad'
  }

  if (loading && vitalSigns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mx-auto"></div>
          <p className="text-slate-400">Cargando signos vitales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Error al cargar signos vitales</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!patientId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin paciente seleccionado</h3>
          <p className="text-slate-400">Selecciona un paciente para ver sus signos vitales</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a1525]">

      {/* Header */}
      <div className="border-b border-slate-800/60 bg-[#111f36] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Signos Vitales</h1>
            <p className="text-sm text-slate-400">
              {vitalSigns.length} registro{vitalSigns.length !== 1 ? 's' : ''} •
              {latest && ` Último: ${formatDate(latest.recorded_at)}`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/40 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/60 transition">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {vitalSigns.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Activity className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin registros de signos vitales</h3>
              <p className="text-slate-400 mb-4">Este paciente aún no tiene registros de signos vitales</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition mx-auto"
              >
                <Plus className="h-4 w-4" />
                Primer Registro
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Resumen de últimos signos vitales */}
            {latest && (
              <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Últimos Signos Vitales</h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Presión arterial */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="h-5 w-5 text-red-400" />
                      <div className="flex items-center gap-1">
                        {getStatusIcon(getVitalSignStatus(latest.blood_pressure_systolic, 'blood_pressure_systolic'))}
                        {getStatusIcon(getVitalSignStatus(latest.blood_pressure_diastolic, 'blood_pressure_diastolic'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Presión Arterial</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.blood_pressure_systolic || '--'}/{latest.blood_pressure_diastolic || '--'}
                      <span className="text-sm text-slate-400 ml-1">mmHg</span>
                    </p>
                  </div>

                  {/* Frecuencia cardíaca */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      <div className={getStatusColor(getVitalSignStatus(latest.heart_rate, 'heart_rate'))}>
                        {getStatusIcon(getVitalSignStatus(latest.heart_rate, 'heart_rate'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Frecuencia Cardíaca</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.heart_rate || '--'}
                      <span className="text-sm text-slate-400 ml-1">BPM</span>
                    </p>
                  </div>

                  {/* Temperatura */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Thermometer className="h-5 w-5 text-orange-400" />
                      <div className={getStatusColor(getVitalSignStatus(latest.temperature, 'temperature'))}>
                        {getStatusIcon(getVitalSignStatus(latest.temperature, 'temperature'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Temperatura</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.temperature || '--'}
                      <span className="text-sm text-slate-400 ml-1">°C</span>
                    </p>
                  </div>

                  {/* Saturación de oxígeno */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Wind className="h-5 w-5 text-blue-400" />
                      <div className={getStatusColor(getVitalSignStatus(latest.oxygen_saturation, 'oxygen_saturation'))}>
                        {getStatusIcon(getVitalSignStatus(latest.oxygen_saturation, 'oxygen_saturation'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Saturación O2</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.oxygen_saturation || '--'}
                      <span className="text-sm text-slate-400 ml-1">%</span>
                    </p>
                  </div>

                  {/* Medidas corporales */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Scale className="h-5 w-5 text-purple-400" />
                      <div className={getStatusColor(getVitalSignStatus(latest.bmi, 'bmi'))}>
                        {getStatusIcon(getVitalSignStatus(latest.bmi, 'bmi'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Peso / IMC</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.weight || '--'}
                      <span className="text-sm text-slate-400 ml-1">kg</span>
                    </p>
                    {latest.bmi && (
                      <p className="text-xs text-slate-400">
                        IMC: {latest.bmi} ({calculateBMICategory(latest.bmi)})
                      </p>
                    )}
                  </div>

                  {/* Altura */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Ruler className="h-5 w-5 text-yellow-400" />
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Altura</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.height || '--'}
                      <span className="text-sm text-slate-400 ml-1">cm</span>
                    </p>
                  </div>

                  {/* Frecuencia respiratoria */}
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Wind className="h-5 w-5 text-cyan-400" />
                      <div className={getStatusColor(getVitalSignStatus(latest.respiratory_rate, 'respiratory_rate'))}>
                        {getStatusIcon(getVitalSignStatus(latest.respiratory_rate, 'respiratory_rate'))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Freq. Respiratoria</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {latest.respiratory_rate || '--'}
                      <span className="text-sm text-slate-400 ml-1">/min</span>
                    </p>
                  </div>
                </div>

                {latest.notes && (
                  <div className="mt-4 rounded-lg bg-slate-800/40 p-3">
                    <p className="text-xs text-slate-400 mb-1">Notas:</p>
                    <p className="text-sm text-slate-300">{latest.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Historial de registros */}
            <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Historial de Registros</h2>

              <div className="space-y-3">
                {vitalSigns.map((vitals) => (
                  <div
                    key={vitals.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">
                          {formatDate(vitals.recorded_at)}
                        </span>
                      </div>
                      <button className="rounded-lg border border-slate-600 bg-slate-800/40 p-1.5 text-slate-300 hover:bg-slate-800/60 transition">
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="text-slate-400">PA: </span>
                        <span className="text-slate-100">
                          {vitals.blood_pressure_systolic || '--'}/{vitals.blood_pressure_diastolic || '--'} mmHg
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">FC: </span>
                        <span className="text-slate-100">{vitals.heart_rate || '--'} BPM</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Temp: </span>
                        <span className="text-slate-100">{vitals.temperature || '--'} °C</span>
                      </div>
                      <div>
                        <span className="text-slate-400">SpO2: </span>
                        <span className="text-slate-100">{vitals.oxygen_saturation || '--'} %</span>
                      </div>
                    </div>

                    {vitals.notes && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60">
                        <span className="text-xs text-slate-400">Notas: </span>
                        <span className="text-xs text-slate-300">{vitals.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}