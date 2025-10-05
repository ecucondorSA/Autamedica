'use client';

import { use, useState } from 'react';
import { DoctorVideoConsultation } from '../../../components/consultation/DoctorVideoConsultation';
import { useRouter } from 'next/navigation';

export default function DoctorConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: consultationId } = use(params);
  const router = useRouter();
  const [showConsultation, setShowConsultation] = useState(false);

  // TODO: Obtener IDs reales del usuario autenticado
  const doctorId = 'doctor-current-user'; // Reemplazar con el ID real del doctor
  const patientId = 'patient-assigned'; // Reemplazar con el ID real del paciente asignado

  const handleEndConsultation = () => {
    setShowConsultation(false);
    router.push('/dashboard'); // Redirigir al dashboard médico
  };

  if (!showConsultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-2xl border border-blue-500/30 p-8">
          {/* Header médico */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-4 shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Videoconsulta Médica
            </h1>
            <p className="text-gray-400">
              Consulta ID: {consultationId}
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30">
              <span className="text-blue-300 text-sm font-medium">Modo Profesional</span>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Información del Paciente
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">ID Paciente:</p>
                <p className="text-white font-medium">{patientId}</p>
              </div>
              <div>
                <p className="text-gray-400">Estado:</p>
                <p className="text-green-400 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Esperando
                </p>
              </div>
            </div>
          </div>

          {/* Checklist médico */}
          <div className="space-y-4 mb-8">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-white font-semibold mb-3 flex items-center text-sm">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Herramientas Disponibles
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Compartir pantalla para mostrar imágenes médicas
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Grabación de consulta (requiere configuración S3)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Chat en tiempo real con el paciente
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Controles de cámara y micrófono
                </li>
              </ul>
            </div>

            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <p className="text-green-300 text-sm">
                <span className="font-semibold">HIPAA Compliant:</span> Esta videoconsulta cumple con
                normativas de privacidad médica. Todas las comunicaciones están encriptadas.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowConsultation(true)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/50"
            >
              Iniciar Consulta
            </button>
          </div>

          {/* Nota de recordatorio */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Recuerda revisar el historial médico del paciente antes de iniciar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DoctorVideoConsultation
      consultationId={consultationId}
      patientId={patientId}
      doctorId={doctorId}
      onEnd={handleEndConsultation}
    />
  );
}
