-- 2025-09-29: Introduce normalized organization + role system
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure helper exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- Core tables
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE DEFAULT concat('org-', replace(uuid_generate_v4()::text, '-', '')),
    name TEXT NOT NULL,
    legal_name TEXT,
    tax_id TEXT,
    type TEXT CHECK (type IN ('company', 'clinic', 'provider', 'partner', 'internal')) DEFAULT 'company',
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    address JSONB,
    contact JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.org_members (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'billing', 'support')) DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'revoked')),
    invited_by UUID REFERENCES public.profiles(id),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (organization_id, profile_id)
);

DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.org_members;
CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON public.org_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'company', 'company_admin', 'organization_admin', 'admin', 'platform_admin')),
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_global_role
    ON public.user_roles (profile_id, role)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_org_role
    ON public.user_roles (profile_id, organization_id, role)
    WHERE organization_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Compatibility with legacy company tables
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'patients'
          AND column_name = 'company_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.patients RENAME COLUMN company_id TO organization_id';
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'appointments'
          AND column_name = 'company_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.appointments RENAME COLUMN company_id TO organization_id';
    END IF;
END
$$;

DO $$
DECLARE
    companies_exists BOOLEAN := to_regclass('public.companies') IS NOT NULL;
BEGIN
    IF companies_exists THEN
        INSERT INTO public.organizations (id, owner_profile_id, name, legal_name, tax_id, industry, size, address, contact, metadata, is_active)
        SELECT
            c.id,
            c.owner_profile_id,
            c.name,
            NULL,
            c.tax_id,
            c.industry,
            c.size,
            c.address,
            c.contact,
            '{}'::JSONB,
            COALESCE(c.is_active, TRUE)
        FROM public.companies c
        ON CONFLICT (id) DO UPDATE
          SET owner_profile_id = EXCLUDED.owner_profile_id,
              name = EXCLUDED.name,
              tax_id = COALESCE(EXCLUDED.tax_id, public.organizations.tax_id),
              industry = COALESCE(EXCLUDED.industry, public.organizations.industry),
              size = COALESCE(EXCLUDED.size, public.organizations.size),
              address = COALESCE(EXCLUDED.address, public.organizations.address),
              contact = COALESCE(EXCLUDED.contact, public.organizations.contact),
              metadata = COALESCE(EXCLUDED.metadata, public.organizations.metadata),
              is_active = COALESCE(EXCLUDED.is_active, public.organizations.is_active);
    END IF;
END
$$;

DO $$
DECLARE
    members_exists BOOLEAN := to_regclass('public.company_members') IS NOT NULL;
BEGIN
    IF members_exists THEN
        INSERT INTO public.org_members (organization_id, profile_id, role, status)
        SELECT
            cm.company_id,
            cm.profile_id,
            CASE
                WHEN cm.role = 'company_admin' THEN 'owner'
                WHEN cm.role = 'manager' THEN 'admin'
                ELSE 'member'
            END,
            'active'
        FROM public.company_members cm
        ON CONFLICT (organization_id, profile_id) DO UPDATE
          SET role = EXCLUDED.role;
    END IF;
END
$$;

WITH slugged AS (
    SELECT
        id,
        lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g')) AS base_slug,
        row_number() OVER (
            PARTITION BY lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g'))
            ORDER BY created_at
        ) AS slug_index
    FROM public.organizations
)
UPDATE public.organizations o
SET slug = CASE
        WHEN o.slug IS NOT NULL AND o.slug <> '' THEN o.slug
        WHEN slugged.base_slug = '' THEN concat('org-', left(o.id::text, 8))
        WHEN slugged.slug_index = 1 THEN slugged.base_slug
        ELSE slugged.base_slug || '-' || slugged.slug_index
    END
FROM slugged
WHERE o.id = slugged.id
  AND (o.slug IS NULL OR o.slug = '');

-- --------------------------------------------------------------------------
-- Role backfill
-- --------------------------------------------------------------------------

