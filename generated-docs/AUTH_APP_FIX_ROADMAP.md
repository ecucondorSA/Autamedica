# 🛠️ Auth App - Roadmap de Corrección Detallado

**Fecha**: 6 de Octubre, 2025
**Estado**: ✅ **1/31 errores resueltos** (Fase 1.4 completada)
**Próximos pasos**: 30 errores restantes

---

## ✅ Progreso Actual

### Completado
- ✅ **Fase 1.4**: Agregada dependencia `@autamedica/tailwind-config`
  - **Commit**: `e9abc2f`
  - **Errores resueltos**: 1/31

### En Progreso
- 🔄 Fase 1: Type Safety (30 errores restantes)

---

## 📋 Plan de Corrección Detallado

### 🔴 Fase 1.1: React Type Conflicts (6 errores)

**Errores:**
```
src/app/layout.tsx:79 - Type 'React.ReactNode' is not assignable
src/components/SearchParamsWrapper.tsx:28 - Unused '@ts-expect-error' directive
src/components/SearchParamsWrapper.tsx:30-31 - Type 'React.ReactNode' conflicts
```

**Causa Raíz:**
- React 19.0.0 y @types/react 19.1.0 tienen incompatibilidades en definiciones de `ReactNode`
- El tipo `ReactPortal` requiere propiedad `children` que no existe en `ReactElement`

**Solución Recomendada:**

**Opción A: Actualizar a React 19.1.1 (RECOMENDADO)**
```bash
# En apps/auth/package.json
pnpm add react@19.1.1 react-dom@19.1.1 --filter @autamedica/auth-app
```

**Opción B: Type assertions temporales**
```typescript
// src/app/layout.tsx
<AuthProvider enableDebug={process.env.NODE_ENV === 'development'}>
  {children as any}  // Temporal hasta React 19.1.1
</AuthProvider>

// src/components/SearchParamsWrapper.tsx
// Remover @ts-expect-error y usar type assertion
<Suspense fallback={loadingFallback as any}>
  {children as any}
</Suspense>
```

**Verificación:**
```bash
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "src/app/layout\|SearchParams"
```

---

### 🔴 Fase 1.2: ProfileManager Test Errors (11 errores)

**Errores:**
```
src/__tests__/profile-manager.test.ts:56,73,85,114,115,136,155,176,195,211,212
- Property 'data' does not exist on type 'ProfileResult<T>'
- Property 'error' does not exist on type 'ProfileResult<T>'
```

**Causa Raíz:**
```typescript
// Discriminated union no se estrecha correctamente
type ProfileResult<T> =
  | { success: true; data: T }
  | { success: false; error: ProfileError };

// ❌ Código actual (incorrecto)
const result = await profileManager.getCurrentProfile();
expect(result.data).toBeDefined(); // Error: 'data' no existe si success=false
```

**Solución:**
```typescript
// ✅ Correcto: Usar type guards
const result = await profileManager.getCurrentProfile();

if (result.success) {
  expect(result.data).toBeDefined(); // ✅ Safe
  expect(result.data.email).toBe('test@example.com');
} else {
  expect(result.error).toBeDefined(); // ✅ Safe
  expect(result.error.code).toBe('PROFILE_NOT_FOUND');
}
```

**Archivos a modificar:**
```bash
# Editar todos los tests en:
vi apps/auth/src/__tests__/profile-manager.test.ts

# Buscar y reemplazar pattern:
# FROM: expect(result.data)
# TO:   if (result.success) { expect(result.data) } else { fail('Expected success') }
```

---

### 🔴 Fase 1.3: UserRole Type Conflicts (3 errores)

**Errores:**
```
src/app/auth/select-role/components/PublicRoleSelectionForm.tsx:89,91
src/app/auth/select-role/components/RoleSelectionForm.tsx:123
- Type 'import("@autamedica/shared").UserRole' is not assignable to 'import("@autamedica/types").UserRole'
```

**Causa Raíz:**
UserRole está definido en **DOS** lugares:
1. `packages/types/dist/entities/profiles.ts`
2. `packages/shared/dist/auth/portals.ts`

**Verificación del problema:**
```bash
grep -r "export type UserRole" packages/*/src/**/*.ts
```

**Solución:**

