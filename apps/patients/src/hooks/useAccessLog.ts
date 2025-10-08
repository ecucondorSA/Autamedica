'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface AccessLogEntry {
  id: string;
  doctor_name?: string;
  doctor_specialty?: string;
  action_type: string;
  table_name: string;
  created_at: string;
  view_count?: number;
}

export interface DoctorAccessSummary {
  doctor_name: string;
  specialty: string;
  views: number;
}

export function useAccessLog() {
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [doctorSummaries, setDoctorSummaries] = useState<DoctorAccessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAccessLogs = useCallback(async () => {
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

      // Fetch audit logs for this patient
      const { data: logs, error: logsError } = await supabase
        .from('medical_audit_log')
        .select(`
          id,
          user_id,
          action_type,
          table_name,
          created_at
        `)
        .eq('patient_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // For each log entry, get doctor information if available
      const logsWithDoctorInfo = await Promise.all(
        (logs || []).map(async (log) => {
          // Try to get doctor info from user_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', log.user_id)
            .single();

          const { data: doctor } = await supabase
            .from('doctors')
            .select('specialty')
            .eq('user_id', log.user_id)
            .single();

          return {
            ...log,
            doctor_name: profile
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
              : undefined,
            doctor_specialty: doctor?.specialty,
          };
        })
      );

      setAccessLogs(logsWithDoctorInfo);

      // Create doctor access summaries (group by doctor)
      const summaryMap = new Map<string, DoctorAccessSummary>();

      logsWithDoctorInfo.forEach((log) => {
        if (log.doctor_name && log.doctor_specialty) {
          const key = log.user_id;
          const existing = summaryMap.get(key);

          if (existing) {
            existing.views += 1;
          } else {
            summaryMap.set(key, {
              doctor_name: log.doctor_name,
              specialty: log.doctor_specialty,
              views: 1,
            });
          }
        }
      });

      setDoctorSummaries(Array.from(summaryMap.values()));
    } catch (err) {
      console.error('Error fetching access logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch access logs');
      setAccessLogs([]);
      setDoctorSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAccessLogs();
  }, [fetchAccessLogs]);

  return {
    accessLogs,
    doctorSummaries,
    loading,
    error,
    refetch: fetchAccessLogs,
  };
}
