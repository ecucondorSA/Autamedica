import { useState, useEffect, useCallback } from 'react';
import type {
  ReproductiveHealthSpecialistWithProfile,
  ReproductiveHealthSpecialtyType,
  SpecialistAvailabilityStatus
} from '@autamedica/types';
import { useSupabase } from '@autamedica/auth/react';
import { logger } from '@autamedica/shared';

interface UseSpecialistsOptions {
  specialty?: ReproductiveHealthSpecialtyType;
  availableOnly?: boolean;
  certifiedOnly?: boolean;
}

interface UseSpecialistsResult {
  specialists: ReproductiveHealthSpecialistWithProfile[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReproductiveHealthSpecialists(
  options: UseSpecialistsOptions = {}
): UseSpecialistsResult {
  const supabase = useSupabase();
  const [specialists, setSpecialists] = useState<ReproductiveHealthSpecialistWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('reproductive_health_specialists')
        .select(`
          *,
          doctor:doctors!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            profile_image_url
          )
        `);

      // Apply filters
      if (options.specialty) {
        query = query.eq('specialty', options.specialty);
      }

      if (options.availableOnly) {
        query = query.eq('availability_status', 'available');
      }

      if (options.certifiedOnly) {
        query = query.eq('is_certified_ive_ile', true);
      }

      // Order by rating and consultations
      query = query.order('rating', { ascending: false });
      query = query.order('total_consultations', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match interface
      const transformedData: ReproductiveHealthSpecialistWithProfile[] = (data || []).map((item: any) => ({
        id: item.id,
        doctor_id: item.doctor_id,
        specialty: item.specialty,
        is_certified_ive_ile: item.is_certified_ive_ile,
        availability_status: item.availability_status,
        accepts_emergency_consultations: item.accepts_emergency_consultations,
        rating: item.rating,
        total_consultations: item.total_consultations,
        years_of_experience: item.years_of_experience,
        languages: item.languages || ['es'],
        bio: item.bio || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
        first_name: item.doctor?.first_name || '',
        last_name: item.doctor?.last_name || '',
        email: item.doctor?.email || '',
        phone: item.doctor?.phone,
        profile_image_url: item.doctor?.profile_image_url
      }));

      setSpecialists(transformedData);
    } catch (err) {
      logger.error('Error fetching reproductive health specialists:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, options.specialty, options.availableOnly, options.certifiedOnly]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  return {
    specialists,
    isLoading,
    error,
    refetch: fetchSpecialists
  };
}

// Hook específico para obtener un especialista por ID
export function useSpecialistById(specialistId: string | null) {
  const supabase = useSupabase();
  const [specialist, setSpecialist] = useState<ReproductiveHealthSpecialistWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!specialistId) {
      setSpecialist(null);
      setIsLoading(false);
      return;
    }

    const fetchSpecialist = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('reproductive_health_specialists')
          .select(`
            *,
            doctor:doctors!inner (
              id,
              first_name,
              last_name,
              email,
              phone,
              profile_image_url
            )
          `)
          .eq('id', specialistId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          const transformedData: ReproductiveHealthSpecialistWithProfile = {
            id: data.id,
            doctor_id: data.doctor_id,
            specialty: data.specialty,
            is_certified_ive_ile: data.is_certified_ive_ile,
            availability_status: data.availability_status,
            accepts_emergency_consultations: data.accepts_emergency_consultations,
            rating: data.rating,
            total_consultations: data.total_consultations,
            years_of_experience: data.years_of_experience,
            languages: data.languages || ['es'],
            bio: data.bio || '',
            created_at: data.created_at,
            updated_at: data.updated_at,
            first_name: (data as any).doctor?.first_name || '',
            last_name: (data as any).doctor?.last_name || '',
            email: (data as any).doctor?.email || '',
            phone: (data as any).doctor?.phone,
            profile_image_url: (data as any).doctor?.profile_image_url
          };

          setSpecialist(transformedData);
        }
      } catch (err) {
        logger.error('Error fetching specialist:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecialist();
  }, [supabase, specialistId]);

  return { specialist, isLoading, error };
}

// Hook para actualizar estado de disponibilidad (solo para médicos)
export function useUpdateSpecialistAvailability() {
  const supabase = useSupabase();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvailability = useCallback(async (
    specialistId: string,
    status: SpecialistAvailabilityStatus
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('reproductive_health_specialists')
        .update({
          availability_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', specialistId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (err) {
      logger.error('Error updating availability:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return { success: false, error: err };
    } finally {
      setIsUpdating(false);
    }
  }, [supabase]);

  return {
    updateAvailability,
    isUpdating,
    error
  };
}