**Paso 1: Consolidar en @autamedica/types**
```typescript
// packages/types/src/entities/profiles.ts (MANTENER)
export type UserRole =
  | 'patient'
  | 'doctor'
  | 'company'           // ⚠️ Verificar si debe ser 'company' o 'organization_admin'
  | 'organization_admin'
  | 'platform_admin'
  | 'admin';
```

**Paso 2: Remover de @autamedica/shared**
```bash
# Buscar dónde está definido en shared
grep -n "type UserRole" packages/shared/src/**/*.ts

# Reemplazar con import
# EN: packages/shared/src/auth/portals.ts
# CAMBIAR:
export type UserRole = 'patient' | 'doctor' | ...;

# A:
export type { UserRole } from '@autamedica/types';
```

**Paso 3: Actualizar imports**
```bash
# Buscar todos los archivos que importan UserRole de shared
grep -r "from '@autamedica/shared'" apps/auth/src | grep UserRole

# Cambiar a importar de types
```

---

### 🔴 Fase 1.4: Supabase Function Errors (4 errores)

**Errores:**
```
src/lib/profile-manager.ts:94,149,214
- Argument 'get_current_profile' | 'set_portal_and_role' | 'get_user_audit_log'
  not assignable to parameter of type 'create_call' | 'decrypt_phi' | ...
```

**Causa Raíz:**
Los types generados de Supabase no incluyen estas funciones RPC.

**Solución:**

**Paso 1: Regenerar types desde Supabase**
```bash
# Desde la raíz del proyecto
cd /root/Autamedica

# Necesitas el project ID de Supabase
# Lo puedes obtener de: supabase/config.toml o .env

# Generar types actualizados
npx supabase gen types typescript --project-id gtyvdircfhmdjiaelqkg > packages/types/src/database/supabase.types.ts

# O si tienes acceso local a la DB:
npx supabase gen types typescript --local > packages/types/src/database/supabase.types.ts
```

**Paso 2: Verificar que las funciones existan en DB**
```sql
-- Conectar a Supabase y verificar
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_current_profile', 'set_portal_and_role', 'get_user_audit_log');
```

**Paso 3: Si las funciones NO existen, crearlas**
```sql
-- Migración: supabase/migrations/YYYYMMDD_add_profile_functions.sql
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'id', auth.uid(),
    'email', (SELECT email FROM auth.users WHERE id = auth.uid()),
    'role', (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
  );
END;
$$;

-- Similar para set_portal_and_role y get_user_audit_log
```

---

### 🔴 Fase 1.5: Supabase Client Type Mismatch (2 errores)

**Errores:**
```
src/lib/supabase/client.ts:27
src/lib/supabase/server.ts:20
- Type 'SupabaseClient<Database, "public", { Tables: {...} }>'
  not assignable to 'SupabaseClient<Database, "public", "public", { ... }>'
```

**Causa Raíz:**
@supabase/ssr v0.5.2 cambió la firma de tipos del cliente.

**Solución:**

```typescript
// apps/auth/src/lib/supabase/client.ts

// ❌ ANTES (incorrecto para v0.5.2)
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@autamedica/types';

let client: SupabaseClient<Database>;

// ✅ DESPUÉS (correcto para v0.5.2)
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@autamedica/types';

// No tipar explícitamente, dejar que TypeScript infiera
let client: ReturnType<typeof createBrowserClient<Database>>;

export function getBrowserSupabaseClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
```

**Archivos a modificar:**
- `apps/auth/src/lib/supabase/client.ts`
- `apps/auth/src/lib/supabase/server.ts`
- `apps/auth/src/lib/supabase/config.ts` (si existe)

---

### 🔴 Fase 1.6: Vitest Config Error (1 error)

**Error:**
```
vitest.config.ts:12 - Object literal may only specify known properties,
  and 'threads' does not exist in type 'InlineConfig'
```

**Causa Raíz:**
Vitest 3.x cambió `threads` a `pool`.

**Solución:**
```typescript
// apps/auth/vitest.config.ts

// ❌ ANTES (Vitest 2.x)
export default defineConfig({
  test: {
    threads: false,  // Deprecated en Vitest 3.x
  }
});

// ✅ DESPUÉS (Vitest 3.x)
export default defineConfig({
  test: {
    pool: 'forks',  // 'threads' | 'forks' | 'vmThreads'
    // O remover completamente si no es necesario
  }
});
```

---

### 🔴 Fase 1.7: Next.js Page Config Error (1 error)

