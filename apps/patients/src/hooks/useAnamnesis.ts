'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnamnesisSection } from '@autamedica/types';
import { logger } from '@autamedica/shared';

type ApiAnamnesis = {
  id: string;
  patient_id: string;
  status: string;
  completion_percentage: number;
  sections_status: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
};

type ApiSection = {
  id: string;
  anamnesis_id: string;
  section: string;
  data: Record<string, unknown>;
  completed: boolean;
  completed_at?: string | null;
  updated_at: string;
};

type ApiProgress = {
  completion_percentage: number;
  completed_sections: string[];
  pending_sections: string[];
  total_sections: number;
};

interface ApiResponse {
  anamnesis: ApiAnamnesis;
  sections: ApiSection[];
  progress: ApiProgress;
}

export interface AnamnesisState {
  anamnesis: ApiAnamnesis | null;
  sections: ApiSection[];
  progress: ApiProgress | null;
}

interface UseAnamnesisReturn {
  anamnesis: ApiAnamnesis | null;
  sections: ApiSection[];
  progress: ApiProgress | null;
  loading: boolean;
  error: string | null;
  createAnamnesis: (initial?: Partial<ApiAnamnesis>) => Promise<ApiAnamnesis | null>;
  updateAnamnesis: (update: Partial<ApiAnamnesis>) => Promise<boolean>;
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
  const [anamnesis, setAnamnesis] = useState<ApiAnamnesis | null>(null);
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [progress, setProgress] = useState<ApiProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnamnesis = useCallback(async (): Promise<ApiResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/anamnesis', { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'No se pudo cargar la anamnesis');
      }

      const json = (await res.json()) as { ok: boolean; data: ApiResponse };
      if (!json?.ok) throw new Error('Respuesta inválida');

      setAnamnesis(json.data.anamnesis);
      setSections(json.data.sections);
      setProgress(json.data.progress);
      return json.data;
    } catch (err) {
      logger.error('Error fetching anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new anamnesis
  const createAnamnesis = useCallback(async (initial?: Partial<ApiAnamnesis>): Promise<ApiAnamnesis | null> => {
    try {
      const current = await fetchAnamnesis();
      if (initial && Object.keys(initial).length > 0) {
        await fetch('/api/anamnesis', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initial),
          credentials: 'include',
        });
        const updated = await fetchAnamnesis();
        return updated?.anamnesis ?? current?.anamnesis ?? null;
      }
      return current?.anamnesis ?? null;
    } catch (err) {
      logger.error('Error creating anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al crear anamnesis');
      return null;
    }
  }, [fetchAnamnesis]);

  // Update anamnesis
  const updateAnamnesis = useCallback(async (update: Partial<ApiAnamnesis>): Promise<boolean> => {
    try {
      const res = await fetch('/api/anamnesis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Error al actualizar anamnesis');
      }
      await fetchAnamnesis();
      return true;
    } catch (err) {
      logger.error('Error updating anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar anamnesis');
      return false;
    }
  }, [fetchAnamnesis]);

  // Update section
  const updateSection = useCallback(async (
    section: AnamnesisSection,
    data: any
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: section, data, completed: true }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Error al actualizar sección');
      }
      const json = await res.json().catch(() => null);
      if (json?.data?.progress) {
        setProgress(json.data.progress);
      }
      await fetchAnamnesis();
      return true;
    } catch (err) {
      logger.error('Error updating section:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar sección');
      return false;
    }
  }, [fetchAnamnesis]);

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
