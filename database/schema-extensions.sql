-- AutaMedica Database Schema Extensions
-- Transactional Tables for Business Operations
-- Generated: 2025-09-20

-- ============================================================================
-- BILLING & PAYMENT TRANSACTIONS
-- ============================================================================

-- --------------------------------------------------------------------------
-- Billing accounts - Links organizations and patients to billing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR CHECK (entity_type IN ('patient', 'organization')) NOT NULL,
    entity_id UUID NOT NULL, -- References either patient or organization
    billing_name VARCHAR NOT NULL,
    billing_email VARCHAR NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method JSONB, -- Encrypted payment method details
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.billing_accounts ENABLE ROW LEVEL SECURITY;

-- Patients can view own billing account
CREATE POLICY "Patients view own billing" ON public.billing_accounts
FOR SELECT USING (
    entity_type = 'patient' AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = entity_id AND p.user_id = auth.uid()
    )
);

-- Organization admins can view organization billing
CREATE POLICY "Organizations view own billing" ON public.billing_accounts
FOR SELECT USING (
    entity_type = 'organization' AND EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = entity_id 
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Platform admins can view all billing
CREATE POLICY "Admins manage billing accounts" ON public.billing_accounts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_billing_accounts_updated_at
    BEFORE UPDATE ON public.billing_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.billing_accounts TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.billing_accounts;

COMMENT ON TABLE public.billing_accounts IS 'Billing information for patients and organizations';

-- --------------------------------------------------------------------------
-- Invoices - Medical service billing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR UNIQUE NOT NULL,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    
    -- Invoice details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status tracking
    status VARCHAR CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')) DEFAULT 'draft',
    payment_terms VARCHAR DEFAULT '30 days',
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Patients can view their invoices
CREATE POLICY "Patients view own invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
);

-- Doctors can view invoices for their services
CREATE POLICY "Doctors view service invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.doctors d
        WHERE d.id = doctor_id AND d.user_id = auth.uid()
    )
);

-- Organization admins can view invoices for their organization
CREATE POLICY "Organizations view invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.billing_accounts ba
        JOIN public.org_members cm ON cm.organization_id = ba.entity_id
        WHERE ba.id = billing_account_id
          AND ba.entity_type = 'organization'
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Admins can manage all invoices
CREATE POLICY "Admins manage invoices" ON public.invoices
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

COMMENT ON TABLE public.invoices IS 'Medical service invoices and billing records';

-- --------------------------------------------------------------------------
-- Invoice line items - Detailed billing items
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_code VARCHAR, -- CPT or internal service code
    description VARCHAR NOT NULL,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice items inherit access from parent invoice
CREATE POLICY "Invoice items inherit access" ON public.invoice_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_id
    )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_items;

COMMENT ON TABLE public.invoice_items IS 'Detailed line items for medical service invoices';

-- --------------------------------------------------------------------------
-- Payments - Payment transaction records
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    
    -- Payment details
    payment_method VARCHAR CHECK (payment_method IN ('credit_card', 'bank_transfer', 'check', 'cash', 'insurance', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_id VARCHAR, -- External payment processor ID
    
    -- Status and metadata
    status VARCHAR CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments inherit access from invoices
CREATE POLICY "Payments inherit invoice access" ON public.payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_id
    )
);

-- Admins can manage payments
CREATE POLICY "Admins manage payments" ON public.payments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

COMMENT ON TABLE public.payments IS 'Payment transaction records for medical services';

-- ============================================================================
-- SUBSCRIPTION & SERVICE PLANS
-- ============================================================================

-- --------------------------------------------------------------------------
-- Service plans - Subscription tiers and pricing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    plan_type VARCHAR CHECK (plan_type IN ('individual', 'family', 'corporate', 'enterprise')) NOT NULL,
    
    -- Pricing
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Features and limits
    features JSONB, -- Feature flags and limits
    max_users INTEGER,
    max_appointments_per_month INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE, -- Whether shown in public pricing
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view public plans
CREATE POLICY "Anyone can view public plans" ON public.service_plans
FOR SELECT USING (is_public = TRUE);

-- Admins can manage all plans
CREATE POLICY "Admins manage service plans" ON public.service_plans
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_service_plans_updated_at
    BEFORE UPDATE ON public.service_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.service_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_plans TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_plans;

