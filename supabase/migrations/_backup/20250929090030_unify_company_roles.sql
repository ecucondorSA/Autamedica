-- Migration to unify company_admin and company roles, and delegate permissions to company_members.role
-- Idempotent script.

BEGIN;

-- 1. Schema Adjustments

-- 2. Data Migration
DO $$
DECLARE
    updated_user_count integer;
    inserted_admin_count integer;
BEGIN
    -- Update ''company_admin'' to ''company'' in profiles
    WITH updated_users AS (
        UPDATE public.profiles
        SET role = 'company'
        WHERE role = 'company_admin'
        RETURNING user_id
    )
    SELECT count(*) INTO updated_user_count FROM updated_users;

    RAISE NOTICE 'Updated % users from role ''company_admin'' to ''company''.', updated_user_count;

    -- For each affected user, ensure they have an ''admin'' role in their respective companies.
    UPDATE public.company_members cm
    SET role = 'admin'
    WHERE cm.profile_id IN (
        SELECT p.user_id FROM public.profiles p WHERE p.role = 'company'
    ) AND cm.role = 'member';

    -- Heuristic: If the former company_admin owned a company but wasn''t a member, add them as admin.
    INSERT INTO public.company_members (company_id, profile_id, role)
    SELECT c.id, c.owner_profile_id, 'admin'
    FROM public.companies c
    WHERE c.owner_profile_id IN (
        SELECT p.user_id FROM public.profiles p WHERE p.role = 'company'
    )
    ON CONFLICT (company_id, profile_id) DO UPDATE SET role = 'admin';

    GET DIAGNOSTICS inserted_admin_count = ROW_COUNT;
    RAISE NOTICE 'Ensured admin rights in company_members for % former company_admins.', inserted_admin_count;
END;
$$;


-- 3. RLS Policies
-- Enable RLS on company_members if not already enabled
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Members can see other members of the same company.
DROP POLICY IF EXISTS "Allow members to see their own company members" ON public.company_members;
CREATE POLICY "Allow members to see their own company members"
ON public.company_members FOR SELECT
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.profile_id = auth.uid()
    )
);

-- Policy for CUD: Only admins of a company can manage its members.
DROP POLICY IF EXISTS "Allow admins to manage company members" ON public.company_members;
CREATE POLICY "Allow admins to manage company members"
ON public.company_members FOR ALL
USING (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.profile_id = auth.uid() AND cm.role = 'admin'
    )
)
WITH CHECK (
    company_id IN (
        SELECT cm.company_id
        FROM public.company_members cm
        WHERE cm.profile_id = auth.uid() AND cm.role = 'admin'
    )
);

COMMIT;

-- ---
-- --- ROLLBACK SCRIPT (run manually if needed)
-- ---
--
-- BEGIN;
--
-- -- 1. Revert role constraint on profiles to include ''company_admin''
-- ALTER TABLE public.profiles
-- DROP CONSTRAINT IF EXISTS profiles_role_check;
--
-- ALTER TABLE public.profiles
-- ADD CONSTRAINT profiles_role_check CHECK (role IN ('patient', 'doctor', 'company', 'company_admin', 'organization_admin'));
--
-- RAISE NOTICE 'Reverted profiles.role constraint to include ''company_admin''.';
--
-- -- 2. Restore ''company_admin'' role for users who are company admins
-- -- This identifies users who are admins in any company and sets their global role back.
-- CREATE TEMP TABLE users_to_revert AS
-- SELECT DISTINCT user_id
-- FROM public.company_members
-- WHERE role = 'admin';
--
-- UPDATE public.profiles
-- SET role = 'company_admin'
-- WHERE user_id IN (SELECT user_id FROM users_to_revert);
--
-- RAISE NOTICE 'Restored global role to ''company_admin'' for % users.', (SELECT count(*) FROM users_to_revert);
--
-- DROP TABLE users_to_revert;
--
-- -- Note: RLS policies are not reverted automatically. The old policies would need to be reapplied if they were different.
-- -- The changes to company_members.role (member -> admin) are NOT reverted, as this could be a desired state.
-- -- The rollback is focused on restoring the global role distinction.
--
-- COMMIT;
-- ---
