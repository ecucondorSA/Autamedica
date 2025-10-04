'use client';

import { useState } from 'react';
import { X, Activity, Heart, Thermometer, Scale, TrendingUp, CheckCircle2 } from 'lucide-react';
import { usePatientMedicalStore } from '@/stores/patientMedicalStore';
import { logger } from '@autamedica/shared';

interface VitalSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

interface VitalSignsData {
  weight?: number;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucoseLevel?: number;
}

interface VitalSignField {
  key: keyof VitalSignsData;
  label: string;
  icon: JSX.Element;
  unit: string;
  placeholder: string;
  type: 'number' | 'text';
  normalRange: string;
  getStatusColor: (value: any) => string;
}

const VITAL_SIGN_FIELDS: VitalSignField[] = [
  {
    key: 'weight',
    label: 'Peso',
    icon: <Scale className="h-4 w-4" />,
    unit: 'kg',
    placeholder: '70.5',
    type: 'number',
    normalRange: '18.5-24.9 IMC',
    getStatusColor: (value: number) => {
      if (!value) return 'text-white/60';
      // Simple BMI estimation for average height
      const bmi = value / ((1.70) ** 2); // Assuming 1.70m average height
      if (bmi < 18.5 || bmi > 30) return 'text-red-400';
      if (bmi > 25) return 'text-yellow-400';
      return 'text-green-400';
    }
  },
  {
    key: 'bloodPressure',
    label: 'Presión Arterial',
    icon: <Heart className="h-4 w-4" />,
    unit: 'mmHg',
    placeholder: '120/80',
    type: 'text',
    normalRange: '90/60 - 120/80',
    getStatusColor: (value: string) => {
      if (!value) return 'text-white/60';
      const match = value.match(/(\d+)\/(\d+)/);
      if (!match) return 'text-white/60';
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      if (systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60) return 'text-red-400';
      if (systolic > 130 || diastolic > 85) return 'text-yellow-400';
      return 'text-green-400';
    }
  },
  {
    key: 'heartRate',
    label: 'Frecuencia Cardíaca',
    icon: <Activity className="h-4 w-4" />,
    unit: 'bpm',
    placeholder: '75',
    type: 'number',
    normalRange: '60-100 bpm',
    getStatusColor: (value: number) => {
      if (!value) return 'text-white/60';
      if (value < 60 || value > 100) return 'text-red-400';
      if (value < 65 || value > 90) return 'text-yellow-400';
      return 'text-green-400';
    }
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    icon: <Thermometer className="h-4 w-4" />,
    unit: '°C',
    placeholder: '36.5',
    type: 'number',
    normalRange: '36.1-37.5°C',
    getStatusColor: (value: number) => {
      if (!value) return 'text-white/60';
      if (value < 36 || value > 38) return 'text-red-400';
      if (value < 36.1 || value > 37.5) return 'text-yellow-400';
      return 'text-green-400';
    }
  },
  {
    key: 'oxygenSaturation',
    label: 'Saturación de Oxígeno',
    icon: <Activity className="h-4 w-4" />,
    unit: '%',
    placeholder: '98',
    type: 'number',
    normalRange: '95-100%',
    getStatusColor: (value: number) => {
      if (!value) return 'text-white/60';
      if (value < 95) return 'text-red-400';
      if (value < 97) return 'text-yellow-400';
      return 'text-green-400';
    }
  },
  {
    key: 'glucoseLevel',
    label: 'Glucosa',
    icon: <TrendingUp className="h-4 w-4" />,
    unit: 'mg/dL',
    placeholder: '90',
    type: 'number',
    normalRange: '70-100 mg/dL (ayuno)',
    getStatusColor: (value: number) => {
      if (!value) return 'text-white/60';
      if (value < 70 || value > 140) return 'text-red-400';
      if (value > 100) return 'text-yellow-400';
      return 'text-green-400';
    }
  }
];

