'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  useVitalSigns,
  useMedicationLog,
  useSymptomReport,
  useLabResults,
  useCommunityPost,
} from '@/hooks/useQuickActions';
import { useCommunityGroups } from '@/hooks/useCommunity';

// Modal Base Component
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-6 text-xl font-bold text-stone-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// Modal: Registrar Presión Arterial
export function BloodPressureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const { recordBloodPressure, loading, error } = useVitalSigns();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await recordBloodPressure(
      parseInt(systolic),
      parseInt(diastolic),
      notes || undefined
    );
    if (result.success) {
      setSystolic('');
      setDiastolic('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💓 Registrar Presión Arterial">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Sistólica (máxima)
            </label>
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              placeholder="120"
              required
              min="60"
              max="250"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Diastólica (mínima)
            </label>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              placeholder="80"
              required
              min="40"
              max="150"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo te sientes? ¿Antes o después de medicamento?"
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal: Confirmar Medicamento
export function MedicationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'taken' | 'skipped' | 'late'>('taken');
  const { confirmMedication, loading, error } = useMedicationLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await confirmMedication(
      medicationName,
      dosage,
      notes || undefined,
      status
    );
    if (result.success) {
      setMedicationName('');
      setDosage('');
      setNotes('');
      setStatus('taken');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💊 Confirmar Medicamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Nombre del medicamento
          </label>
          <input
            type="text"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="Ej: Lisinopril"
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Dosis</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="Ej: 10mg"
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'taken' | 'skipped' | 'late')}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          >
            <option value="taken">✅ Tomado</option>
            <option value="late">⏰ Tomado tarde</option>
            <option value="skipped">❌ Omitido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Alguna observación?"
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal: Agregar Síntoma
export function SymptomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState('5');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const { reportSymptom, loading, error } = useSymptomReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await reportSymptom({
      symptomName,
      severity: parseInt(severity),
      description: description || undefined,
      duration: duration || undefined,
      isUrgent,
    });
    if (result.success) {
      setSymptomName('');
      setSeverity('5');
      setDescription('');
      setDuration('');
      setIsUrgent(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🩺 Agregar Síntoma">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Síntoma</label>
          <input
            type="text"
            value={symptomName}
            onChange={(e) => setSymptomName(e.target.value)}
            placeholder="Ej: Dolor de cabeza"
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Intensidad: {severity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-stone-600">
            <span>Leve</span>
            <span>Moderado</span>
            <span>Grave</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el síntoma con detalle..."
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Duración</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ej: 2 horas, desde ayer..."
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="urgent"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-600"
          />
          <label htmlFor="urgent" className="text-sm font-medium text-stone-700">
            🚨 Marcar como urgente (notificará a tu médico)
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Reportar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal: Subir Resultado
export function LabResultModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [laboratoryName, setLaboratoryName] = useState('');
  const [notes, setNotes] = useState('');
  const { uploadLabResult, loading, error } = useLabResults();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await uploadLabResult({
      testType,
      testDate,
      laboratoryName: laboratoryName || undefined,
      notes: notes || undefined,
    });
    if (result.success) {
      setTestType('');
      setTestDate('');
      setLaboratoryName('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Subir Resultado de Laboratorio">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Tipo de análisis
          </label>
          <input
            type="text"
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            placeholder="Ej: Hemograma completo"
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Fecha del análisis
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Laboratorio (opcional)
          </label>
          <input
            type="text"
            value={laboratoryName}
            onChange={(e) => setLaboratoryName(e.target.value)}
            placeholder="Ej: Laboratorio Central"
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
          💡 Próximamente podrás subir archivos (PDF, imágenes) de tus resultados
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal: Publicar en Comunidad
export function CommunityPostModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { createPost, loading, error } = useCommunityPost();
  const { groups, loading: loadingGroups } = useCommunityGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createPost({
      groupId,
      title,
      content,
      isAnonymous,
    });
    if (result.success) {
      setGroupId('');
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      onClose();
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💬 Nueva Publicación">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Grupo</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            disabled={loadingGroups}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20 disabled:opacity-50"
          >
            <option value="">
              {loadingGroups ? 'Cargando grupos...' : 'Selecciona un grupo...'}
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿De qué quieres hablar?"
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tu experiencia, pregunta o consejo..."
            rows={4}
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-600"
          />
          <label htmlFor="anonymous" className="text-sm font-medium text-stone-700">
            🔒 Publicar de forma anónima
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
