'use client';

import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

const recordTypeConfig = {
  diagnosis: { label: 'Diagnóstico', color: 'bg-blue-50 text-blue-700 border-blue-300', icon: '🩺' },
  prescription: { label: 'Receta', color: 'bg-purple-50 text-purple-700 border-purple-300', icon: '💊' },
  lab_result: { label: 'Resultado Lab', color: 'bg-green-50 text-green-700 border-green-300', icon: '🧪' },
  note: { label: 'Nota Médica', color: 'bg-stone-100 text-stone-700 border-stone-300', icon: '📝' },
  encounter: { label: 'Consulta', color: 'bg-amber-50 text-amber-700 border-amber-300', icon: '🏥' },
  procedure: { label: 'Procedimiento', color: 'bg-indigo-50 text-indigo-700 border-indigo-300', icon: '🔬' },
};

export default function MedicalHistoryPage() {
  // Sin autenticación, mostrar lista vacía
  const [medicalRecords] = useState<any[]>([]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Historial Médico</h1>
        <p className="text-stone-600 mt-2">Accede a tu historial médico completo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(recordTypeConfig).slice(0, 4).map(([key, config]) => (
          <div key={key} className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{config.icon}</span>
              <div>
                <p className="text-sm text-stone-600">{config.label}</p>
                <p className="text-2xl font-bold text-stone-900">0</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg border border-stone-200">
        {medicalRecords.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              No hay registros médicos
            </h3>
            <p className="text-stone-600">
              Tus registros médicos aparecerán aquí cuando estén disponibles
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {medicalRecords.map((record: any) => (
              <div key={record.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          recordTypeConfig[record.type as keyof typeof recordTypeConfig]?.color ||
                          'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {recordTypeConfig[record.type as keyof typeof recordTypeConfig]?.label || record.type}
                      </span>
                      <span className="text-sm text-stone-600">
                        {new Date(record.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">{record.title}</h3>
                    {record.description && (
                      <p className="text-sm text-stone-600">{record.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors">
                      <Eye className="h-4 w-4 text-stone-600" />
                    </button>
                    <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors">
                      <Download className="h-4 w-4 text-stone-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
