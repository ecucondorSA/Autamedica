'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@autamedica/auth';
import type {
  Anamnesis,
  AnamnesisSection,
  AnamnesisSectionData,
  AnamnesisProgressResponse,
  AnamnesisInsert,
  AnamnesisUpdate,
} from '@autamedica/types';
import { logger } from '@autamedica/shared';

interface UseAnamnesisReturn {
  anamnesis: Anamnesis | null;
  sections: AnamnesisSectionData[];
  progress: AnamnesisProgressResponse | null;
  loading: boolean;
  error: string | null;
  createAnamnesis: () => Promise<Anamnesis | null>;
  updateAnamnesis: (update: AnamnesisUpdate) => Promise<boolean>;
  updateSection: (section: AnamnesisSection, data: any) => Promise<boolean>;
  refreshAnamnesis: () => Promise<void>;
}

/**
 * Hook para gestionar la anamnesis del paciente
 *
 * @example
 * ```tsx
 * const { anamnesis, sections, progress, updateSection } = useAnamnesis();
 *
 * const handleSaveSection = async (sectionName, data) => {
 *   await updateSection(sectionName, data);
 * };
 * ```
 */
export function useAnamnesis(): UseAnamnesisReturn {
  const supabase = useSupabase();
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [sections, setSections] = useState<AnamnesisSectionData[]>([]);
  const [progress, setProgress] = useState<AnamnesisProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch anamnesis data
  const fetchAnamnesis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Fetch anamnesis
      const { data: anamnesisData, error: anamnesisError } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('patient_id', user.id)
        .is('deleted_at', null)
        .single();

      if (anamnesisError && anamnesisError.code !== 'PGRST116') {
        throw anamnesisError;
      }

      if (!anamnesisData) {
        setAnamnesis(null);
        setSections([]);
        setProgress(null);
        return;
      }

      setAnamnesis(anamnesisData as unknown as Anamnesis);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('anamnesis_sections')
        .select('*')
        .eq('anamnesis_id', anamnesisData.id)
        .order('section');

      if (sectionsError) throw sectionsError;

      setSections((sectionsData || []) as unknown as AnamnesisSectionData[]);

      // Calculate progress
      const completedSections = (sectionsData || []).filter((s: any) => s.completed);
      const totalSections = 13; // From SECTION_ORDER
      const completionPercentage = Math.floor((completedSections.length / totalSections) * 100);

      const allSections: AnamnesisSection[] = [
        'personal_data',
        'emergency_contact',
        'medical_history',
        'family_history',
        'allergies',
        'current_medications',
        'chronic_conditions',
        'surgical_history',
        'hospitalizations',
        'gynecological_history',
        'lifestyle',
        'mental_health',
        'consent',
      ];

      const completedSectionNames = new Set(completedSections.map((s: any) => s.section));
      const pendingSections = allSections.filter(section => !completedSectionNames.has(section));

      setProgress({
        anamnesis_id: anamnesisData.id,
        completion_percentage: completionPercentage,
        completed_sections: completedSections.map((s: any) => s.section),
        pending_sections: pendingSections,
        total_sections: totalSections,
        estimated_time_remaining_minutes: pendingSections.length * 5,
      });
    } catch (err) {
      logger.error('Error fetching anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Create new anamnesis
  const createAnamnesis = useCallback(async (): Promise<Anamnesis | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return null;
      }

      const newAnamnesis: AnamnesisInsert = {
        patient_id: user.id as any,
        status: 'in_progress',
        completion_percentage: 0,
        sections_status: {},
      };

      const { data, error: insertError } = await supabase
        .from('anamnesis')
        .insert(newAnamnesis)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchAnamnesis();
      return data as unknown as Anamnesis;
    } catch (err) {
      logger.error('Error creating anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al crear anamnesis');
      return null;
    }
  }, [supabase, fetchAnamnesis]);

  // Update anamnesis
  const updateAnamnesis = useCallback(async (update: AnamnesisUpdate): Promise<boolean> => {
    try {
      if (!anamnesis) return false;

      const { error: updateError } = await supabase
        .from('anamnesis')
        .update(update)
        .eq('id', anamnesis.id);

      if (updateError) throw updateError;

      await fetchAnamnesis();
      return true;
    } catch (err) {
      logger.error('Error updating anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar anamnesis');
      return false;
    }
  }, [anamnesis, supabase, fetchAnamnesis]);

  // Update section
  const updateSection = useCallback(async (
    section: AnamnesisSection,
    data: any
  ): Promise<boolean> => {
    try {
      if (!anamnesis) return false;

      // Upsert section data
      const { error: upsertError } = await supabase
        .from('anamnesis_sections')
        .upsert({
          anamnesis_id: anamnesis.id,
          section,
          data,
          completed: true,
          last_modified: new Date().toISOString(),
        }, {
          onConflict: 'anamnesis_id,section'
        });

      if (upsertError) throw upsertError;

      // Update anamnesis completion
      const completedCount = sections.filter(s => s.completed).length + 1;
      const totalSections = 13;
      const completionPercentage = Math.floor((completedCount / totalSections) * 100);

      await updateAnamnesis({
        completion_percentage: completionPercentage,
        last_updated_section: section,
        status: completionPercentage === 100 ? 'completed' : 'in_progress',
      });

      return true;
    } catch (err) {
      logger.error('Error updating section:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar sección');
      return false;
    }
  }, [anamnesis, sections, supabase, updateAnamnesis]);

  // Refresh data
  const refreshAnamnesis = useCallback(async () => {
    await fetchAnamnesis();
  }, [fetchAnamnesis]);

  // Initial fetch
  useEffect(() => {
    fetchAnamnesis();
  }, [fetchAnamnesis]);

  return {
    anamnesis,
    sections,
    progress,
    loading,
    error,
    createAnamnesis,
    updateAnamnesis,
    updateSection,
    refreshAnamnesis,
  };
}
