# 🌱 Aplicar Seeds del Role System

## Opción 1: Supabase Dashboard (Recomendado)

1. **Ve al SQL Editor**: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql
2. **Copia el contenido completo de**: `supabase/seed_role_system.sql`
3. **Ejecuta el script**

## Opción 2: CLI (si tienes psql local)

```bash
export SUPABASE_DB_URL="postgresql://postgres.gtyvdircfhmdjiaelqkg:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
psql "$SUPABASE_DB_URL" -f supabase/seed_role_system.sql
```

## ✅ Verificación después de aplicar seeds

Ejecuta estas queries para verificar:

```sql
-- 1. Verificar organización creada
SELECT id, name, slug FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000111';

-- 2. Verificar roles de usuario
SELECT user_id, role, created_at FROM public.user_roles WHERE metadata->>'seed' = 'true' ORDER BY role;

-- 3. Verificar membresías de organización
SELECT om.org_id, om.user_id, om.role, ur.role as user_global_role
FROM public.org_members om
JOIN public.user_roles ur ON om.user_id = ur.user_id
WHERE om.org_id = '00000000-0000-0000-0000-000000000111';
```

## 🧪 Testing Manual del Role System

### Test 1: organization_admin → admin portal
1. Simular usuario con `user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'`
2. Role: `organization_admin`
3. **Esperado**: Redirect a `https://admin.autamedica.com`

### Test 2: company → companies portal
1. Simular usuario con `user_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'`
2. Role: `company`
3. **Esperado**: Redirect a `https://companies.autamedica.com`

### Test 3: Verificar URL generation
```typescript
import { getTargetUrlByRole } from '@autamedica/shared';

console.log(getTargetUrlByRole('organization_admin'));
// Expected: "https://admin.autamedica.com/"

console.log(getTargetUrlByRole('company'));
// Expected: "https://companies.autamedica.com/"

console.log(getTargetUrlByRole('organization_admin', '/dashboard'));
// Expected: "https://admin.autamedica.com/dashboard"
```

## 🎯 Resultado Esperado

Después de aplicar seeds deberías ver:
- ✅ 1 organización: "Clínica Demo AutaMedica"
- ✅ 5 usuarios de prueba con diferentes roles
- ✅ 2 membresías en la organización
- ✅ RLS policies funcionando correctamente