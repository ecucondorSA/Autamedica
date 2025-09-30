/**
 * Componente de información del paciente para el portal de médicos
 */

'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Shield,
  Edit3,
  X
} from 'lucide-react'
import { usePatientData } from '../../hooks/usePatientData'

interface PatientInfoTabProps {
  patientId: string | null
}

export function PatientInfoTab({ patientId }: PatientInfoTabProps): JSX.Element {
  const { patient, loading, error, refresh } = usePatientData(patientId as any)
  const [isEditing, setIsEditing] = useState(false)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mx-auto"></div>
          <p className="text-slate-400">Cargando información del paciente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Error al cargar datos</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!patient && !patientId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Sin paciente seleccionado</h3>
          <p className="text-slate-400">Selecciona un paciente para ver su información</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Paciente no encontrado</h3>
          <p className="text-slate-400">No se pudo cargar la información del paciente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0a1525] p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header con información básica */}
        <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-slate-900">
                {(patient as any).first_name[0]}{(patient as any).last_name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">{(patient as any).full_name}</h1>
                <p className="text-slate-400">{(patient as any).age} años • {(patient as any).gender}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-emerald-400">
                  <Heart className="h-4 w-4" />
                  <span>Tipo de sangre: {(patient as any).blood_type}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-800/60 transition"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Editar
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Información de contacto */}
          <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <Phone className="h-5 w-5 text-emerald-400" />
              Información de Contacto
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Teléfono</p>
                  <p className="text-slate-400">{(patient as any).phone || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Email</p>
                  <p className="text-slate-400">{(patient as any).email || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Dirección</p>
                  <p className="text-slate-400">{(patient as any).address || 'No registrada'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Contacto de Emergencia
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300">Nombre</p>
                <p className="text-slate-400">{(patient as any).emergency_contact_name || 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300">Teléfono</p>
                <p className="text-slate-400">{(patient as any).emergency_contact_phone || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Información médica */}
          <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <Heart className="h-5 w-5 text-red-400" />
              Información Médica
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Alergias</p>
                {(patient as any).allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).allergies.map((allergy: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 border border-red-500/30"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">Sin alergias conocidas</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Condiciones Crónicas</p>
                {(patient as any).chronic_conditions?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).chronic_conditions.map((condition: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300 border border-yellow-500/30"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">Sin condiciones crónicas</p>
                )}
              </div>
            </div>
          </div>

          {/* Información del seguro */}
          <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <Shield className="h-5 w-5 text-blue-400" />
              Información del Seguro
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300">Proveedor</p>
                <p className="text-slate-400">{(patient as any).insurance_provider || 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300">Número de póliza</p>
                <p className="text-slate-400 font-mono">
                  {(patient as any).insurance_number || 'No registrado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="rounded-lg border border-slate-800/60 bg-[#111f36] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Información del Registro
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-300">Fecha de nacimiento</p>
              <p className="text-slate-400">
                {new Date((patient as any).date_of_birth).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300">Registrado</p>
              <p className="text-slate-400">
                {new Date((patient as any).created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}