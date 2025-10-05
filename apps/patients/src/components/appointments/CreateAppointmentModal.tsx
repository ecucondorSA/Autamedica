'use client';

import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { CreateAppointmentInput, AppointmentType } from '@/types/appointment';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentInput) => Promise<void>;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentInput>({
    scheduled_at: '',
    duration_minutes: 30,
    type: 'telemedicine',
    notes: '',
    reason: '',
  });

  // Hook para accesibilidad del modal (focus trap + ESC + restaurar foco)
  const { modalRef } = useModalAccessibility({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      // Resetear formulario
      setFormData({
        scheduled_at: '',
        duration_minutes: 30,
        type: 'telemedicine',
        notes: '',
        reason: '',
      });
      onClose();
    } catch (error) {
      console.error('Error al crear cita:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="presentation"
      onClick={(e) => {
        // Cerrar si se hace click en el overlay (no en el modal)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 id="modal-title" className="text-xl font-bold text-stone-900">Nueva Cita Médica</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-stone-600" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p id="modal-description" className="sr-only">
            Formulario para agendar una nueva cita médica. Complete los campos requeridos y presione Crear Cita.
          </p>

          {/* Fecha y hora */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="appointment-datetime">
              <Calendar className="h-4 w-4 inline mr-2" aria-hidden="true" />
              Fecha y Hora
            </label>
            <input
              id="appointment-datetime"
              type="datetime-local"
              required
              value={formData.scheduled_at}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_at: e.target.value })
              }
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            />
          </div>

          {/* Tipo de cita */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tipo de Cita
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as AppointmentType })
              }
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            >
              <option value="telemedicine">Telemedicina</option>
              <option value="in_person">Presencial</option>
              <option value="follow_up">Seguimiento</option>
              <option value="emergency">Emergencia</option>
            </select>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Duración (minutos)
            </label>
            <select
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Motivo de la Consulta
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Ej: Consulta general, dolor de cabeza..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            />
          </div>

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Notas Adicionales (opcional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Información adicional que el médico deba saber..."
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-stone-800 rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
