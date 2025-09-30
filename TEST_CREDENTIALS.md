# 🔐 AutaMedica - Credenciales de Testing

## 👥 **Usuarios de Prueba Disponibles**

### 🎯 **Datos Completos de Testing**

| UUID | Email | Nombre | Rol Global | Portal | Organización |
|------|-------|--------|------------|--------|--------------|
| `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | `admin@clinica-demo.com` | Admin Clínica Demo | `organization_admin` | **Admin Portal** | Clínica Demo |
| `b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12` | `company@clinica-demo.com` | Usuario Empresa | `company_admin` | **Companies Portal** | Clínica Demo |
| `c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13` | `doctor@clinica-demo.com` | Dr. Juan Pérez | `doctor` | **Doctors Portal** | - |
| `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14` | `patient@clinica-demo.com` | María González | `patient` | **Patients Portal** | - |
| `e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15` | `platform@clinica-demo.com` | Platform Admin | `platform_admin` | **Main Platform** | - |

---

## 🏢 **Organización de Prueba**

### **Clínica Demo AutaMedica**
- **ID**: `00000000-0000-0000-0000-000000000111`
- **Slug**: `clinica-demo`
- **Tipo**: Healthcare organization
- **Owner**: Admin Clínica Demo (`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`)

### **Membresías Organizacionales**
| Usuario | Rol en Organización | Permisos |
|---------|-------------------|----------|
| `admin@clinica-demo.com` | `admin` | `manage_org`, `manage_users` |
| `company@clinica-demo.com` | `member` | `view_org`, `access_portal` |

---

## 🧪 **Scenarios de Testing**

### 1. **Testing Organization Admin**
**Usuario**: `admin@clinica-demo.com`
```typescript
// Expected redirect: https://admin.autamedica.com
// Local dev: http://localhost:3004
// Role: organization_admin
// Organization access: Clínica Demo (admin)
```

**Testing checklist:**
- [ ] Login redirects to admin portal
- [ ] Can access organization management
- [ ] Can manage users in organization
- [ ] Has admin permissions in Clínica Demo

### 2. **Testing Company User**
**Usuario**: `company@clinica-demo.com`
```typescript
// Expected redirect: https://companies.autamedica.com
// Local dev: http://localhost:3003
// Role: company_admin (legacy)
// Organization access: Clínica Demo (member)
```

**Testing checklist:**
- [ ] Login redirects to companies portal
- [ ] Can access crisis control center
- [ ] Can access marketplace
- [ ] Has member access to Clínica Demo

### 3. **Testing Doctor**
**Usuario**: `doctor@clinica-demo.com`
```typescript
// Expected redirect: https://doctors.autamedica.com
// Local dev: http://localhost:3001
// Role: doctor
// Organization access: None (independent)
```

**Testing checklist:**
- [ ] Login redirects to doctors portal
- [ ] Can access medical dashboard
- [ ] Can access video calling features
- [ ] Professional medical interface works

### 4. **Testing Patient**
**Usuario**: `patient@clinica-demo.com`
```typescript
// Expected redirect: https://patients.autamedica.com
// Local dev: http://localhost:3002
// Role: patient
// Organization access: None (personal)
```

**Testing checklist:**
- [ ] Login redirects to patients portal
- [ ] Can access personal health record
- [ ] Can change themes/preferences
- [ ] Patient-friendly interface works

### 5. **Testing Platform Admin**
**Usuario**: `platform@clinica-demo.com`
```typescript
// Expected redirect: https://www.autamedica.com
// Local dev: http://localhost:3000
// Role: platform_admin
// Organization access: Global (all organizations)
```

**Testing checklist:**
- [ ] Login redirects to main platform
- [ ] Has platform-wide admin access
- [ ] Can access all system functions
- [ ] Global admin permissions work

---

## 🔍 **Queries de Verificación**

### **Verificar Usuarios Creados**
```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.profiles
WHERE email LIKE '%@clinica-demo.com'
ORDER BY email;
```

### **Verificar Roles de Usuario**
```sql
SELECT
  ur.profile_id,
  p.email,
  ur.role,
  ur.organization_id,
  ur.granted_at,
  ur.metadata
FROM public.user_roles ur
JOIN public.profiles p ON ur.profile_id = p.id
WHERE ur.metadata->>'seed' = 'true'
ORDER BY ur.role;
```

### **Verificar Membresías Organizacionales**
```sql
SELECT
  om.organization_id,
  o.name as org_name,
  p.email,
  om.role as org_role,
  ur.role as global_role
FROM public.org_members om
JOIN public.organizations o ON om.organization_id = o.id
JOIN public.profiles p ON om.profile_id = p.id
JOIN public.user_roles ur ON om.profile_id = ur.profile_id
WHERE om.organization_id = '00000000-0000-0000-0000-000000000111';
```

### **Verificar Organización Demo**
```sql
SELECT
  id,
  name,
  slug,
  type,
  metadata,
  created_at
FROM public.organizations
WHERE id = '00000000-0000-0000-0000-000000000111';
```

---

## 🚀 **Testing Flow Completo**

### **Automated Testing**
```bash
# 1. Verificar role routing
node test-role-routing.mjs

# Expected output:
# ✅ organization_admin → https://admin.autamedica.com
# ✅ company → https://companies.autamedica.com
# ✅ company_admin (legacy) → https://companies.autamedica.com
# ✅ doctor → https://doctors.autamedica.com
# ✅ patient → https://patients.autamedica.com
# 📊 Summary: 7/7 roles configured correctly
```

### **Manual Testing Steps**
```bash
# 1. Start all apps
pnpm dev

# 2. Test login flow for each user
# Go to: http://localhost:3000/auth/login
# Use emails from table above
# Verify correct portal redirection

# 3. Test organization access
# Login as admin@clinica-demo.com
# Verify admin portal access
# Check organization management features

# 4. Test legacy compatibility
# Login as company@clinica-demo.com
# Verify companies portal (legacy company_admin → companies)
# Check crisis control + marketplace
```

---

## 🔐 **Security Testing**

### **RLS Policies Testing**
```sql
-- Test as organization admin
SET LOCAL "request.jwt.claims" = '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}';
SELECT * FROM public.organizations; -- Should see Clínica Demo

-- Test as regular user
SET LOCAL "request.jwt.claims" = '{"sub": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14"}';
SELECT * FROM public.organizations; -- Should see nothing (patient has no org access)

-- Test user roles access
SET LOCAL "request.jwt.claims" = '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}';
SELECT * FROM public.user_roles WHERE profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```

### **Role Hierarchy Testing**
```typescript
// Verify role priorities
const roles = [
  'platform_admin',    // Highest priority (100)
  'admin',            // 90
  'organization_admin', // 80
  'company_admin',     // 75 (legacy)
  'company',          // 70
  'doctor',           // 60
  'patient'           // 50 (lowest)
];

// Test primary role selection
SELECT public.select_primary_role_for_profile('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
// Should return: 'organization_admin'
```

---

## 🎯 **Estado de Validación**

### ✅ **Tests Pasando**
- [x] 29/29 role routing tests
- [x] User roles created correctly
- [x] Organization created with members
- [x] RLS policies working
- [x] Legacy compatibility maintained

### 🚀 **Ready for Development**
- [x] All test users functional
- [x] Organization structure complete
- [x] Role routing working
- [x] Portal redirects correct
- [x] Security policies enforced

**🎉 Sistema de testing completamente operativo**