**Error:**
```
.next/types/app/profile/page.ts:12
- Property 'prerender' is incompatible with index signature
```

**Causa Raíz:**
Next.js 15.5.4 generó tipos con `prerender: false` pero los tipos esperan `never`.

**Solución:**

**Opción A: Remover export prerender (RECOMENDADO)**
```typescript
// apps/auth/src/app/profile/page.tsx

// ❌ REMOVER si existe:
export const prerender = false;

// El default en Next.js 15 ya es dynamic rendering
```

**Opción B: Usar dynamic config**
```typescript
// apps/auth/src/app/profile/page.tsx

// ✅ Si necesitas forzar dynamic:
export const dynamic = 'force-dynamic';

// Remover prerender
```

---

## 🎯 Orden de Ejecución Recomendado

### Día 1: Quick Wins (4 horas)
1. ✅ Fix tailwind-config dependency (COMPLETADO)
2. ⏭️ Fix Vitest config (2 min)
3. ⏭️ Fix Next.js page config (5 min)
4. ⏭️ Update React to 19.1.1 (10 min + rebuild)
5. ⏭️ Fix Supabase client types (30 min)

**Errores resueltos**: 11/31

### Día 2: Database & Types (4 horas)
6. ⏭️ Consolidar UserRole type (1 hora)
7. ⏭️ Regenerar Supabase types (1 hora)
8. ⏭️ Crear funciones faltantes en DB (2 horas)

**Errores resueltos**: 18/31

### Día 3: Test Fixes (3 horas)
9. ⏭️ Fix ProfileManager tests con type guards (3 horas)

**Errores resueltos**: 29/31

### Día 4: Final Verification (2 horas)
10. ⏭️ Fix remaining React type issues (1 hora)
11. ⏭️ Verificación completa y commit (1 hora)

**Errores resueltos**: 31/31 ✅

---

## 📊 Tracking Progress

### Current Status
| Fase | Errores | Resueltos | Pendientes | % Complete |
|------|---------|-----------|------------|------------|
| 1.1 React Types | 6 | 0 | 6 | 0% |
| 1.2 ProfileManager Tests | 11 | 0 | 11 | 0% |
| 1.3 UserRole Conflicts | 3 | 0 | 3 | 0% |
| 1.4 Tailwind Config | 1 | ✅ 1 | 0 | 100% |
| 1.5 Supabase Functions | 4 | 0 | 4 | 0% |
| 1.6 Supabase Client | 2 | 0 | 2 | 0% |
| 1.7 Vitest Config | 1 | 0 | 1 | 0% |
| 1.8 Next.js Config | 1 | 0 | 1 | 0% |
| **TOTAL** | **31** | **1** | **30** | **3%** |

---

## 🔧 Scripts Útiles

### Verificar errores actuales
```bash
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "error TS" | wc -l
```

### Verificar errores por categoría
```bash
# React errors
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "React.ReactNode"

# ProfileManager errors
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "profile-manager.test.ts"

# UserRole errors
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "UserRole"

# Supabase errors
pnpm --filter @autamedica/auth-app type-check 2>&1 | grep "supabase"
```

### Regenerar types
```bash
# Supabase types
npx supabase gen types typescript --project-id gtyvdircfhmdjiaelqkg

# TypeScript build info
rm apps/auth/tsconfig.tsbuildinfo && pnpm --filter @autamedica/auth-app type-check
```

---

## 📝 Commit Message Template

```
fix(auth): resolve [CATEGORY] type errors (X/31)

[Description of what was fixed]

Errors resolved:
- [file:line]: [error description]
- [file:line]: [error description]

Progress: X/31 errors resolved

Part of auth app audit Phase 1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## ✅ Success Criteria

**Phase 1 Complete cuando:**
- ✅ `pnpm --filter @autamedica/auth-app type-check` exit code 0
- ✅ 0 TypeScript errors
- ✅ All tests passing
- ✅ Build successful

**Comando de verificación final:**
```bash
cd /root/Autamedica
pnpm --filter @autamedica/auth-app type-check && \
pnpm --filter @autamedica/auth-app test:unit && \
pnpm --filter @autamedica/auth-app build
```

---

*Roadmap generado: 6 de Octubre, 2025*
*Última actualización: Fase 1.4 completada*
*Próxima acción: Fase 1.7 (Vitest config) - 2 minutos estimados*