COMMENT ON TABLE public.service_plans IS 'Subscription plans and pricing tiers';

-- --------------------------------------------------------------------------
-- Subscriptions - Active service subscriptions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_type VARCHAR CHECK (subscriber_type IN ('patient', 'organization')) NOT NULL,
    subscriber_id UUID NOT NULL, -- References either patient or organization
    service_plan_id UUID NOT NULL REFERENCES public.service_plans(id) ON DELETE RESTRICT,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    
    -- Subscription details
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    billing_cycle VARCHAR CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    status VARCHAR CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    
    -- Next billing
    next_billing_date DATE,
    
    -- Trial period
    trial_start_date DATE,
    trial_end_date DATE,
    is_trial BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Patients can view own subscriptions
CREATE POLICY "Patients view own subscriptions" ON public.subscriptions
FOR SELECT USING (
    subscriber_type = 'patient' AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = subscriber_id AND p.user_id = auth.uid()
    )
);

-- Organization admins can view organization subscriptions
CREATE POLICY "Organizations view own subscriptions" ON public.subscriptions
FOR SELECT USING (
    subscriber_type = 'organization' AND EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = subscriber_id 
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Admins can manage all subscriptions
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

COMMENT ON TABLE public.subscriptions IS 'Active subscription records for patients and organizations';

-- ============================================================================
-- AUDIT & LOGGING TRANSACTIONS
-- ============================================================================

-- --------------------------------------------------------------------------
-- Audit log - System activity tracking
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
    resource_type VARCHAR NOT NULL, -- 'patient', 'appointment', 'medical_record', etc.
    resource_id UUID, -- ID of the affected resource
    
    -- Change tracking
    old_values JSONB, -- Previous state (for updates/deletes)
    new_values JSONB, -- New state (for creates/updates)
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON public.audit_log
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- System can insert audit logs (via service role)
GRANT INSERT ON public.audit_log TO service_role;
GRANT SELECT ON public.audit_log TO authenticated;

COMMENT ON TABLE public.audit_log IS 'System audit trail for compliance and security';

-- --------------------------------------------------------------------------
-- Error log - Application error tracking
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.error_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Error details
    error_type VARCHAR NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    
    -- Context
    url VARCHAR,
    method VARCHAR,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    severity VARCHAR CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view error logs
CREATE POLICY "Admins view error logs" ON public.error_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- System can insert error logs (via service role)
GRANT INSERT ON public.error_log TO service_role;
GRANT SELECT, UPDATE ON public.error_log TO authenticated;

COMMENT ON TABLE public.error_log IS 'Application error tracking for debugging and monitoring';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Billing and payment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_accounts_entity ON public.billing_accounts(entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_billing_account ON public.invoices(billing_account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Subscription indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_subscriber ON public.subscriptions(subscriber_type, subscriber_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_billing_date ON public.subscriptions(next_billing_date) WHERE status = 'active';

-- Audit and logging indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_log_severity ON public.error_log(severity, is_resolved);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_log_created_at ON public.error_log(created_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    invoice_number VARCHAR;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    -- Format as INV-000001
    invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.invoices
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update invoice totals when items change
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;
CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default service plans
INSERT INTO public.service_plans (name, description, plan_type, price_monthly, price_yearly, features, max_users, max_appointments_per_month) VALUES
('Basic Individual', 'Essential healthcare access for individuals', 'individual', 29.99, 299.99, 
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "max_doctors": 3}', 1, 10),
('Premium Individual', 'Comprehensive healthcare with priority support', 'individual', 49.99, 499.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "priority_support": true, "specialist_access": true, "max_doctors": 10}', 1, 25),
('Family Plan', 'Healthcare coverage for the whole family', 'family', 99.99, 999.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "family_sharing": true, "max_doctors": 15}', 6, 50),
('Corporate Basic', 'Essential employee healthcare benefits', 'corporate', 15.99, 159.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "admin_dashboard": true}', 100, 200),
('Enterprise', 'Full-featured healthcare platform for large organizations', 'enterprise', 49.99, 499.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "admin_dashboard": true, "custom_integrations": true, "dedicated_support": true}', 1000, 2000)
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA public IS 'AutaMedica extended schema with transactional tables for billing, subscriptions, and audit logging';