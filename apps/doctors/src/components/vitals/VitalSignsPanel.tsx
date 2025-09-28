"use client"

import type { JSX } from 'react'
import { Activity, Heart, Thermometer, Wind, TrendingUp, Plus, Calendar } from 'lucide-react'
// TODO: Fix import - hook doesn't exist yet
// import { useVitalSigns } from '@/hooks'

export function VitalSignsPanel(): JSX.Element {
  // Por ahora usar patientId de ejemplo (María González)
  const patientId = '550e8400-e29b-41d4-a716-446655440000'
  // TODO: Replace with actual hook
  const { vitals, loading, error } = { vitals: [], loading: false, error: null } as any

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando signos vitales...</p>
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

  const latestVitals = vitals.length > 0 ? vitals[0] : null

  const getVitalStatus = (value: number, normal: { min: number; max: number }) => {
    if (value < normal.min) return { status: 'low', color: 'text-blue-400' }
    if (value > normal.max) return { status: 'high', color: 'text-red-400' }
    return { status: 'normal', color: 'text-green-400' }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-500/20 p-2">
            <Activity className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Signos Vitales</h1>
            <p className="text-slate-400">
              {vitals.length} registro{vitals.length !== 1 ? 's' : ''} de signos vitales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600 hover:text-slate-100"
          >
            <TrendingUp className="h-4 w-4" />
            Ver Tendencias
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Registrar Vitales
          </button>
        </div>
      </div>

      {/* Latest Vitals Overview */}
      {latestVitals && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Blood Pressure */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <Heart className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Presión Arterial</p>
                <p className="text-lg font-semibold text-slate-100">
                  {latestVitals.systolic_bp}/{latestVitals.diastolic_bp}
                  <span className="text-sm text-slate-400 ml-1">mmHg</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                getVitalStatus(latestVitals.systolic_bp, { min: 90, max: 140 }).status === 'normal'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`} />
              <span className="text-xs text-slate-500">
                Normal: 90-140 / 60-90 mmHg
              </span>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-pink-500/20 p-2">
                <Activity className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Frecuencia Cardíaca</p>
                <p className="text-lg font-semibold text-slate-100">
                  {latestVitals.heart_rate}
                  <span className="text-sm text-slate-400 ml-1">lpm</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                getVitalStatus(latestVitals.heart_rate, { min: 60, max: 100 }).status === 'normal'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`} />
              <span className="text-xs text-slate-500">
                Normal: 60-100 lpm
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-orange-500/20 p-2">
                <Thermometer className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Temperatura</p>
                <p className="text-lg font-semibold text-slate-100">
                  {latestVitals.temperature}
                  <span className="text-sm text-slate-400 ml-1">°C</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                getVitalStatus(latestVitals.temperature, { min: 36.1, max: 37.2 }).status === 'normal'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`} />
              <span className="text-xs text-slate-500">
                Normal: 36.1-37.2 °C
              </span>
            </div>
          </div>

          {/* Oxygen Saturation */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Wind className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Saturación O2</p>
                <p className="text-lg font-semibold text-slate-100">
                  {latestVitals.oxygen_saturation}
                  <span className="text-sm text-slate-400 ml-1">%</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                getVitalStatus(latestVitals.oxygen_saturation, { min: 95, max: 100 }).status === 'normal'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`} />
              <span className="text-xs text-slate-500">
                Normal: 95-100%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Vitals History */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Historial de Signos Vitales</h2>
          <span className="text-sm text-slate-400">Paciente: María González</span>
        </div>

        {vitals.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No hay registros de signos vitales</h3>
              <p className="text-slate-500 mb-4">Registra los primeros signos vitales del paciente</p>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Registrar Signos Vitales
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid gap-4">
              {vitals.map((vital: any) => (
                <div
                  key={vital.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">
                          Registro de Signos Vitales
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(vital.recorded_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="text-xs text-slate-400">Presión Arterial</p>
                        <p className="text-sm font-semibold text-slate-100">
                          {vital.systolic_bp}/{vital.diastolic_bp} mmHg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-pink-400" />
                      <div>
                        <p className="text-xs text-slate-400">Frecuencia Cardíaca</p>
                        <p className="text-sm font-semibold text-slate-100">
                          {vital.heart_rate} lpm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Thermometer className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-400">Temperatura</p>
                        <p className="text-sm font-semibold text-slate-100">
                          {vital.temperature} °C
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Wind className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">Saturación O2</p>
                        <p className="text-sm font-semibold text-slate-100">
                          {vital.oxygen_saturation}%
                        </p>
                      </div>
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