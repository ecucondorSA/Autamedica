'use client';

// Disable SSG for this page since it uses auth and client-side data fetching
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@autamedica/auth';
import { logger } from '@autamedica/shared';

const recordTypeConfig = {
  diagnosis: { label: 'Diagnóstico', color: 'bg-blue-50 text-blue-700 border-blue-300', icon: '🩺' },
  prescription: { label: 'Receta', color: 'bg-purple-50 text-purple-700 border-purple-300', icon: '💊' },
  lab_result: { label: 'Resultado Lab', color: 'bg-green-50 text-green-700 border-green-300', icon: '🧪' },
  note: { label: 'Nota Médica', color: 'bg-stone-100 text-stone-700 border-stone-300', icon: '📝' },
  encounter: { label: 'Consulta', color: 'bg-amber-50 text-amber-700 border-amber-300', icon: '🏥' },
  procedure: { label: 'Procedimiento', color: 'bg-indigo-50 text-indigo-700 border-indigo-300', icon: '🔬' },
};

export default function MedicalHistoryPage() {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const supabase = createBrowserClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No hay usuario autenticado');
        }

        // Fetch medical records
        const { data: recordsData, error: recordsError } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (recordsError) throw recordsError;

        setMedicalRecords(recordsData || []);
      } catch (err) {
        logger.error('Error fetching medical records:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar historial médico');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-stone-900 mx-auto" />
          <p className="mt-4 text-stone-600">Cargando historial médico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">Error al cargar historial</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary-ivory px-4 py-2 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          const count = medicalRecords.filter(r => r.record_type === key).length;
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
      {medicalRecords.length > 0 ? (
        <div className="space-y-4">
          {medicalRecords.map((record) => {
            const config = recordTypeConfig[record.record_type as keyof typeof recordTypeConfig] ||
              recordTypeConfig.note;

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

                {record.notes && (
                  <p className="text-sm text-stone-700 mb-4">{record.notes}</p>
                )}

                {record.diagnosis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                    <p className="text-sm text-blue-900">
                      <strong>Diagnóstico:</strong> {record.diagnosis}
                    </p>
                  </div>
                )}

                {record.dosage && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-900">
                      <strong>Dosificación:</strong> {record.dosage}
                      {record.frequency && ` - ${record.frequency}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-ivory p-12 text-center">
          <FileText className="h-12 w-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600">No hay registros médicos disponibles</p>
          <p className="text-sm text-stone-500 mt-2">
            Los registros médicos de tus consultas aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
}
