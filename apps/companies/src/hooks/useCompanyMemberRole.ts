'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { type MemberRole } from '@autamedica/shared';

export const useCompanyMemberRole = (companyId: string | null) => {
  const [memberRole, setMemberRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchMemberRole = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setError(new Error('User not authenticated.'));
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('company_members')
          .select('role')
          .eq('company_id', companyId)
          .eq('user_id', user.id)
          .single();

        if (queryError) {
          throw queryError;
        }

        const role = data?.role ?? null;
        setMemberRole(role === null ? null : (role as MemberRole));
      } catch (caughtError) {
        const normalizedError = caughtError instanceof Error
          ? caughtError
          : new Error('Error desconocido al recuperar el rol de miembro');
        setError(normalizedError);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberRole();
  }, [companyId]);

  return { memberRole, loading, error };
};