UPDATE public.profiles
SET role = 'organization_admin',
    updated_at = NOW()
WHERE role = 'company_admin';

INSERT INTO public.user_roles (id, profile_id, organization_id, role, granted_by)
SELECT
    uuid_generate_v4(),
    p.id,
    NULL,
    CASE
        WHEN p.role = 'platform_admin' THEN 'platform_admin'
        WHEN p.role = 'admin' THEN 'admin'
        WHEN p.role = 'organization_admin' THEN 'organization_admin'
        WHEN p.role = 'company_admin' THEN 'organization_admin'
        WHEN p.role = 'company' THEN 'company'
        WHEN p.role = 'doctor' THEN 'doctor'
        ELSE 'patient'
    END,
    p.id
FROM public.profiles p
ON CONFLICT (profile_id, role) DO NOTHING;

INSERT INTO public.user_roles (id, profile_id, organization_id, role, granted_by)
SELECT
    uuid_generate_v4(),
    om.profile_id,
    om.organization_id,
    CASE
        WHEN om.role IN ('owner', 'admin') THEN 'organization_admin'
        ELSE 'company'
    END,
    om.invited_by
FROM public.org_members om
ON CONFLICT (profile_id, organization_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.select_primary_role_for_profile(target_profile_id UUID)
RETURNS TEXT AS $$
DECLARE
    selected_role TEXT;
BEGIN
    SELECT ur.role
    INTO selected_role
    FROM public.user_roles ur
    WHERE ur.profile_id = target_profile_id
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ORDER BY CASE ur.role
        WHEN 'platform_admin' THEN 100
        WHEN 'admin' THEN 90
        WHEN 'organization_admin' THEN 80
        WHEN 'company_admin' THEN 75
        WHEN 'company' THEN 70
        WHEN 'doctor' THEN 60
        WHEN 'patient' THEN 50
        ELSE 0
    END DESC,
    ur.granted_at DESC
    LIMIT 1;

    RETURN COALESCE(selected_role, 'patient');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.sync_profile_primary_role()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET role = public.select_primary_role_for_profile(OLD.profile_id),
            updated_at = NOW()
        WHERE id = OLD.profile_id;
        RETURN OLD;
    END IF;

    UPDATE public.profiles
    SET role = public.select_primary_role_for_profile(NEW.profile_id),
        updated_at = NOW()
    WHERE id = NEW.profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_profile_role_after_user_roles ON public.user_roles;
CREATE TRIGGER sync_profile_role_after_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_primary_role();

-- --------------------------------------------------------------------------
-- RLS configuration
-- --------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organization owners manage organization" ON public.organizations;
CREATE POLICY "Organization owners manage organization"
ON public.organizations
FOR ALL
TO authenticated
USING (
    owner_profile_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.org_members om
        WHERE om.organization_id = public.organizations.id
          AND om.profile_id = auth.uid()
          AND om.role IN ('owner', 'admin')
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'platform_admin')
    )
)
WITH CHECK (
    owner_profile_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.org_members om
        WHERE om.organization_id = public.organizations.id
          AND om.profile_id = auth.uid()
          AND om.role IN ('owner', 'admin')
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'platform_admin')
    )
);

DROP POLICY IF EXISTS "Org members read" ON public.org_members;
CREATE POLICY "Org members read"
ON public.org_members
FOR SELECT
TO authenticated
USING (
    profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'platform_admin')
    )
);

DROP POLICY IF EXISTS "Org members manage" ON public.org_members;
CREATE POLICY "Org members manage"
ON public.org_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.org_members owner
        WHERE owner.organization_id = public.org_members.organization_id
          AND owner.profile_id = auth.uid()
          AND owner.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.org_members owner
        WHERE owner.organization_id = public.org_members.organization_id
          AND owner.profile_id = auth.uid()
          AND owner.role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS "User roles read" ON public.user_roles;
CREATE POLICY "User roles read"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'platform_admin')
    )
);

COMMIT;
