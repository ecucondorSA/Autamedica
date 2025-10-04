'use client';

import { useState } from 'react';
import {
  Heart,
  Pill,
  Activity,
  Calendar,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight
} from 'lucide-react';
import { usePatientMedicalStore } from '@/stores/patientMedicalStore';
import { SymptomReportModal } from './SymptomReportModal';
import { MedicationTrackerModal } from './MedicationTrackerModal';
import { VitalSignsModal } from './VitalSignsModal';

interface MedicalDashboardProps {
  className?: string;
}

export function MedicalDashboard({ className = '' }: MedicalDashboardProps) {
  const { getHealthSummary, getSymptomTrends, getMedicationAdherence } = usePatientMedicalStore();

  // Modal states
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);

  // Get health data
  const healthSummary = getHealthSummary();
  const symptomTrends = getSymptomTrends();
  const medicationAdherence = getMedicationAdherence();

  // Quick actions for medical tracking
  const medicalActions = [
    {
      id: 'symptoms',
      title: 'Reportar Síntoma',
      description: 'Registra síntomas para tu médico',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-red-50 border-red-300 text-red-800 hover:bg-red-500/30',
      action: () => setShowSymptomModal(true)
    },
    {
      id: 'medication',
      title: 'Medicamentos',
      description: 'Registra dosis tomadas',
      icon: <Pill className="h-5 w-5" />,
      color: 'bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/30',
      action: () => setShowMedicationModal(true)
    },
    {
      id: 'vitals',
      title: 'Signos Vitales',
      description: 'Registra mediciones',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30',
      action: () => setShowVitalSignsModal(true)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente': return 'text-green-400';
      case 'bueno': return 'text-blue-400';
      case 'regular': return 'text-yellow-400';
      case 'necesita_atencion': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'excelente': return '😊';
      case 'bueno': return '🙂';
      case 'regular': return '😐';
      case 'necesita_atencion': return '😟';
      default: return '🤔';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Health Status Overview */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado de Salud General
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusEmoji(healthSummary.overallStatus)}</span>
            <span className={`text-sm font-medium capitalize ${getStatusColor(healthSummary.overallStatus)}`}>
              {healthSummary.overallStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Symptoms */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-white">Síntomas</h3>
            </div>
            <div className="text-lg font-bold text-white mb-1">{healthSummary.symptomsCount}</div>
            <div className="text-xs text-white/70">
              Último: {healthSummary.lastSymptom}
            </div>
          </div>

          {/* Medication Adherence */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-white">Adherencia</h3>
            </div>
            <div className={`text-lg font-bold mb-1 ${
              medicationAdherence.adherenceScore >= 80 ? 'text-green-400' :
              medicationAdherence.adherenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {medicationAdherence.adherenceScore.toFixed(0)}%
            </div>
            <div className="text-xs text-white/70">
              Últimos 30 días
            </div>
          </div>

          {/* Last Vitals */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-medium text-white">Signos Vitales</h3>
            </div>
            <div className="text-lg font-bold text-white mb-1">
              {healthSummary.lastVitals ? 'Actualizados' : 'Sin datos'}
            </div>
            <div className="text-xs text-white/70">
              {healthSummary.lastVitals?.weight ? `${healthSummary.lastVitals.weight} kg` : 'Agregar mediciones'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Medical Actions */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Registrar Datos Médicos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medicalActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg border transition ${action.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {action.icon}
                <h3 className="font-semibold">{action.title}</h3>
              </div>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Medical Activity */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Médica Reciente
          </h2>
          <button className="text-white/70 hover:text-white text-sm flex items-center gap-1">
            Ver todo <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Sample recent activities */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Pill className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Medicamento registrado</p>
              <p className="text-white/70 text-xs">Metformina 500mg - Hace 2 horas</p>
            </div>
            <span className="text-green-400 text-xs">✓</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Signos vitales actualizados</p>
              <p className="text-white/70 text-xs">Presión arterial 120/80 - Ayer</p>
            </div>
            <span className="text-green-400 text-xs">✓</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Heart className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Síntoma reportado</p>
              <p className="text-white/70 text-xs">Dolor de cabeza leve - Hace 3 días</p>
            </div>
            <span className="text-yellow-400 text-xs">!</span>
          </div>
        </div>
      </div>

      {/* Upcoming Medical Events */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Recordatorios
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border border-blue-500/30 bg-blue-500/10 rounded-lg">
            <Clock className="h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-blue-200 text-sm font-medium">Tomar Lisinopril</p>
              <p className="text-blue-200/80 text-xs">Hoy a las 20:00</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-green-500/30 bg-green-500/10 rounded-lg">
            <Calendar className="h-4 w-4 text-green-400" />
            <div className="flex-1">
              <p className="text-green-200 text-sm font-medium">Control médico</p>
              <p className="text-green-200/80 text-xs">Mañana a las 15:00 - Dr. García</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Modals */}
      <SymptomReportModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        patientId="current-patient"
      />

      <MedicationTrackerModal
        isOpen={showMedicationModal}
        onClose={() => setShowMedicationModal(false)}
        patientId="current-patient"
      />

      <VitalSignsModal
        isOpen={showVitalSignsModal}
        onClose={() => setShowVitalSignsModal(false)}
        patientId="current-patient"
      />
    </div>
  );
}