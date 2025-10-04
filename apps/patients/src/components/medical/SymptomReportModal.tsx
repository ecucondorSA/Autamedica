'use client';

import { useState } from 'react';
import { X, Heart, Thermometer, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePatientMedicalStore } from '@/stores/patientMedicalStore';

interface SymptomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

type SymptomSeverity = 'leve' | 'moderado' | 'severo';
type SymptomCategory = 'dolor' | 'respiratorio' | 'digestivo' | 'neurologico' | 'cardiovascular' | 'dermatologico' | 'otro';

interface SymptomTemplate {
  id: string;
  name: string;
  category: SymptomCategory;
  icon: JSX.Element;
  description: string;
  defaultSeverity: SymptomSeverity;
}

const SYMPTOM_TEMPLATES: SymptomTemplate[] = [
  {
    id: 'dolor-cabeza',
    name: 'Dolor de cabeza',
    category: 'neurologico',
    icon: <Heart className="h-4 w-4" />,
    description: 'Cefalea, migraña o tensión',
    defaultSeverity: 'moderado'
  },
  {
    id: 'fiebre',
    name: 'Fiebre',
    category: 'otro',
    icon: <Thermometer className="h-4 w-4" />,
    description: 'Temperatura elevada',
    defaultSeverity: 'moderado'
  },
  {
    id: 'dolor-pecho',
    name: 'Dolor en el pecho',
    category: 'cardiovascular',
    icon: <Heart className="h-4 w-4" />,
    description: 'Molestia o presión torácica',
    defaultSeverity: 'severo'
  },
  {
    id: 'dificultad-respirar',
    name: 'Dificultad para respirar',
    category: 'respiratorio',
    icon: <Activity className="h-4 w-4" />,
    description: 'Disnea o falta de aire',
    defaultSeverity: 'severo'
  },
  {
    id: 'nauseas',
    name: 'Náuseas/Vómitos',
    category: 'digestivo',
    icon: <Activity className="h-4 w-4" />,
    description: 'Malestar estomacal',
    defaultSeverity: 'moderado'
  },
  {
    id: 'dolor-abdominal',
    name: 'Dolor abdominal',
    category: 'digestivo',
    icon: <Heart className="h-4 w-4" />,
    description: 'Dolor o molestia en el abdomen',
    defaultSeverity: 'moderado'
  }
];

export function SymptomReportModal({ isOpen, onClose, patientId = 'current-patient' }: SymptomReportModalProps) {
  const { recordSymptom, isLoading } = usePatientMedicalStore();

  const [selectedTemplate, setSelectedTemplate] = useState<SymptomTemplate | null>(null);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState<SymptomSeverity>('moderado');
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [useCustomSymptom, setUseCustomSymptom] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const symptomName = useCustomSymptom ? customSymptom : selectedTemplate?.name;
    if (!symptomName) return;

    setIsSubmitting(true);

    try {
      const symptomDescription = [
        symptomName,
        duration && `Duración: ${duration}`,
        triggers && `Desencadenantes: ${triggers}`,
        additionalNotes && `Notas: ${additionalNotes}`
      ].filter(Boolean).join('. ');

      await recordSymptom(symptomDescription, severity, patientId);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error recording symptom:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomSymptom('');
    setSeverity('moderado');
    setDuration('');
    setTriggers('');
    setAdditionalNotes('');
    setUseCustomSymptom(false);
    setShowSuccess(false);
    onClose();
  };

  const getSeverityColor = (sev: SymptomSeverity) => {
    switch (sev) {
      case 'leve': return 'border-green-500/50 bg-green-500/10 text-green-200';
      case 'moderado': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-200';
      case 'severo': return 'border-red-500/50 bg-red-50 text-red-800';
    }
  };

  const getSeverityIcon = (sev: SymptomSeverity) => {
    switch (sev) {
      case 'leve': return '🟢';
      case 'moderado': return '🟡';
      case 'severo': return '🔴';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-800">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Reportar Síntoma</h2>
              <p className="text-xs text-white/70">Registra tus síntomas para tu equipo médico</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showSuccess ? (
          /* Success State */
          <div className="p-6 text-center space-y-4">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-500/20 text-green-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Síntoma Registrado</h3>
              <p className="text-sm text-white/70">Tu reporte ha sido enviado al equipo médico</p>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Symptom Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Seleccionar Síntoma</h3>
                <button
                  type="button"
                  onClick={() => setUseCustomSymptom(!useCustomSymptom)}
                  className="text-xs text-white/70 hover:text-white transition"
                >
                  {useCustomSymptom ? 'Usar plantillas' : 'Síntoma personalizado'}
                </button>
              </div>

              {useCustomSymptom ? (
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Describe tu síntoma..."
                  className="w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                  required
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {SYMPTOM_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setSeverity(template.defaultSeverity);
                      }}
                      className={`p-3 rounded-lg border text-left transition ${
                        selectedTemplate?.id === template.id
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white/70">{template.icon}</span>
                        <span className="text-sm font-medium text-white">{template.name}</span>
                      </div>
                      <p className="text-xs text-white/60">{template.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Severidad</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['leve', 'moderado', 'severo'] as SymptomSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`p-3 rounded-lg border text-center transition ${
                      severity === sev
                        ? getSeverityColor(sev)
                        : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">{getSeverityIcon(sev)}</div>
                    <div className="text-xs font-medium capitalize">{sev}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Duración</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="ej: 2 horas, desde ayer..."
                  className="w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Desencadenantes</label>
                <input
                  type="text"
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  placeholder="ej: después de comer, estrés..."
                  className="w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Notas adicionales</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Describe cualquier detalle adicional relevante..."
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm resize-none"
              />
            </div>

            {/* Priority Alert */}
            {severity === 'severo' && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800">Síntoma de alta prioridad</p>
                  <p className="text-xs text-red-700">Se notificará inmediatamente a tu equipo médico</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!selectedTemplate && !customSymptom)}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Síntoma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}