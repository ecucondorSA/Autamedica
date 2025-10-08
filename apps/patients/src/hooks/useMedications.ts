'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  time?: string;
  completed?: boolean;
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user authenticated');

      // Get patient record with medications
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('medications')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Parse medications JSONB array
      const medicationsData = patient?.medications || [];
      setMedications(Array.isArray(medicationsData) ? medicationsData : []);
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch medications');
      setMedications([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  return {
    medications,
    loading,
    error,
    refetch: fetchMedications,
  };
}
