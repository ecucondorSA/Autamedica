'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  measured_at?: string;
  status?: 'normal' | 'warning' | 'critical';
}

// Helper function to determine status based on vital signs
function getVitalStatus(vitals: VitalSigns): 'normal' | 'warning' | 'critical' {
  // Blood pressure check
  if (vitals.systolic_bp && vitals.diastolic_bp) {
    if (vitals.systolic_bp >= 140 || vitals.diastolic_bp >= 90) {
      return 'critical'; // Hypertension
    }
    if (vitals.systolic_bp < 90 || vitals.diastolic_bp < 60) {
      return 'critical'; // Hypotension
    }
  }

  // Heart rate check
  if (vitals.heart_rate) {
    if (vitals.heart_rate > 100 || vitals.heart_rate < 60) {
      return 'warning';
    }
  }

  // Temperature check (in Celsius)
  if (vitals.temperature) {
    if (vitals.temperature >= 38 || vitals.temperature <= 35) {
      return 'critical';
    }
    if (vitals.temperature >= 37.5 || vitals.temperature <= 36) {
      return 'warning';
    }
  }

  return 'normal';
}

export function useVitalSigns() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState(true);
  const supabase = createClient();

  const fetchVitalSigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user authenticated');

      // Get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Try to fetch latest vital signs from the database
      // This will fail gracefully if the table doesn't exist yet
      const { data: vitals, error: vitalsError } = await supabase
        .from('patient_vital_signs')
        .select('systolic_bp, diastolic_bp, heart_rate, temperature, respiratory_rate, oxygen_saturation, measured_at')
        .eq('patient_id', patient.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (vitalsError) {
        // Check if error is due to table not existing
        if (vitalsError.code === '42P01' || vitalsError.message.includes('does not exist')) {
          console.warn('patient_vital_signs table does not exist yet. Migration pending.');
          setTableExists(false);
          setVitalSigns(null);
        } else if (vitalsError.code === 'PGRST116') {
          // No rows found - patient has no vital signs recorded yet
          setVitalSigns(null);
        } else {
          throw vitalsError;
        }
      } else if (vitals) {
        const vitalData: VitalSigns = {
          systolic_bp: vitals.systolic_bp,
          diastolic_bp: vitals.diastolic_bp,
          heart_rate: vitals.heart_rate,
          temperature: vitals.temperature,
          respiratory_rate: vitals.respiratory_rate,
          oxygen_saturation: vitals.oxygen_saturation,
          measured_at: vitals.measured_at,
        };

        // Calculate status
        vitalData.status = getVitalStatus(vitalData);

        setVitalSigns(vitalData);
      }
    } catch (err) {
      console.error('Error fetching vital signs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vital signs');
      setVitalSigns(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchVitalSigns();
  }, [fetchVitalSigns]);

  // Helper method to add new vital signs (for self-reporting)
  const addVitalSigns = useCallback(async (vitals: Omit<VitalSigns, 'status' | 'measured_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error('Patient record not found');

      const { error: insertError } = await supabase
        .from('patient_vital_signs')
        .insert({
          patient_id: patient.id,
          systolic_bp: vitals.systolic_bp,
          diastolic_bp: vitals.diastolic_bp,
          heart_rate: vitals.heart_rate,
          temperature: vitals.temperature,
          respiratory_rate: vitals.respiratory_rate,
          oxygen_saturation: vitals.oxygen_saturation,
          measurement_method: 'self_reported',
          measured_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Refresh data
      await fetchVitalSigns();
    } catch (err) {
      console.error('Error adding vital signs:', err);
      throw err;
    }
  }, [supabase, fetchVitalSigns]);

  return {
    vitalSigns,
    loading,
    error,
    tableExists,
    refetch: fetchVitalSigns,
    addVitalSigns,
  };
}
