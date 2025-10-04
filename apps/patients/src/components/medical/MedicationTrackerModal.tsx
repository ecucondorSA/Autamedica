'use client';

import { useState } from 'react';
import { X, Pill, Clock, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { usePatientMedicalStore } from '@/stores/patientMedicalStore';
import { logger } from '@autamedica/shared';

interface MedicationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose?: string;
  taken?: boolean;
}

// Mock current medications - in production this would come from patient data
const CURRENT_MEDICATIONS: MedicationEntry[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Una vez al día',
    nextDose: '08:00',
    taken: false
  },
  {
    id: '2',
    name: 'Metformina',
    dosage: '500mg',
    frequency: 'Dos veces al día',
    nextDose: '12:00',
    taken: true
  },
  {
    id: '3',
    name: 'Aspirina',
    dosage: '100mg',
    frequency: 'Una vez al día',
    nextDose: '20:00',
    taken: false
  }
];

export function MedicationTrackerModal({ isOpen, onClose, patientId = 'current-patient' }: MedicationTrackerModalProps) {
  const { recordMedicationTaken, isLoading } = usePatientMedicalStore();

  const [medications, setMedications] = useState<MedicationEntry[]>(CURRENT_MEDICATIONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleMarkAsTaken = async (medication: MedicationEntry) => {
    setIsSubmitting(true);

    try {
      await recordMedicationTaken(medication.name, medication.dosage, patientId);

      // Update local state
      setMedications(prev => prev.map(med =>
        med.id === medication.id ? { ...med, taken: true } : med
      ));

      setSuccessMessage(`${medication.name} registrado correctamente`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      logger.error('Error recording medication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;

    const newMed: MedicationEntry = {
      id: Date.now().toString(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: 'Según necesidad',
      taken: false
    };

    setMedications(prev => [...prev, newMed]);
    setNewMedication({ name: '', dosage: '' });
    setShowAddForm(false);
  };

  const getNextDoseStatus = (nextDose?: string) => {
    if (!nextDose) return { color: 'text-white/60', status: 'Sin horario' };

    const now = new Date();
    const [hours, minutes] = nextDose.split(':').map(Number);
    const doseTime = new Date();
    doseTime.setHours(hours, minutes, 0, 0);

    const diffMs = doseTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      return { color: 'text-red-400', status: 'Hora pasada' };
    } else if (diffMs < 30 * 60 * 1000) { // 30 minutes
      return { color: 'text-yellow-400', status: 'Próxima dosis' };
    } else {
      return { color: 'text-green-400', status: `En ${diffHours}h ${diffMinutes}m` };
    }
  };

  const adherenceScore = Math.round((medications.filter(med => med.taken).length / medications.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Seguimiento de Medicamentos</h2>
              <p className="text-xs text-white/70">Registra las dosis tomadas hoy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-white/60">Adherencia hoy</div>
              <div className={`text-sm font-semibold ${
                adherenceScore >= 80 ? 'text-green-400' :
                adherenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {adherenceScore}%
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">

          {/* Current Medications List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Medicamentos Actuales</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition"
              >
                <Plus className="h-4 w-4" />
                Agregar medicamento
              </button>
            </div>

            {/* Add Medication Form */}
            {showAddForm && (
              <div className="space-y-3 p-4 rounded-lg border border-white/20 bg-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del medicamento"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                  />
                  <input
                    type="text"
                    placeholder="Dosis (ej: 10mg)"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddMedication}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-sm"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Medications Grid */}
            <div className="space-y-3">
              {medications.map((medication) => {
                const doseStatus = getNextDoseStatus(medication.nextDose);
                return (
                  <div
                    key={medication.id}
                    className={`p-4 rounded-lg border transition ${
                      medication.taken
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{medication.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                            {medication.dosage}
                          </span>
                          {medication.taken && (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/70">
                          <span>{medication.frequency}</span>
                          {medication.nextDose && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Próxima: {medication.nextDose}</span>
                              <span className={doseStatus.color}>({doseStatus.status})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {!medication.taken && (
                        <button
                          onClick={() => handleMarkAsTaken(medication)}
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-50"
                        >
                          {isSubmitting ? 'Registrando...' : 'Marcar como tomado'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adherence Summary */}
          <div className="mt-6 p-4 rounded-lg border border-white/20 bg-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">Resumen de Adherencia</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">
                  {medications.filter(med => med.taken).length}
                </div>
                <div className="text-xs text-white/70">Tomados hoy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">
                  {medications.filter(med => !med.taken).length}
                </div>
                <div className="text-xs text-white/70">Pendientes</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  adherenceScore >= 80 ? 'text-green-400' :
                  adherenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {adherenceScore}%
                </div>
                <div className="text-xs text-white/70">Adherencia</div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">💡 Consejos</h3>
            <ul className="text-xs text-blue-200/80 space-y-1">
              <li>• Toma tus medicamentos a la misma hora cada día</li>
              <li>• Usa alarmas para recordar las dosis</li>
              <li>• No suspendas medicamentos sin consultar a tu médico</li>
              <li>• Reporta efectos secundarios inmediatamente</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition font-medium text-sm"
          >
            Cerrar
          </button>
          <button
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition"
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
}