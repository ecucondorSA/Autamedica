'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type Appointment,
  type NewAppointment,
  type PatchAppointment,
} from '@/lib/repos/appointments';

type Status = 'idle' | 'loading' | 'error' | 'success';

export function useAppointments() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Appointment[]>([]);

  const refresh = useCallback(async () => {
    try {
      setStatus('loading'); setError(null);
      const data = await listAppointments();
      setRows(data);
      setStatus('success');
    } catch (e: any) {
      setStatus('error'); setError(e?.message ?? 'Error');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const create = useCallback(async (input: NewAppointment) => {
    const created = await createAppointment(input);
    setRows(prev => [...prev, created]);
    return created;
  }, []);

  const patch = useCallback(async (id: string, p: PatchAppointment) => {
    const updated = await updateAppointment(id, p);
    setRows(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteAppointment(id);
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  return useMemo(() => ({
    status, error, rows, refresh, create, patch, remove,
  }), [status, error, rows, refresh, create, patch, remove]);
}