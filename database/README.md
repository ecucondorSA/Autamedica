# AutaMedica Database Schema

This directory contains the complete database schema for the AutaMedica medical platform.

## 📁 Files

### Core Schema
- **`schema.sql`** - Complete database schema including all tables, policies, and functions
- **`schema-extensions.sql`** - Standalone transactional tables extension
- **`apply-transactional-extension.sql`** - Migration script for existing databases

### Supabase Integration
- **Supabase Project ID**: `gtyvdircfhmdjiaelqkg`
- **Environment**: Production
- **Database URL**: `https://gtyvdircfhmdjiaelqkg.supabase.co`

## 🏗️ Schema Architecture

### Core Medical Tables
1. **`profiles`** - User authentication bridge (linked to auth.users)
2. **`organizations`** - Healthcare organizations, clinics, partners  
3. **`doctors`** - Medical professionals with licenses and specialties
4. **`patients`** - Patient demographics and medical record numbers
5. **`appointments`** - Scheduling and encounter management
6. **`medical_records`** - Clinical documentation and notes
7. **`patient_care_team`** - Doctor-patient assignments
8. **`org_members`** - Organization membership and scoped roles

### Transactional Business Tables ⭐ **New: Added 2025-09-20**
9. **`billing_accounts`** - Billing information for patients and organizations
10. **`invoices`** - Medical service invoices and billing records
11. **`invoice_items`** - Detailed line items for medical service invoices  
12. **`payments`** - Payment transaction records for medical services
13. **`service_plans`** - Subscription plans and pricing tiers
14. **`subscriptions`** - Active subscription records for patients and organizations
15. **`audit_log`** - System audit trail for compliance and security
16. **`error_log`** - Application error tracking for debugging and monitoring

## 🔐 Security Features

### Row Level Security (RLS)
- **Enabled on all tables** - Every table has RLS policies
- **Role-based access** - Patients, doctors, company admins, platform admins
- **Care team constraints** - Doctors only see assigned patients
- **Organization isolation** - Organization data isolated by membership

### HIPAA Compliance
- **Audit logging** - All actions tracked with user, timestamp, IP
- **Data encryption** - Sensitive data stored as JSONB with encryption
- **Access controls** - Granular permissions based on medical relationships
- **Data retention** - Configurable retention policies via audit log

### Authentication Bridge
- **Supabase Auth integration** - Automatic profile creation on user registration
- **Role assignment** - Support for patient, doctor, company, organization_admin, admin roles
- **Magic links** - Passwordless authentication via email
- **Session management** - Secure session handling with auto-refresh

## 💰 Business Logic

### Billing System
- **Multi-entity billing** - Supports both patient and organization billing
- **Invoice automation** - Auto-calculation of totals via triggers
- **Payment tracking** - Multiple payment methods and status tracking
- **Invoice numbering** - Auto-generated invoice numbers (INV-000001 format)

### Subscription Management
- **Flexible plans** - Individual, family, corporate, enterprise tiers
- **Trial support** - Built-in trial period management
- **Billing cycles** - Monthly and yearly billing options
- **Feature flags** - JSONB-based feature configuration per plan

### Service Plans (Default)
```json
{
  "Basic Individual": {
    "price_monthly": 29.99,
    "features": {
      "telemedicine": true,
      "medical_records": true, 
      "appointment_scheduling": true,
      "max_doctors": 3
    },
    "max_appointments_per_month": 10
  },
  "Enterprise": {
    "price_monthly": 49.99,
    "features": {
      "custom_integrations": true,
      "dedicated_support": true,
      "admin_dashboard": true
    },
    "max_appointments_per_month": 2000
  }
}
```

## 📊 Performance Optimizations

### Indexes
- **Entity lookups** - Optimized queries for billing accounts by entity
- **Status filtering** - Fast invoice and payment status queries  
- **Date ranges** - Efficient billing date and audit log queries
- **Resource access** - Quick audit log lookups by resource type

### Triggers
- **Auto-timestamps** - All tables have updated_at triggers
- **Invoice calculations** - Automatic subtotal/total calculation
- **Audit trail** - Automatic audit logging for sensitive operations

## 🚀 Migration Instructions

### For New Installations
```sql
-- Apply complete schema
\i database/schema.sql
```

### For Existing Installations
```sql
-- Apply only the transactional extension
\i database/apply-transactional-extension.sql
```

### Verification
```sql
-- Check all tables were created
SELECT schemaname, tablename, tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check initial service plans
SELECT name, plan_type, price_monthly, max_users 
FROM public.service_plans 
ORDER BY price_monthly;
```

## 🔧 Development Tools

### Supabase CLI Commands
```bash
# Connect to database
supabase db dump --linked -f database/schema.sql

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --linked > types/database.ts
```

### Local Development
```bash
# Start local Supabase
supabase start

# Apply schema locally  
supabase db reset --local

# Run migrations
supabase migration up --local
```

## 📋 Schema Validation

### Required Extensions
- `uuid-ossp` - UUID generation
- `pg_stat_statements` - Query performance monitoring (optional)

### Foreign Key Relationships
- All references use UUID primary keys
- Cascading deletes for dependent data
- SET NULL for optional references (e.g., doctor on medical records)

### Data Constraints
- Email validation in triggers
- Enum constraints for status fields
- Check constraints for currency codes (ISO 4217)
- Positive amounts for financial transactions

## 🎯 Next Steps

### Phase 1: TypeScript Types
- [ ] Generate TypeScript definitions from schema
- [ ] Create type-safe database client
- [ ] Add to `@autamedica/types` package

### Phase 2: Business Logic
- [ ] Implement billing service functions
- [ ] Add subscription management APIs
- [ ] Create audit logging middleware

### Phase 3: Reporting
- [ ] Financial reporting views
- [ ] Usage analytics tables
- [ ] Performance monitoring dashboards

---

**Schema Version**: 2.0 (with transactional extensions)  
**Last Updated**: 2025-09-20  
**Total Tables**: 16 tables  
**Security Level**: HIPAA-compliant with full audit trail
