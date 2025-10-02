'use client';

import { mockMedicalRecords } from '../../../../mocks/medical-records';
import { FileText, Download, Eye } from 'lucide-react';

const recordTypeConfig = {
  diagnosis: { label: 'Diagnóstico', color: 'bg-blue-50 text-blue-700 border-blue-300', icon: '🩺' },
  prescription: { label: 'Receta', color: 'bg-purple-50 text-purple-700 border-purple-300', icon: '💊' },
  lab_result: { label: 'Resultado Lab', color: 'bg-green-50 text-green-700 border-green-300', icon: '🧪' },
  note: { label: 'Nota Médica', color: 'bg-stone-100 text-stone-700 border-stone-300', icon: '📝' },
};

export default function MedicalHistoryPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="heading-1 flex items-center gap-3">
            <FileText className="h-8 w-8 text-stone-700" />
            Historial Médico
          </h1>
          <button className="btn-secondary-ivory px-6 py-3 text-sm inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar historial
          </button>
        </div>
        <p className="text-stone-600">
          Todos tus registros médicos en un solo lugar
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {Object.entries(recordTypeConfig).map(([key, config]) => {
          const count = mockMedicalRecords.filter(r => r.record_type === key).length;
          return (
            <div key={key} className="card-ivory p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{config.icon}</span>
                <p className="text-label text-stone-600">{config.label}</p>
              </div>
              <p className="text-3xl font-bold text-stone-900">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Records list */}
      <div className="space-y-4">
        {mockMedicalRecords.map((record) => {
          const config = recordTypeConfig[record.record_type];

          return (
            <div key={record.id} className="bg-white border-2 border-stone-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-stone-900">{record.title}</h3>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">{formatDate(record.created_at)}</p>
                  </div>
                </div>
                <button className="btn-secondary-ivory px-4 py-2 text-sm inline-flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </button>
              </div>

              <p className="text-sm text-stone-700 mb-4">{record.description}</p>

              {record.diagnosis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                  <p className="text-sm text-blue-900">
                    <strong>Diagnóstico:</strong> {record.diagnosis}
                  </p>
                </div>
              )}

              {record.treatment && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-900">
                    <strong>Tratamiento:</strong> {record.treatment}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
