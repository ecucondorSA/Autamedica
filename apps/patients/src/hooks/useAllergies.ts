'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface Allergy {
  name: string;
  severity?: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}

export function useAllergies() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAllergies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user authenticated');

      // Get patient record with allergies
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('allergies')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Parse allergies JSONB array
      const allergiesData = patient?.allergies || [];
      setAllergies(Array.isArray(allergiesData) ? allergiesData : []);
    } catch (err) {
      console.error('Error fetching allergies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch allergies');
      setAllergies([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAllergies();
  }, [fetchAllergies]);

  return {
    allergies,
    loading,
    error,
    refetch: fetchAllergies,
  };
}