export function VitalSignsModal({ isOpen, onClose, patientId = 'current-patient' }: VitalSignsModalProps) {
  const { recordVitalSigns, isLoading } = usePatientMedicalStore();

  const [vitalSigns, setVitalSigns] = useState<VitalSignsData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (key: keyof VitalSignsData, value: string) => {
    const field = VITAL_SIGN_FIELDS.find(f => f.key === key);
    if (!field) return;

    setVitalSigns(prev => ({
      ...prev,
      [key]: field.type === 'number' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one vital sign is entered
    const hasData = Object.values(vitalSigns).some(value => value !== undefined && value !== '');
    if (!hasData) return;

    setIsSubmitting(true);

    try {
      await recordVitalSigns(vitalSigns, patientId);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      logger.error('Error recording vital signs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVitalSigns({});
    setNotes('');
    setShowSuccess(false);
    onClose();
  };

  const getOverallStatus = () => {
    const statuses = VITAL_SIGN_FIELDS.map(field => {
      const value = vitalSigns[field.key];
      if (!value) return 'normal';
      const color = field.getStatusColor(value);
      if (color.includes('red')) return 'critical';
      if (color.includes('yellow')) return 'warning';
      return 'normal';
    });

    if (statuses.includes('critical')) return { status: 'critical', color: 'text-red-400', message: 'Algunos valores requieren atención médica' };
    if (statuses.includes('warning')) return { status: 'warning', color: 'text-yellow-400', message: 'Algunos valores están fuera del rango normal' };
    return { status: 'normal', color: 'text-green-400', message: 'Todos los valores están normales' };
  };

  const overallStatus = getOverallStatus();
  const hasAnyData = Object.values(vitalSigns).some(value => value !== undefined && value !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-black/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-200">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Registrar Signos Vitales</h2>
              <p className="text-xs text-white/70">Registra tus mediciones para seguimiento médico</p>
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
              <h3 className="text-lg font-semibold text-white">Signos Vitales Registrados</h3>
              <p className="text-sm text-white/70">Tus datos han sido guardados correctamente</p>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
            <div className="p-6 space-y-6">

              {/* Overall Status */}
              {hasAnyData && (
                <div className={`flex items-center gap-3 rounded-lg border p-3 ${
                  overallStatus.status === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                  overallStatus.status === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10' :
                  'border-green-500/30 bg-green-500/10'
                }`}>
                  <Activity className={`h-5 w-5 ${overallStatus.color}`} />
                  <div>
                    <p className={`text-sm font-medium ${overallStatus.color}`}>
                      Estado General: {overallStatus.status === 'critical' ? 'Requiere Atención' :
                                      overallStatus.status === 'warning' ? 'Valores Límite' : 'Normal'}
                    </p>
                    <p className="text-xs text-white/70">{overallStatus.message}</p>
                  </div>
                </div>
              )}

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VITAL_SIGN_FIELDS.map((field) => {
                  const value = vitalSigns[field.key];
                  const statusColor = field.getStatusColor(value);

                  return (
                    <div key={field.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">{field.icon}</span>
                          <label className="text-sm font-medium text-white">{field.label}</label>
                        </div>
                        <span className="text-xs text-white/60">{field.normalRange}</span>
                      </div>

                      <div className="relative">
                        <input
                          type={field.type}
                          value={value || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          step={field.type === 'number' ? '0.1' : undefined}
                          className="w-full rounded-xl border border-white/20 bg-black/40 p-3 pr-12 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <span className="text-xs text-white/60">{field.unit}</span>
                          {value && (
                            <div className={`h-2 w-2 rounded-full ${
                              statusColor.includes('red') ? 'bg-red-400' :
                              statusColor.includes('yellow') ? 'bg-yellow-400' :
                              statusColor.includes('green') ? 'bg-green-400' : 'bg-white/30'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Notas adicionales</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade cualquier información relevante sobre las mediciones..."
                  rows={3}
                  className="w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm resize-none"
                />
              </div>

              {/* Quick Tips */}
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                <h3 className="text-sm font-semibold text-blue-200 mb-2">💡 Consejos para mediciones precisas</h3>
                <ul className="text-xs text-blue-200/80 space-y-1">
                  <li>• <strong>Presión arterial:</strong> Descansa 5 min antes de medir</li>
                  <li>• <strong>Peso:</strong> Mide en ayunas, sin ropa pesada</li>
                  <li>• <strong>Temperatura:</strong> Evita bebidas calientes 30 min antes</li>
                  <li>• <strong>Frecuencia cardíaca:</strong> Cuenta por 60 segundos para mayor precisión</li>
                </ul>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-white/20">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasAnyData}
                className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Registrar Signos Vitales'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}