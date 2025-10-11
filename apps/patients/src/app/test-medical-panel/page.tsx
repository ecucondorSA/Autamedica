'use client';

import { useVitalSigns } from '@/hooks/useVitalSigns';
import { useMedications } from '@/hooks/useMedications';
import { useAllergies } from '@/hooks/useAllergies';
import { useAccessLog } from '@/hooks/useAccessLog';

export default function TestMedicalPanelPage() {
  const { vitalSigns, loading: vitalsLoading } = useVitalSigns();
  const { medications, loading: medsLoading } = useMedications();
  const { allergies, loading: allergiesLoading } = useAllergies();
  const { doctorSummaries, loading: accessLoading } = useAccessLog();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Medical Info Panel - Real Database Data</h1>

        {/* Vital Signs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🩺 Signos Vitales</h2>
          {vitalsLoading ? (
            <p>Cargando...</p>
          ) : vitalSigns ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Presión Arterial:</span>
                <span className="text-lg">{vitalSigns.systolic_bp}/{vitalSigns.diastolic_bp} mmHg</span>
              </div>
              {vitalSigns.heart_rate && (
                <div className="flex justify-between">
                  <span className="font-medium">Frecuencia Cardíaca:</span>
                  <span className="text-lg">{vitalSigns.heart_rate} lpm</span>
                </div>
              )}
              {vitalSigns.temperature && (
                <div className="flex justify-between">
                  <span className="font-medium">Temperatura:</span>
                  <span className="text-lg">{vitalSigns.temperature}°C</span>
                </div>
              )}
              {vitalSigns.oxygen_saturation && (
                <div className="flex justify-between">
                  <span className="font-medium">Saturación de Oxígeno:</span>
                  <span className="text-lg">{vitalSigns.oxygen_saturation}%</span>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-500">
                Status: <span className={vitalSigns.status === 'normal' ? 'text-green-600' : 'text-yellow-600'}>{vitalSigns.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay signos vitales registrados</p>
          )}
        </div>

        {/* Medications */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💊 Medicamentos</h2>
          {medsLoading ? (
            <p>Cargando...</p>
          ) : medications.length > 0 ? (
            <ul className="space-y-2">
              {medications.map((med, index) => (
                <li key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{med.name}</span> {med.dosage && `- ${med.dosage}`}
                    <div className="text-sm text-gray-500">{med.frequency} {med.time && `a las ${med.time}`}</div>
                  </div>
                  {med.completed !== undefined && (
                    <span className={med.completed ? 'text-green-600' : 'text-gray-400'}>
                      {med.completed ? '✓ Completado' : '○ Pendiente'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay medicamentos registrados</p>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Alergias</h2>
          {allergiesLoading ? (
            <p>Cargando...</p>
          ) : allergies.length > 0 ? (
            <ul className="space-y-2">
              {allergies.map((allergy, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{allergy.name}</span>
                    {allergy.severity && (
                      <span className={`text-xs uppercase px-2 py-1 rounded ${
                        allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {allergy.severity}
                      </span>
                    )}
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay alergias registradas</p>
          )}
        </div>

        {/* Access Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">👁️ Accesos Médicos</h2>
          {accessLoading ? (
            <p>Cargando...</p>
          ) : doctorSummaries.length > 0 ? (
            <ul className="space-y-3">
              {doctorSummaries.map((summary, index) => (
                <li key={index} className="border-b pb-3">
                  <div className="font-medium">{summary.doctor_name}</div>
                  <div className="text-sm text-gray-600">{summary.specialty}</div>
                  <div className="text-xs text-gray-500 mt-1">{summary.views} visualizaciones</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay registro de accesos médicos</p>
          )}
        </div>
      </div>
    </div>
  );
}
