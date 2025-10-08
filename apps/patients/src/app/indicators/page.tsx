'use client'

import { TrendingUp, Activity, Heart, Droplet, ThermometerSun } from 'lucide-react'
import { CompactSidebar } from '@/components/layout/CompactSidebar'
import { DynamicRightPanel } from '@/components/layout/DynamicRightPanel'

export default function IndicatorsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CompactSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-stone-900">📊 Indicadores de Salud</h1>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-700 border-2 border-stone-300">
              BETA
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-600">
            Monitorea tus signos vitales y métricas de salud en tiempo real
          </p>
        </div>

        <div className="grid gap-4">
          {/* Gráfica principal */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Tendencias de los últimos 30 días</h2>
              <select className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30">
                <option>Últimos 30 días</option>
                <option>Últimos 7 días</option>
                <option>Últimos 90 días</option>
              </select>
            </div>

            {/* Placeholder para gráfica */}
            <div className="flex h-64 items-center justify-center rounded-lg bg-stone-50 border border-stone-200">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-3 h-12 w-12 text-stone-600" />
                <p className="text-sm text-stone-600">Gráfica de tendencias</p>
                <p className="mt-1 text-xs text-stone-600">Disponible en próxima actualización</p>
              </div>
            </div>
          </div>

          {/* Indicadores actuales */}
          <div className="grid gap-4 md:grid-cols-2">
            <VitalCard
              icon={<Heart className="h-6 w-6 text-red-400" />}
              title="Presión Arterial"
              value="120/80"
              unit="mmHg"
              status="normal"
              trend="stable"
              lastUpdate="Hace 2 horas"
            />

            <VitalCard
              icon={<Activity className="h-6 w-6 text-blue-400" />}
              title="Frecuencia Cardíaca"
              value="72"
              unit="lpm"
              status="normal"
              trend="stable"
              lastUpdate="Hace 2 horas"
            />

            <VitalCard
              icon={<Droplet className="h-6 w-6 text-purple-400" />}
              title="Oxígeno en Sangre"
              value="98"
              unit="%"
              status="normal"
              trend="up"
              lastUpdate="Hace 5 horas"
            />

            <VitalCard
              icon={<ThermometerSun className="h-6 w-6 text-orange-400" />}
              title="Temperatura"
              value="36.5"
              unit="°C"
              status="normal"
              trend="stable"
              lastUpdate="Hace 12 horas"
            />
          </div>

          {/* Botón registrar nuevo valor */}
          <button className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-stone-600 transition hover:border-amber-600 hover:bg-stone-100 hover:text-amber-600">
            <Activity className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm font-medium">Registrar Nuevos Signos Vitales</p>
          </button>
        </div>
      </main>

      <DynamicRightPanel context="dashboard" />
    </div>
  )
}

interface VitalCardProps {
  icon: React.ReactNode
  title: string
  value: string
  unit: string
  status: 'normal' | 'warning' | 'alert'
  trend: 'up' | 'down' | 'stable'
  lastUpdate: string
}

function VitalCard({ icon, title, value, unit, status, trend, lastUpdate }: VitalCardProps) {
  const statusColors = {
    normal: 'text-green-400 bg-green-500/10 ring-green-400/30',
    warning: 'text-amber-400 bg-amber-500/10 ring-amber-400/30',
    alert: 'text-red-400 bg-red-500/10 ring-red-400/30',
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-md p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-50 border border-stone-200">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{title}</h3>
            <p className="text-xs text-stone-600">{lastUpdate}</p>
          </div>
        </div>

        <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusColors[status]}`}>
          {status === 'normal' ? 'Normal' : status === 'warning' ? 'Alerta' : 'Crítico'}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-stone-900">{value}</span>
        <span className="text-lg text-stone-600">{unit}</span>
        <span className="ml-auto text-2xl text-stone-600">{trendIcons[trend]}</span>
      </div>
    </div>
  )
}
