'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completePatientOnboarding, skipOnboarding, type PatientOnboardingData } from './actions';

/**
 * Patient Onboarding UI
 *
 * Formulario para completar perfil de paciente:
 * - Datos personales (fecha nacimiento, género, tipo sangre)
 * - Datos físicos (altura, peso)
 * - Contacto de emergencia
 * - Información de seguro (opcional)
 */

export default function PatientOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientOnboardingData>({
    birthDate: '',
    gender: 'prefer_not_to_say',
    bloodType: '',
    heightCm: undefined,
    weightKg: undefined,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    insurancePolicyNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await completePatientOnboarding(formData);

      if (result.success) {
        router.push('/patients/dashboard');
      } else {
        setError(result.error || 'Error al completar onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (confirm('¿Seguro que deseas saltar el onboarding? Podrás completarlo más tarde.')) {
      await skipOnboarding();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completa tu Perfil de Paciente
          </h1>
          <p className="text-gray-600">
            Esta información nos ayudará a brindarte mejor atención médica
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Datos Personales
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Sangre
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={formData.heightCm || ''}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="170"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="0.1"
                  value={formData.weightKg || ''}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Contacto de Emergencia
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                required
                placeholder="Juan Pérez"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                required
                placeholder="+54 11 1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relación
              </label>
              <input
                type="text"
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                placeholder="Padre, Madre, Cónyuge, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Información de Seguro (Opcional) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Seguro Médico (Opcional)
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obra Social / Prepaga
              </label>
              <input
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                placeholder="OSDE, Swiss Medical, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Póliza
              </label>
              <input
                type="text"
                value={formData.insurancePolicyNumber}
                onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                placeholder="123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Completar Registro'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Saltar por ahora
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            * Campos requeridos. Puedes completar esta información más tarde desde tu perfil.
          </p>
        </form>
      </div>
    </div>
  );
}
