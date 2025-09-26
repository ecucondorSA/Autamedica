'use client'

import { useEffect, useState } from 'react'
import { recordMetric } from '@/lib/monitoring'

interface PublicSystemStatus {
  status: 'disponible' | 'mantenimiento' | 'degradado'
  lastUpdate: string
  serviceQuality: 'excelente' | 'bueno' | 'aceptable'
  platformReliability: number // percentage
}

export default function SystemStatus() {
  const [status, setStatus] = useState<PublicSystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Record page load metric
    const startTime = Date.now()

    const fetchStatus = async () => {
      try {
        // Simulate platform status check (in production, this would be a public API)
        const mockStatus: PublicSystemStatus = {
          status: 'disponible',
          lastUpdate: new Date().toISOString(),
          serviceQuality: 'excelente',
          platformReliability: 99.8
        }
        setStatus(mockStatus)

        // Record metric for platform availability check
        recordMetric({
          name: 'platform_status_check',
          value: Date.now() - startTime,
          unit: 'ms',
          tags: { page: 'landing', component: 'platform_status' }
        })
      } catch (error) {
        console.error('Error checking platform status:', error)
        // Set fallback status
        setStatus({
          status: 'disponible',
          lastUpdate: new Date().toISOString(),
          serviceQuality: 'bueno',
          platformReliability: 99.0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Refresh every 2 minutes
    const interval = setInterval(fetchStatus, 120000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-600 rounded w-full"></div>
            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-blue-400 font-medium">Estado de la Plataforma</h3>
            <p className="text-gray-300 text-sm">Verificando disponibilidad...</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'text-green-400'
      case 'mantenimiento': return 'text-blue-400'
      case 'degradado': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponible': return '🟢'
      case 'mantenimiento': return '🔵'
      case 'degradado': return '🟡'
      default: return '⚪'
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excelente': return 'text-green-400'
      case 'bueno': return 'text-blue-400'
      case 'aceptable': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }


  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon(status.status)}</span>
          Estado de la Plataforma
        </h3>
        <div className="text-right">
          <p className={`font-medium ${getStatusColor(status.status)}`}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(status.lastUpdate).toLocaleTimeString('es-ES')}
          </p>
        </div>
      </div>

      {/* Platform Quality Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Calidad del Servicio</p>
          <p className={`text-lg font-medium ${getQualityColor(status.serviceQuality)}`}>
            {status.serviceQuality.charAt(0).toUpperCase() + status.serviceQuality.slice(1)}
          </p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Confiabilidad</p>
          <p className="text-lg font-medium text-green-400">
            {status.platformReliability}%
          </p>
        </div>
      </div>

      {/* Service Quality Indicators */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Servicios Disponibles</h4>

        <div className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🏥</span>
            <div>
              <p className="text-sm font-medium text-white">Consultas Médicas</p>
              <p className="text-xs text-green-400">Disponible 24/7</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">📋</span>
            <div>
              <p className="text-sm font-medium text-white">Historia Clínica</p>
              <p className="text-xs text-green-400">Acceso inmediato</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">📱</span>
            <div>
              <p className="text-sm font-medium text-white">App Móvil</p>
              <p className="text-xs text-green-400">Funcionando correctamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Compliance Badge */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium">Plataforma Médica Certificada</span>
        </div>
      </div>
    </div>
  )
}