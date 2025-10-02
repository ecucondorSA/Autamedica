'use client'

import {
  CreditCard,
  Shield,
  QrCode,
  Phone,
  AlertTriangle,
  Pill,
  Droplet,
  Heart,
  Download,
  Share2
} from 'lucide-react'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'

export default function WalletPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CollapsibleSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">💳 Wallet Médico Digital</h1>
          <p className="mt-2 text-sm text-stone-600">
            Tu información médica esencial para emergencias
          </p>
        </div>

        {/* Alert de emergencia */}
        <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 shadow-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Información de Emergencia</p>
              <p className="mt-1 text-sm text-red-800">
                Esta información puede salvar tu vida. Mantén actualizado este wallet y compártelo con emergencias médicas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Grupo sanguíneo */}
          <div className="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Droplet className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-600">Grupo Sanguíneo</p>
                  <p className="text-2xl font-bold text-stone-900">A+</p>
                </div>
              </div>
            </div>

            {/* QR Code placeholder */}
            <div className="flex items-center justify-center rounded-lg bg-stone-50 border-2 border-stone-200 p-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-lg bg-white border-2 border-stone-800">
                  <QrCode className="h-16 w-16 text-stone-800" />
                </div>
                <p className="text-xs text-stone-600">Escanear en emergencias</p>
                <p className="mt-1 text-xs font-semibold text-stone-800">ID: MED-0001234</p>
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-600">
              <Share2 className="mr-2 inline-block h-4 w-4" />
              Compartir con paramédicos
            </button>
          </div>

          {/* Alergias críticas */}
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700">Alergias Críticas</p>
                <p className="text-lg font-bold text-red-900">¡IMPORTANTE!</p>
              </div>
            </div>

            <div className="space-y-3">
              <AllergyCard name="Penicilina" reaction="Anafilaxia" severity="SEVERA" />
              <AllergyCard name="Polen" reaction="Rinitis" severity="MODERADA" />
            </div>

            {/* QR Code placeholder */}
            <div className="mt-4 flex items-center justify-center rounded-lg bg-white border-2 border-red-300 p-6">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-lg bg-red-50 border-2 border-red-600">
                  <QrCode className="h-12 w-12 text-red-600" />
                </div>
                <p className="text-xs font-semibold text-red-900">QR Alergias</p>
              </div>
            </div>
          </div>

          {/* Medicamentos activos */}
          <div className="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Medicamentos Activos</p>
                <p className="text-lg font-bold text-stone-900">3 medicamentos</p>
              </div>
            </div>

            <div className="space-y-2">
              <MedicationItem name="Lisinopril 10mg" schedule="8:00 AM" />
              <MedicationItem name="Metformina 500mg" schedule="8 AM / 8 PM" />
              <MedicationItem name="Aspirina 100mg" schedule="8:00 PM" />
            </div>

            <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Download className="mr-2 inline-block h-4 w-4" />
              Descargar lista completa
            </button>
          </div>

          {/* Condiciones crónicas */}
          <div className="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Condiciones Crónicas</p>
                <p className="text-lg font-bold text-stone-900">En tratamiento</p>
              </div>
            </div>

            <div className="space-y-2">
              <ConditionItem name="Hipertensión Arterial" status="Controlada" />
              <ConditionItem name="Diabetes Tipo 2" status="En tratamiento" />
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-900">
                <Shield className="mr-1 inline-block h-3 w-3" />
                Esta información es visible para profesionales de salud autorizados
              </p>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6 shadow-lg lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Contacto de Emergencia</p>
                <p className="text-lg font-bold text-green-900">Juan Torres - Esposo</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white border border-green-200 p-4">
                <p className="text-xs text-green-700">Teléfono Principal</p>
                <p className="mt-1 text-lg font-semibold text-green-900">+54 11 1234-5678</p>
                <a
                  href="tel:+541112345678"
                  className="mt-2 inline-block rounded bg-green-600 px-4 py-1 text-xs font-semibold text-white hover:bg-green-500"
                >
                  <Phone className="mr-1 inline-block h-3 w-3" />
                  Llamar ahora
                </a>
              </div>

              <div className="rounded-lg bg-white border border-green-200 p-4">
                <p className="text-xs text-green-700">Teléfono Alternativo</p>
                <p className="mt-1 text-lg font-semibold text-green-900">+54 11 8765-4321</p>
                <a
                  href="tel:+541187654321"
                  className="mt-2 inline-block rounded bg-green-600 px-4 py-1 text-xs font-semibold text-white hover:bg-green-500"
                >
                  <Phone className="mr-1 inline-block h-3 w-3" />
                  Llamar ahora
                </a>
              </div>
            </div>
          </div>

          {/* Carnet de vacunación */}
          <div className="rounded-2xl border-2 border-stone-300 bg-white p-6 shadow-lg lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-600">Carnet de Vacunación</p>
                  <p className="text-lg font-bold text-stone-900">Actualizado</p>
                </div>
              </div>
              <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500">
                <QrCode className="mr-2 inline-block h-4 w-4" />
                Ver QR
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <VaccineCard name="COVID-19" doses="5 dosis" lastDate="15 Oct 2023" status="complete" />
              <VaccineCard name="Gripe" doses="Anual" lastDate="20 Mar 2024" status="complete" />
              <VaccineCard name="Hepatitis B" doses="3 dosis" lastDate="10 Ene 2020" status="complete" />
              <VaccineCard name="Neumococo" doses="Pendiente" lastDate="-" status="pending" />
            </div>
          </div>
        </div>

        {/* Acciones globales */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500">
            <Download className="h-4 w-4" />
            Descargar wallet completo (PDF)
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
            <Share2 className="h-4 w-4" />
            Compartir en emergencia
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
            <QrCode className="h-4 w-4" />
            Mostrar todos los QR
          </button>
        </div>
      </main>

      <CollapsibleRightPanel context="dashboard" />
    </div>
  )
}

interface AllergyCardProps {
  name: string
  reaction: string
  severity: string
}

function AllergyCard({ name, reaction, severity }: AllergyCardProps) {
  return (
    <div className="rounded-lg bg-white border-2 border-red-400 p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-red-900">{name}</p>
          <p className="text-xs text-red-700">Reacción: {reaction}</p>
        </div>
        <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">{severity}</span>
      </div>
    </div>
  )
}

interface MedicationItemProps {
  name: string
  schedule: string
}

function MedicationItem({ name, schedule }: MedicationItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 p-3">
      <p className="text-sm font-medium text-stone-900">{name}</p>
      <p className="text-xs text-stone-600">{schedule}</p>
    </div>
  )
}

interface ConditionItemProps {
  name: string
  status: string
}

function ConditionItem({ name, status }: ConditionItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 p-3">
      <p className="text-sm font-medium text-stone-900">{name}</p>
      <span className="text-xs font-medium text-green-600">{status}</span>
    </div>
  )
}

interface VaccineCardProps {
  name: string
  doses: string
  lastDate: string
  status: 'complete' | 'pending'
}

function VaccineCard({ name, doses, lastDate, status }: VaccineCardProps) {
  const statusConfig = {
    complete: { bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
    pending: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⏳' }
  }

  const config = statusConfig[status]

  return (
    <div className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
      <p className="font-semibold text-stone-900">{name}</p>
      <p className="mt-1 text-xs text-stone-600">{doses}</p>
      <p className="mt-1 text-xs text-stone-500">
        {status === 'complete' ? `Última: ${lastDate}` : 'Pendiente'}
      </p>
      <p className="mt-2 text-lg">{config.icon}</p>
    </div>
  )
}
