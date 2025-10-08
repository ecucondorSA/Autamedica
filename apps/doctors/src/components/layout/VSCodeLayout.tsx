'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser'
import { useCurrentDoctor } from '@/hooks/useRealDoctors'
import { useDoctorStats } from '@/hooks/useDoctorStats'

interface VSCodeLayoutProps {
  children?: ReactNode
}

export default function VSCodeLayout({ children }: VSCodeLayoutProps) {
  const [currentTime, setCurrentTime] = useState<string>('')

  // Production-ready hooks for real data
  const { user, loading: authLoading } = useAuthenticatedUser()
  const { doctor, loading: doctorLoading } = useCurrentDoctor(user?.id)
  const { stats, loading: statsLoading } = useDoctorStats(doctor?.id)

  // Real userName from authenticated user or doctor profile
  const userName = doctor?.profile?.full_name ||
                   user?.profile?.full_name ||
                   `Dr. ${user?.email?.split('@')[0] || 'Médico'}`

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      )
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* VSCode-style title bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 text-gray-200 text-sm">
            {authLoading ? (
              'Cargando...'
            ) : (
              `AutaMedica Doctor Portal - ${userName}`
            )}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-green-400 text-sm">●</span>
          <span className="text-gray-400 text-sm">Conectado</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase tracking-wider">
            Portal Médico
          </h3>
          {/* Sidebar content would go here */}
          <div className="space-y-2">
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">📹 Videollamada</span>
            </div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">📋 Historial Médico</span>
            </div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span className="text-gray-300 text-sm">💊 Prescripciones</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-gray-900">
          {children}
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-blue-600 px-4 py-1 flex items-center justify-between text-xs text-white">
        <div className="flex items-center space-x-4">
          <span>🏥 AutaMedica</span>
          <span>●</span>
          <span>
            {statsLoading ? (
              'Cargando...'
            ) : stats?.activeCount ? (
              `Consultas activas: ${stats.activeCount}/${stats.todayCount}`
            ) : (
              'Sin consultas activas'
            )}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>● API Online</span>
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  )
}
