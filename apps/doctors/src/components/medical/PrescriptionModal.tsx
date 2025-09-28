"use client"

import { useState } from 'react'
import type { JSX } from 'react'
import { X, Save, Clock, Pill, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore'

interface PrescriptionModalProps {
  patientName: string
  patientId: string
  onClose: () => void
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

const FREQUENCY_OPTIONS = [
  'Cada 4 horas',
  'Cada 6 horas',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  'Antes de las comidas',
  'Después de las comidas',
  'Al acostarse'
]

const DURATION_OPTIONS = [
  '3 días',
  '5 días',
  '7 días',
  '10 días',
  '14 días',
  '21 días',
  '30 días',
  'Hasta nueva orden'
]

const COMMON_MEDICATIONS = [
  { name: 'Ibuprofeno', dosage: '400mg' },
  { name: 'Paracetamol', dosage: '500mg' },
  { name: 'Amoxicilina', dosage: '500mg' },
  { name: 'Omeprazol', dosage: '20mg' },
  { name: 'Loratadina', dosage: '10mg' },
  { name: 'Metformina', dosage: '850mg' }
]

export function PrescriptionModal({ patientName, patientId, onClose }: PrescriptionModalProps): JSX.Element {
  const { addEntry, suggestPrescriptions } = useMedicalHistoryStore()
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      frequency: 'Cada 8 horas',
      duration: '7 días',
      instructions: ''
    }
  ])
  const [diagnosis, setDiagnosis] = useState('')
  const [generalInstructions, setGeneralInstructions] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const addMedication = () => {
    setMedications(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      frequency: 'Cada 8 horas',
      duration: '7 días',
      instructions: ''
    }])
  }

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id))
  }

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(prev => prev.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ))
  }

  const handleQuickMedication = (medication: typeof COMMON_MEDICATIONS[0], medId: string) => {
    updateMedication(medId, 'name', medication.name)
    updateMedication(medId, 'dosage', medication.dosage)
  }

  const handleGetSuggestions = async () => {
    if (!diagnosis) return

    setShowSuggestions(true)
    const suggestions = await suggestPrescriptions(diagnosis)
    setAiSuggestions(suggestions)
  }

  const handleSave = async () => {
    const prescriptionText = medications
      .filter(med => med.name)
      .map(med => `
${med.name} ${med.dosage}
Frecuencia: ${med.frequency}
Duración: ${med.duration}
${med.instructions ? `Instrucciones: ${med.instructions}` : ''}
      `.trim())
      .join('\n\n')

    const fullPrescription = `
PRESCRIPCIÓN MÉDICA - ${new Date().toLocaleDateString('es-ES')}

DIAGNÓSTICO: ${diagnosis || 'No especificado'}

MEDICAMENTOS:
${prescriptionText}

${generalInstructions ? `INSTRUCCIONES GENERALES:\n${generalInstructions}` : ''}

Dr. [Nombre del médico]
[Matrícula profesional]
    `.trim()

    await addEntry({
      type: 'prescription',
      content: fullPrescription,
      doctorId: 'current-doctor',
      patientId,
      metadata: {
        medication: medications[0]?.name,
        dosage: medications[0]?.dosage,
        frequency: medications[0]?.frequency,
        duration: medications[0]?.duration
      }
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800/80 bg-[#0f1f35] shadow-2xl">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/60 bg-[#0f1f35] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Pill className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Prescripción Médica</h2>
              <p className="text-xs text-slate-400">Paciente: {patientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Diagnóstico */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Diagnóstico</label>
            <div className="flex gap-2">
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Ingrese el diagnóstico del paciente"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={handleGetSuggestions}
                className="rounded-lg bg-emerald-600/20 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-600/30"
              >
                Sugerir con IA
              </button>
            </div>
          </div>

          {/* Sugerencias IA */}
          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs font-medium text-emerald-200 mb-2">Sugerencias de IA:</p>
              <div className="space-y-1">
                {aiSuggestions.map((suggestion, idx) => (
                  <p key={idx} className="text-xs text-emerald-100">• {suggestion}</p>
                ))}
              </div>
            </div>
          )}

          {/* Medicamentos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Medicamentos</label>
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center gap-1 rounded-lg bg-blue-600/20 px-2 py-1 text-xs font-medium text-blue-200 transition hover:bg-blue-600/30"
              >
                <Plus className="h-3 w-3" />
                Agregar
              </button>
            </div>

            {medications.map((med, index) => (
              <div key={med.id} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 space-y-3">
                {/* Header del medicamento */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Medicamento {index + 1}</span>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(med.id)}
                      className="rounded p-1 text-rose-400 transition hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Nombre y dosis */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={med.name}
                    onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                    placeholder="Nombre del medicamento"
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                  <input
                    value={med.dosage}
                    onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                    placeholder="Dosis (ej: 500mg)"
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </div>

                {/* Medicamentos rápidos */}
                <div className="flex flex-wrap gap-1">
                  {COMMON_MEDICATIONS.map((commonMed) => (
                    <button
                      key={commonMed.name}
                      type="button"
                      onClick={() => handleQuickMedication(commonMed, med.id)}
                      className="rounded-md border border-slate-700 bg-slate-800/40 px-2 py-1 text-xs text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-200"
                    >
                      {commonMed.name}
                    </button>
                  ))}
                </div>

                {/* Frecuencia y duración */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={med.frequency}
                    onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  >
                    {FREQUENCY_OPTIONS.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                  <select
                    value={med.duration}
                    onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  >
                    {DURATION_OPTIONS.map(dur => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>

                {/* Instrucciones específicas */}
                <textarea
                  value={med.instructions}
                  onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                  placeholder="Instrucciones específicas (opcional)"
                  className="min-h-[60px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
              </div>
            ))}
          </div>

          {/* Instrucciones generales */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Instrucciones generales</label>
            <textarea
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              placeholder="Reposo, hidratación, dieta, contraindicaciones..."
              className="min-h-[80px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleString('es-ES')}</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-slate-800/60 bg-[#0f1f35] p-4">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle className="h-3 w-3" />
            <span>Verifique alergias y contraindicaciones</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800/40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              <Save className="h-4 w-4" />
              Guardar prescripción
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}