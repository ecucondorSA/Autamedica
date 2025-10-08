-- Migration: Medical Record Authorizations for Restricted Access
-- Date: 2025-10-04
-- Purpose: Enable explicit authorization mechanism for visibility='restricted' medical records

-- =====================================================
-- 1. Create medical_record_authorizations table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.medical_record_authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  authorized_user_id UUID NOT NULL,
  authorized_by_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

  -- Constraints
  CONSTRAINT valid_authorization_period CHECK (valid_until > created_at),
  CONSTRAINT non_empty_reason CHECK (LENGTH(TRIM(reason)) > 10)
);

COMMENT ON TABLE public.medical_record_authorizations IS
'Explicit authorizations for accessing medical records with visibility=''restricted''. Required for HIPAA compliance.';

COMMENT ON COLUMN public.medical_record_authorizations.record_id IS
'Medical record being authorized for access';

COMMENT ON COLUMN public.medical_record_authorizations.authorized_user_id IS
'User being granted access (doctor, admin, etc.)';

COMMENT ON COLUMN public.medical_record_authorizations.authorized_by_user_id IS
'User who granted the authorization (must be doctor who created record or admin)';

COMMENT ON COLUMN public.medical_record_authorizations.reason IS
'Required justification for access (minimum 10 characters)';

COMMENT ON COLUMN public.medical_record_authorizations.valid_until IS
'Authorization expiration timestamp (temporary access only)';

COMMENT ON COLUMN public.medical_record_authorizations.revoked_at IS
'Timestamp when authorization was revoked. NULL = active authorization.';

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================

-- Primary query pattern: Check if user has active authorization for a record
CREATE INDEX idx_medical_record_authorizations_record_user
ON public.medical_record_authorizations(record_id, authorized_user_id, valid_until)
WHERE revoked_at IS NULL;

-- Audit query pattern: Find all authorizations by granter
CREATE INDEX idx_medical_record_authorizations_by_granter
ON public.medical_record_authorizations(authorized_by_user_id, created_at DESC);

-- Cleanup query pattern: Find expired authorizations
CREATE INDEX idx_medical_record_authorizations_expired
ON public.medical_record_authorizations(valid_until)
WHERE revoked_at IS NULL AND valid_until < NOW();

-- =====================================================
-- 3. Enable RLS
-- =====================================================
ALTER TABLE public.medical_record_authorizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS Policies
-- =====================================================

-- SELECT: Users can see authorizations where they are involved
CREATE POLICY "medical_record_authorizations_select_policy"
ON public.medical_record_authorizations
FOR SELECT
USING (
  -- User is the one authorized
  authorized_user_id = auth.uid()

  -- Or user is the one who granted authorization
  OR authorized_by_user_id = auth.uid()

  -- Or user is platform admin
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )

  -- Or user is the doctor who created the medical record
  OR EXISTS (
    SELECT 1 FROM public.medical_records mr
    WHERE mr.id = record_id
    AND mr.doctor_id = auth.uid()
  )
);

-- INSERT: Only doctor who created record or platform admin can grant authorization
CREATE POLICY "medical_record_authorizations_insert_policy"
ON public.medical_record_authorizations
FOR INSERT
WITH CHECK (
  -- User must be the one granting (authorized_by_user_id)
  authorized_by_user_id = auth.uid()

  AND (
    -- User is the doctor who created the record
    EXISTS (
      SELECT 1 FROM public.medical_records mr
      WHERE mr.id = record_id
      AND mr.doctor_id = auth.uid()
    )

    -- Or user is platform admin
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'platform_admin'
    )
  )

  -- Cannot authorize yourself (conflict of interest)
  AND authorized_user_id != auth.uid()

  -- Record must exist and not be deleted
  AND EXISTS (
    SELECT 1 FROM public.medical_records mr
    WHERE mr.id = record_id
    AND mr.deleted_at IS NULL
  )
);

-- UPDATE: Only to revoke authorization (set revoked_at)
CREATE POLICY "medical_record_authorizations_update_policy"
ON public.medical_record_authorizations
FOR UPDATE
USING (
  -- User is the one who granted authorization
  authorized_by_user_id = auth.uid()

  -- Or user is platform admin
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
)
WITH CHECK (
  -- Can only revoke (set revoked_at), cannot un-revoke
  (OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL)

  -- Cannot modify other fields
  AND OLD.id = NEW.id
  AND OLD.record_id = NEW.record_id
  AND OLD.authorized_user_id = NEW.authorized_user_id
  AND OLD.authorized_by_user_id = NEW.authorized_by_user_id
  AND OLD.reason = NEW.reason
  AND OLD.valid_until = NEW.valid_until
  AND OLD.created_at = NEW.created_at
);

