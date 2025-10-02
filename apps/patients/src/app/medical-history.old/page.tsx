'use client'

import { useState } from 'react'
import {
  Activity,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  Eye,
  TrendingUp,
  Calendar,
  User,
  Download,
  Lock,
  Shield,
  Clock
} from 'lucide-react'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'

type MedicalSection = 'vitals' | 'allergies' | 'medications' | 'conditions' | 'surgeries' | 'family' | 'privacy'

export default function MedicalHistoryPage() {
  const [activeSection, setActiveSection] = useState<MedicalSection>('vitals')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CollapsibleSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">📋 Historia Clínica</h1>
          <p className="mt-2 text-sm text-stone-600">
            Registro completo de tu información médica
          </p>
        </div>

        {/* Secciones */}
        <div className="mb-6 flex flex-wrap gap-2">
          <SectionTab
            active={activeSection === 'vitals'}
            onClick={() => setActiveSection('vitals')}
            icon={<Activity className="h-4 w-4" />}
            label="Signos Vitales"
          />
          <SectionTab
            active={activeSection === 'allergies'}
            onClick={() => setActiveSection('allergies')}
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Alergias"
          />
          <SectionTab
            active={activeSection === 'medications'}
            onClick={() => setActiveSection('medications')}
            icon={<Pill className="h-4 w-4" />}
            label="Medicamentos"
          />
          <SectionTab
            active={activeSection === 'conditions'}
            onClick={() => setActiveSection('conditions')}
            icon={<Heart className="h-4 w-4" />}
            label="Condiciones"
          />
          <SectionTab
            active={activeSection === 'surgeries'}
            onClick={() => setActiveSection('surgeries')}
            icon={<FileText className="h-4 w-4" />}
            label="Cirugías"
          />
          <SectionTab
            active={activeSection === 'family'}
            onClick={() => setActiveSection('family')}
            icon={<User className="h-4 w-4" />}
            label="Antecedentes"
          />
          <SectionTab
            active={activeSection === 'privacy'}
            onClick={() => setActiveSection('privacy')}
            icon={<Eye className="h-4 w-4" />}
            label="Visibilidad"
          />
        </div>

        {/* Contenido según sección */}
        <div className="flex-1">
          {activeSection === 'vitals' && <VitalSignsSection />}
          {activeSection === 'allergies' && <AllergiesSection />}
          {activeSection === 'medications' && <MedicationsSection />}
          {activeSection === 'conditions' && <ConditionsSection />}
          {activeSection === 'surgeries' && <SurgeriesSection />}
          {activeSection === 'family' && <FamilyHistorySection />}
          {activeSection === 'privacy' && <PrivacySection />}
        </div>
      </main>

      <CollapsibleRightPanel context="history" />
    </div>
  )
}

interface SectionTabProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function SectionTab({ active, onClick, icon, label }: SectionTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-stone-800 text-white shadow-md'
          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function VitalSignsSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">🩺 Signos Vitales Recientes</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            <TrendingUp className="h-4 w-4" />
            Ver tendencias
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <VitalSignCard
            icon={<Heart className="h-6 w-6 text-red-400" />}
            label="Presión Arterial"
            value="120/80"
            unit="mmHg"
            status="Normal"
            statusColor="text-green-600"
            lastMeasured="Hace 2 horas"
          />
          <VitalSignCard
            icon={<Activity className="h-6 w-6 text-blue-400" />}
            label="Frecuencia Cardíaca"
            value="72"
            unit="lpm"
            status="Normal"
            statusColor="text-green-600"
            lastMeasured="Hace 2 horas"
          />
          <VitalSignCard
            icon={<Activity className="h-6 w-6 text-orange-400" />}
            label="Temperatura"
            value="36.5"
            unit="°C"
            status="Normal"
            statusColor="text-green-600"
            lastMeasured="Ayer"
          />
          <VitalSignCard
            icon={<Activity className="h-6 w-6 text-purple-400" />}
            label="Saturación O2"
            value="98"
            unit="%"
            status="Normal"
            statusColor="text-green-600"
            lastMeasured="Hace 3 horas"
          />
        </div>

        <div className="mt-6 rounded-lg bg-stone-50 border border-stone-200 p-4">
          <p className="text-sm text-stone-700">
            <TrendingUp className="mr-2 inline-block h-4 w-4 text-green-600" />
            Tus signos vitales han estado <span className="font-semibold text-green-600">estables</span> en los últimos 30 días
          </p>
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">📊 Historial (últimos 7 días)</h3>
        <div className="space-y-3">
          <HistoryItem date="Hoy 10:30 AM" type="Presión Arterial" value="120/80 mmHg" />
          <HistoryItem date="Ayer 9:15 AM" type="Presión Arterial" value="118/78 mmHg" />
          <HistoryItem date="15 Ene 8:00 AM" type="Presión Arterial" value="122/82 mmHg" />
        </div>
      </div>
    </div>
  )
}

function AllergiesSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">⚠️ Alergias Registradas</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            + Agregar alergia
          </button>
        </div>

        <div className="space-y-3">
          <AllergyCard
            name="Penicilina"
            type="Medicamentosa"
            severity="Severa"
            reaction="Anafilaxia"
            date="Diagnosticada en 2015"
          />
          <AllergyCard
            name="Polen"
            type="Ambiental"
            severity="Moderada"
            reaction="Rinitis alérgica"
            date="Diagnosticada en 2018"
          />
        </div>

        <div className="mt-6 rounded-lg bg-red-50 border-2 border-red-300 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Importante</p>
              <p className="mt-1 text-sm text-red-800">
                Esta información es visible para todos los médicos que te atiendan. Es crítica para tu seguridad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MedicationsSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">💊 Medicamentos Activos</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            Ver histórico
          </button>
        </div>

        <div className="space-y-3">
          <MedicationCard
            name="Lisinopril"
            dosage="10mg"
            frequency="1 vez al día"
            time="8:00 AM"
            prescriber="Dr. García"
            prescribedDate="15 Dic 2024"
            adherence={95}
          />
          <MedicationCard
            name="Metformina"
            dosage="500mg"
            frequency="2 veces al día"
            time="8:00 AM y 8:00 PM"
            prescriber="Dra. Martínez"
            prescribedDate="10 Nov 2024"
            adherence={88}
          />
          <MedicationCard
            name="Aspirina"
            dosage="100mg"
            frequency="1 vez al día"
            time="8:00 PM"
            prescriber="Dr. García"
            prescribedDate="20 Oct 2024"
            adherence={92}
          />
        </div>
      </div>

      {/* Adherencia */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">📈 Adherencia General</h3>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-stone-600">Última semana</span>
          <span className="text-2xl font-bold text-green-600">92%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full w-[92%] bg-green-500" />
        </div>
        <p className="mt-3 text-sm text-stone-600">
          ¡Excelente trabajo! Has tomado tus medicamentos a tiempo 92% de las veces esta semana.
        </p>
      </div>
    </div>
  )
}

function ConditionsSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">🏥 Condiciones Crónicas</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            + Agregar condición
          </button>
        </div>

        <div className="space-y-3">
          <ConditionCard
            name="Hipertensión Arterial"
            status="Controlada"
            statusColor="text-green-600"
            diagnosedDate="Enero 2020"
            treatment="Lisinopril 10mg diario"
          />
          <ConditionCard
            name="Diabetes Tipo 2"
            status="En tratamiento"
            statusColor="text-amber-600"
            diagnosedDate="Junio 2021"
            treatment="Metformina 500mg 2x/día + Dieta"
          />
        </div>
      </div>
    </div>
  )
}

function SurgeriesSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">🔪 Cirugías Previas</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            + Agregar cirugía
          </button>
        </div>

        <div className="space-y-3">
          <SurgeryCard
            procedure="Apendicectomía"
            date="15 Marzo 2018"
            surgeon="Dr. Rodríguez"
            hospital="Hospital Central"
            complications="Ninguna"
          />
        </div>
      </div>
    </div>
  )
}

