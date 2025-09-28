"use client"

import { useState } from 'react'
import type { JSX } from 'react'
import { X, Save, Clock, FileText, AlertCircle, ChevronDown } from 'lucide-react'
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore'

interface QuickNotesModalProps {
  patientName: string
  patientId: string
  onClose: () => void
}

const NOTE_TEMPLATES = [
  { id: 'subjective', label: 'Subjetivo (S)', placeholder: 'Síntomas reportados por el paciente...' },
  { id: 'objective', label: 'Objetivo (O)', placeholder: 'Hallazgos del examen físico...' },
  { id: 'assessment', label: 'Evaluación (A)', placeholder: 'Diagnóstico diferencial y evaluación clínica...' },
  { id: 'plan', label: 'Plan (P)', placeholder: 'Plan de tratamiento y seguimiento...' }
]

const QUICK_NOTES = [
  'Signos vitales estables',
  'Sin cambios desde última consulta',
  'Mejoría sintomática',
  'Requiere seguimiento',
  'Exámenes pendientes'
]

export function QuickNotesModal({ patientName, patientId, onClose }: QuickNotesModalProps): JSX.Element {
  const { addEntry } = useMedicalHistoryStore()
  const [notes, setNotes] = useState<Record<string, string>>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  })
  const [priority, setPriority] = useState<'normal' | 'high'>('normal')
  const [expandedSection, setExpandedSection] = useState<string>('subjective')

  const handleSave = async () => {
    const soapNote = `
NOTA SOAP - ${new Date().toLocaleDateString('es-ES')}

SUBJETIVO: ${notes.subjective || 'Sin datos'}

OBJETIVO: ${notes.objective || 'Sin datos'}

EVALUACIÓN: ${notes.assessment || 'Sin datos'}

PLAN: ${notes.plan || 'Sin datos'}

Prioridad: ${priority === 'high' ? 'ALTA' : 'Normal'}
    `.trim()

    await addEntry({
      type: 'note',
      content: soapNote,
      doctorId: 'current-doctor',
      patientId,
      metadata: {
        noteType: 'SOAP',
        priority
      }
    })

    onClose()
  }

  const handleQuickNote = (note: string) => {
    setNotes(prev => ({
      ...prev,
      [expandedSection]: prev[expandedSection] ? `${prev[expandedSection]}\n• ${note}` : `• ${note}`
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800/80 bg-[#0f1f35] shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Nota Médica SOAP</h2>
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
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Priority selector */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Prioridad:</span>
            <button
              type="button"
              onClick={() => setPriority('normal')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                priority === 'normal'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                priority === 'high'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="mr-1 inline-block h-3 w-3" />
              Alta
            </button>
          </div>

          {/* SOAP sections */}
          <div className="space-y-3">
            {NOTE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`rounded-lg border transition-colors ${
                  expandedSection === template.id
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-slate-800/60 bg-slate-900/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSection(template.id)}
                  className="flex w-full items-center justify-between p-3 text-left"
                >
                  <span className="text-sm font-medium text-slate-200">{template.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      expandedSection === template.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedSection === template.id && (
                  <div className="border-t border-slate-800/60 p-3">
                    <textarea
                      value={notes[template.id]}
                      onChange={(e) => setNotes(prev => ({ ...prev, [template.id]: e.target.value }))}
                      placeholder={template.placeholder}
                      className="min-h-[100px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick notes */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Notas rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => handleQuickNote(note)}
                  className="rounded-lg border border-slate-700 bg-slate-800/40 px-2 py-1 text-xs text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-200"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleString('es-ES')}</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-slate-800/60 p-4">
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
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            <Save className="h-4 w-4" />
            Guardar nota
          </button>
        </footer>
      </div>
    </div>
  )
}