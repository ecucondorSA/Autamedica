import { useState, useEffect, useCallback } from 'react';
import type {
  HealthCenter,
  HealthCenterWithDistance,
  HealthCenterSearchFilters,
  Coordinates
} from '@autamedica/types';
import { calculateDistance, sortByDistance, formatDistance, estimateTravelTime } from '@autamedica/types';
import { createClient } from '@/lib/supabase';

interface UseHealthCentersOptions {
  filters?: HealthCenterSearchFilters;
  autoDetectLocation?: boolean;
}

interface UseHealthCentersResult {
  centers: HealthCenterWithDistance[];
  isLoading: boolean;
  error: string | null;
  userLocation: Coordinates | null;
  requestLocation: () => Promise<void>;
  searchNearby: (location: Coordinates, radiusKm?: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useHealthCentersGeolocation(
  options: UseHealthCentersOptions = {}
): UseHealthCentersResult {
  const [centers, setCenters] = useState<HealthCenterWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Request user's location
  const requestLocation = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada por este navegador');
      }

      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setUserLocation(coords);
            resolve();
          },
          (err) => {
            console.error('Error getting location:', err);
            setError('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.');
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
    } catch (err) {
      console.error('Geolocation error:', err);
      setError(err instanceof Error ? err.message : 'Error de geolocalización');
    }
  }, []);

  // Search nearby centers
  const searchNearby = useCallback(async (
    location: Coordinates,
    radiusKm: number = 50
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Build query
      let query = supabase
        .from('health_centers')
        .select('*')
        .eq('offers_ive_ile', true);

      // Apply filters
      if (options.filters?.type && options.filters.type.length > 0) {
        query = query.in('type', options.filters.type);
      }

      if (options.filters?.offers_medication_method !== undefined) {
        query = query.eq('offers_medication_method', options.filters.offers_medication_method);
      }

      if (options.filters?.offers_surgical_method !== undefined) {
        query = query.eq('offers_surgical_method', options.filters.offers_surgical_method);
      }

      if (options.filters?.accepts_walk_ins !== undefined) {
        query = query.eq('accepts_walk_ins', options.filters.accepts_walk_ins);
      }

      if (options.filters?.has_24h_service !== undefined) {
        query = query.eq('has_24h_service', options.filters.has_24h_service);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Calculate distances and filter by radius
      const centersWithDistance: HealthCenterWithDistance[] = (data || [])
        .map((center: any) => {
          const centerCoords: Coordinates = {
            latitude: center.coordinates.latitude,
            longitude: center.coordinates.longitude
          };

          const distance = calculateDistance(location, centerCoords);

          return {
            ...center,
            distance_km: Number(distance.toFixed(2)),
            travel_time_minutes: estimateTravelTime(distance, 'driving')
          } as HealthCenterWithDistance;
        })
        .filter(center => {
          const maxDistance = options.filters?.max_distance_km || radiusKm;
          return center.distance_km <= maxDistance;
        });

      // Sort by distance
      const sortedCenters = sortByDistance(centersWithDistance);

      // Apply max results limit
      const maxResults = 10;
      const limitedCenters = sortedCenters.slice(0, maxResults);

      setCenters(limitedCenters);
    } catch (err) {
      console.error('Error searching health centers:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [options.filters]);

  // Fetch all centers (fallback when no location available)
  const fetchAllCenters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      let query = supabase
        .from('health_centers')
        .select('*')
        .eq('offers_ive_ile', true)
        .limit(10);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Map to HealthCenterWithDistance (distance_km = 0 when no location)
      const centersData: HealthCenterWithDistance[] = (data || []).map((center: any) => ({
        ...center,
        distance_km: 0,
        travel_time_minutes: undefined
      }));

      setCenters(centersData);
    } catch (err) {
      console.error('Error fetching health centers:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (userLocation) {
      await searchNearby(userLocation);
    } else {
      await fetchAllCenters();
    }
  }, [userLocation, searchNearby, fetchAllCenters]);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    const initLocation = async () => {
      if (options.autoDetectLocation) {
        try {
          await requestLocation();
        } catch (err) {
          // Fallback to all centers if location denied
          await fetchAllCenters();
        }
      } else {
        await fetchAllCenters();
      }
    };

    initLocation();
  }, [options.autoDetectLocation, requestLocation, fetchAllCenters]);

  // Search nearby when location is available
  useEffect(() => {
    if (userLocation) {
      searchNearby(userLocation);
    }
  }, [userLocation, searchNearby]);

  return {
    centers,
    isLoading,
    error,
    userLocation,
    requestLocation,
    searchNearby,
    refetch
  };
}

// Hook para obtener detalles de un centro específico
export function useHealthCenterById(centerId: string | null) {
  const [center, setCenter] = useState<HealthCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!centerId) {
      setCenter(null);
      setIsLoading(false);
      return;
    }

    const fetchCenter = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('health_centers')
          .select('*')
          .eq('id', centerId)
          .single();

        if (fetchError) throw fetchError;

        setCenter(data as HealthCenter);
      } catch (err) {
        console.error('Error fetching health center:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCenter();
  }, [centerId]);

  return { center, isLoading, error };
}

// Helper para formatear información del centro
export function formatHealthCenterInfo(center: HealthCenterWithDistance) {
  return {
    name: center.name,
    type: getHealthCenterTypeLabel(center.type),
    address: formatAddressForDisplay(center.address),
    distance: formatDistance(center.distance_km),
    travelTime: center.travel_time_minutes
      ? `${center.travel_time_minutes} min`
      : undefined,
    phone: center.phone,
    methods: {
      medication: center.offers_medication_method,
      surgical: center.offers_surgical_method
    },
    features: {
      walkIns: center.accepts_walk_ins,
      service24h: center.has_24h_service,
      psychologicalSupport: center.offers_psychological_support
    }
  };
}

function getHealthCenterTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    public_hospital: 'Hospital Público',
    health_center: 'Centro de Salud',
    caps: 'CAPS',
    clinic: 'Clínica Privada',
    ngo: 'ONG'
  };
  return labels[type] || type;
}

function formatAddressForDisplay(address: any): string {
  if (!address) return '';

  const parts = [
    address.street,
    address.number,
    address.city,
    address.state
  ].filter(Boolean);

  return parts.join(', ');
}