function FamilyHistorySection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">👨‍👩‍👧 Antecedentes Familiares</h2>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            + Agregar antecedente
          </button>
        </div>

        <div className="space-y-3">
          <FamilyHistoryCard
            relation="Padre"
            condition="Hipertensión"
            ageOfDiagnosis="45 años"
          />
          <FamilyHistoryCard
            relation="Madre"
            condition="Diabetes Tipo 2"
            ageOfDiagnosis="52 años"
          />
          <FamilyHistoryCard
            relation="Hermano"
            condition="Asma"
            ageOfDiagnosis="12 años"
          />
        </div>
      </div>
    </div>
  )
}

function PrivacySection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">👁️ Visibilidad de tu Historial</h2>
          <button className="flex items-center gap-2 rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-600">
            <Download className="h-4 w-4" />
            Descargar log completo
          </button>
        </div>

        {/* Resumen */}
        <div className="mb-6 rounded-lg bg-stone-50 border border-stone-200 p-4">
          <p className="text-sm text-stone-700">
            <Shield className="mr-2 inline-block h-4 w-4 text-stone-600" />
            Total de accesos: <span className="font-semibold">28 veces</span> en los últimos 30 días
          </p>
        </div>

        {/* Equipo médico */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-stone-900">👨‍⚕️ Equipo Médico (22 accesos)</h3>
          <div className="space-y-3">
            <AccessCard
              name="Dr. García"
              specialty="Cardiología"
              accessCount={12}
              lastAccess="Ayer 10:30 AM"
              sections={['Signos vitales', 'Medicamentos', 'Laboratorios']}
            />
            <AccessCard
              name="Dra. Martínez"
              specialty="Medicina General"
              accessCount={8}
              lastAccess="15 Ene 2:00 PM"
              sections={['Historia completa']}
            />
          </div>
        </div>

        {/* Empresas */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-stone-900">
            🏢 Empresas (4 accesos) <span className="text-sm text-green-600">✅ Consentimiento otorgado</span>
          </h3>
          <div className="space-y-3">
            <CompanyAccessCard
              company="TechCorp - RRHH"
              accessCount={2}
              lastAccess="10 Ene 9:00 AM"
              allowedSections={['Chequeos preventivos', 'Vacunas']}
              restrictedSections={['Historia clínica', 'Medicamentos']}
            />
          </div>
        </div>

        {/* Familiares */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-stone-900">
            👨‍👩‍👧 Familiares (2 accesos) <span className="text-sm text-green-600">✅ Autorizados</span>
          </h3>
          <div className="space-y-3">
            <FamilyAccessCard
              name="Juan Torres"
              relation="Esposo"
              accessCount={2}
              lastAccess="Ayer 8:00 PM"
              permissions="Solo emergencias"
            />
          </div>
        </div>

        {/* Botón gestión */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500">
            <Lock className="mr-2 inline-block h-4 w-4" />
            Gestionar permisos
          </button>
          <button className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
            + Dar acceso
          </button>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares
function VitalSignCard({ icon, label, value, unit, status, statusColor, lastMeasured }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-stone-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">
            {value} <span className="text-base font-normal text-stone-600">{unit}</span>
          </p>
          {status && <p className={`mt-1 text-sm font-medium ${statusColor}`}>{status}</p>}
          <p className="mt-2 flex items-center gap-1 text-xs text-stone-500">
            <Clock className="h-3 w-3" />
            {lastMeasured}
          </p>
        </div>
      </div>
    </div>
  )
}

function HistoryItem({ date, type, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 p-3">
      <div>
        <p className="text-sm font-medium text-stone-900">{type}</p>
        <p className="text-xs text-stone-600">{date}</p>
      </div>
      <p className="text-sm font-semibold text-stone-900">{value}</p>
    </div>
  )
}

function AllergyCard({ name, type, severity, reaction, date }: any) {
  const severityColor =
    severity === 'Severa' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'
  const textColor = severity === 'Severa' ? 'text-red-900' : 'text-amber-900'

  return (
    <div className={`rounded-lg border-2 p-4 ${severityColor}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${textColor}`} />
        <div className="flex-1">
          <p className={`font-semibold ${textColor}`}>{name}</p>
          <p className="mt-1 text-sm text-stone-700">
            {type} • {severity}
          </p>
          <p className="mt-1 text-sm text-stone-600">Reacción: {reaction}</p>
          <p className="mt-2 text-xs text-stone-500">{date}</p>
        </div>
      </div>
    </div>
  )
}

function MedicationCard({ name, dosage, frequency, time, prescriber, prescribedDate, adherence }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{name}</p>
          <p className="mt-1 text-sm text-stone-700">
            {dosage} • {frequency}
          </p>
          <p className="mt-1 text-sm text-stone-600">Horario: {time}</p>
          <p className="mt-2 text-xs text-stone-500">
            Prescrito por {prescriber} • {prescribedDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{adherence}%</p>
          <p className="text-xs text-stone-600">Adherencia</p>
        </div>
      </div>
    </div>
  )
}

function ConditionCard({ name, status, statusColor, diagnosedDate, treatment }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{name}</p>
          <p className={`mt-1 text-sm font-medium ${statusColor}`}>{status}</p>
          <p className="mt-2 text-sm text-stone-700">Tratamiento: {treatment}</p>
          <p className="mt-2 text-xs text-stone-500">Diagnosticada: {diagnosedDate}</p>
        </div>
      </div>
    </div>
  )
}

function SurgeryCard({ procedure, date, surgeon, hospital, complications }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <p className="font-semibold text-stone-900">{procedure}</p>
      <p className="mt-1 text-sm text-stone-700">
        <Calendar className="mr-1 inline-block h-3 w-3" />
        {date}
      </p>
      <p className="mt-1 text-sm text-stone-600">Cirujano: {surgeon}</p>
      <p className="mt-1 text-sm text-stone-600">Hospital: {hospital}</p>
      <p className="mt-2 text-xs text-stone-500">
        Complicaciones: {complications === 'Ninguna' ? '✅ Ninguna' : complications}
      </p>
    </div>
  )
}

function FamilyHistoryCard({ relation, condition, ageOfDiagnosis }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-stone-900">{relation}</p>
          <p className="mt-1 text-sm text-stone-700">{condition}</p>
        </div>
        <p className="text-sm text-stone-600">Dx: {ageOfDiagnosis}</p>
      </div>
    </div>
  )
}

