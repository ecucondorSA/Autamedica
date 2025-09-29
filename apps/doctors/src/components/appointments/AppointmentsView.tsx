'use client';

import { useAppointments } from '@/features/appointments/useAppointments';

export default function AppointmentsView() {
  const { status, error, rows, refresh } = useAppointments();

  if (status === 'loading') return <p>Cargando…</p>;
  if (status === 'error')   return <p>Error: {error}</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Citas</h1>
        <button onClick={() => refresh()} className="rounded px-3 py-1 border">
          Refrescar
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Paciente</th>
            <th className="border p-2 text-left">Médico</th>
            <th className="border p-2 text-left">Fecha</th>
            <th className="border p-2 text-left">Duración</th>
            <th className="border p-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.patient_id}</td>
              <td className="border p-2">{r.doctor_id}</td>
              <td className="border p-2">{new Date(r.start_time).toLocaleString()}</td>
              <td className="border p-2">{r.duration_minutes} min</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  r.status === 'completed' ? 'bg-green-100 text-green-800' :
                  r.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && status === 'success' && (
        <p className="text-gray-500 text-center py-4">No hay citas programadas</p>
      )}
    </div>
  );
}