-- DELETE: No hard deletes allowed (audit trail)
CREATE POLICY "medical_record_authorizations_delete_policy"
ON public.medical_record_authorizations
FOR DELETE
USING (false);

-- =====================================================
-- 5. Trigger: Auto-revoke expired authorizations
-- =====================================================
CREATE OR REPLACE FUNCTION public.auto_revoke_expired_authorizations()
RETURNS void AS $$
BEGIN
  UPDATE public.medical_record_authorizations
  SET revoked_at = NOW()
  WHERE revoked_at IS NULL
  AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.auto_revoke_expired_authorizations IS
'Auto-revoke expired authorizations. Should be called via pg_cron or similar scheduler.';

-- =====================================================
-- 6. Trigger: Audit log for authorization changes
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_authorization_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log to audit_logs table
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    'medical_record_authorization',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'record_id', COALESCE(NEW.record_id, OLD.record_id),
      'authorized_user_id', COALESCE(NEW.authorized_user_id, OLD.authorized_user_id),
      'authorized_by_user_id', COALESCE(NEW.authorized_by_user_id, OLD.authorized_by_user_id),
      'reason', COALESCE(NEW.reason, OLD.reason),
      'valid_until', COALESCE(NEW.valid_until, OLD.valid_until),
      'revoked_at', COALESCE(NEW.revoked_at, OLD.revoked_at),
      'operation_type', TG_OP
    ),
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_authorization_changes ON public.medical_record_authorizations;

CREATE TRIGGER trigger_log_authorization_changes
AFTER INSERT OR UPDATE ON public.medical_record_authorizations
FOR EACH ROW
EXECUTE FUNCTION public.log_authorization_changes();

-- =====================================================
-- 7. Helper functions
-- =====================================================

-- Check if user has active authorization for a record
CREATE OR REPLACE FUNCTION public.has_active_authorization(
  p_record_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.medical_record_authorizations
    WHERE record_id = p_record_id
    AND authorized_user_id = p_user_id
    AND revoked_at IS NULL
    AND valid_until > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_active_authorization IS
'Check if a user has active (non-revoked, non-expired) authorization for a medical record';

-- Grant authorization helper
CREATE OR REPLACE FUNCTION public.grant_medical_record_authorization(
  p_record_id UUID,
  p_authorized_user_id UUID,
  p_reason TEXT,
  p_valid_for_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  v_authorization_id UUID;
BEGIN
  INSERT INTO public.medical_record_authorizations (
    record_id,
    authorized_user_id,
    authorized_by_user_id,
    reason,
    valid_until
  ) VALUES (
    p_record_id,
    p_authorized_user_id,
    auth.uid(),
    p_reason,
    NOW() + (p_valid_for_hours || ' hours')::INTERVAL
  )
  RETURNING id INTO v_authorization_id;

  RETURN v_authorization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.grant_medical_record_authorization IS
'Helper function to grant authorization for a medical record. Default validity: 24 hours.';

-- Revoke authorization helper
CREATE OR REPLACE FUNCTION public.revoke_medical_record_authorization(
  p_authorization_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.medical_record_authorizations
  SET revoked_at = NOW()
  WHERE id = p_authorization_id
  AND revoked_at IS NULL
  AND (
    authorized_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'platform_admin'
    )
  );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.revoke_medical_record_authorization IS
'Helper function to revoke an authorization. Only granter or admin can revoke.';

-- =====================================================
-- 8. Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON public.medical_record_authorizations TO authenticated;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- This migration creates the authorization system for restricted medical records:
--
-- 1. Table Structure:
--    - Explicit authorizations with expiration
--    - Audit trail (created_at, revoked_at)
--    - Justification required (reason)
--
-- 2. RLS Policies:
--    - Only record creator or admin can grant authorization
--    - Cannot authorize yourself
--    - Update only to revoke (immutable otherwise)
--    - No hard deletes (audit compliance)
--
-- 3. Automation:
--    - Auto-revoke expired authorizations
--    - Audit logging for all changes
--    - Helper functions for common operations
--
-- 4. HIPAA Compliance:
--    - Minimum necessary access (temporary authorizations)
--    - Justification required (reason field)
--    - Complete audit trail
--    - Cannot delete or modify past authorizations
--
-- 5. Usage Example:
--    ```sql
--    -- Grant authorization (24 hours by default)
--    SELECT grant_medical_record_authorization(
--      '123e4567-e89b-12d3-a456-426614174000',  -- record_id
--      '987fcdeb-51a2-43f1-b5e3-987654321098',  -- authorized_user_id
--      'Emergency consultation - patient consent obtained',
--      48  -- valid_for_hours
--    );
--
--    -- Check authorization
--    SELECT has_active_authorization('123e4567-e89b-12d3-a456-426614174000');
--
--    -- Revoke authorization
--    SELECT revoke_medical_record_authorization('auth-id-here');
--    ```