function AccessCard({ name, specialty, accessCount, lastAccess, sections }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{name}</p>
          <p className="text-sm text-stone-600">{specialty}</p>
          <p className="mt-2 text-xs text-stone-500">
            <Eye className="mr-1 inline-block h-3 w-3" />
            {accessCount} veces • Última: {lastAccess}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {sections.map((section: string, i: number) => (
              <span key={i} className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-700">
                {section}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanyAccessCard({ company, accessCount, lastAccess, allowedSections, restrictedSections }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{company}</p>
          <p className="mt-2 text-xs text-stone-500">
            <Eye className="mr-1 inline-block h-3 w-3" />
            {accessCount} veces • Última: {lastAccess}
          </p>
          <div className="mt-3">
            <p className="text-xs font-medium text-green-600">✅ Secciones permitidas:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {allowedSections.map((section: string, i: number) => (
                <span key={i} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  {section}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs font-medium text-red-600">❌ Secciones restringidas:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {restrictedSections.map((section: string, i: number) => (
                <span key={i} className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  {section}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500">
            Modificar
          </button>
          <button className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
            Revocar
          </button>
        </div>
      </div>
    </div>
  )
}

function FamilyAccessCard({ name, relation, accessCount, lastAccess, permissions }: any) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{name}</p>
          <p className="text-sm text-stone-600">{relation}</p>
          <p className="mt-2 text-xs text-stone-500">
            <Eye className="mr-1 inline-block h-3 w-3" />
            {accessCount} veces • Última: {lastAccess}
          </p>
          <p className="mt-2 text-xs text-stone-700">Permisos: {permissions}</p>
        </div>
        <button className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
          Revocar
        </button>
      </div>
    </div>
  )
}
