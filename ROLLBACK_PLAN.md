# Plan de Rollback: Unificación de Roles de Compañía

Este documento describe los pasos para revertir la migración que unificó los roles `company_admin` y `company`.

**ADVERTENCIA:** Ejecutar este plan puede causar inconsistencias si se han realizado nuevos cambios sobre la nueva estructura. Proceder con cautela y en un entorno de staging primero.

---

## Secuencia de Ejecución Segura

1.  **Poner la aplicación en modo mantenimiento.** Esto evita que los usuarios realicen acciones durante el proceso de rollback.
2.  **Ejecutar el script SQL de rollback.**
3.  **Revertir los commits de código TypeScript.**
4.  **Desplegar el código revertido.**
5.  **Verificar la funcionalidad en producción.**
6.  **Quitar el modo mantenimiento.**

---

## 1. Rollback de SQL

El siguiente script SQL reintroduce el rol `company_admin` y lo restaura para los usuarios que son administradores de al menos una compañía.

**Nota:** Este script es una aproximación. Asume que cualquier usuario con `company_members.role = 'admin'` debe volver a ser un `company_admin` global. Si la lógica era más compleja, se necesitará un ajuste manual.

```sql
BEGIN;

-- Paso 1: Reintroducir 'company_admin' en el constraint de `profiles.role`
-- Es más seguro eliminar y recrear el constraint para asegurar su definición exacta.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('patient', 'doctor', 'company', 'company_admin', 'organization_admin'));

RAISE NOTICE 'Constraint profiles_role_check revertido para incluir company_admin.';

-- Paso 2: Identificar usuarios que son administradores de al menos una compañía
CREATE TEMP TABLE users_to_revert AS
SELECT DISTINCT user_id
FROM public.company_members
WHERE role = 'admin';

RAISE NOTICE 'Identificados % usuarios para revertir a company_admin.', (SELECT count(*) FROM users_to_revert);

-- Paso 3: Actualizar el rol global en `public.profiles` para esos usuarios
UPDATE public.profiles
SET role = 'company_admin'
WHERE user_id IN (SELECT user_id FROM users_to_revert);

-- (Opcional) Limpiar la tabla temporal
DROP TABLE users_to_revert;

-- NOTA: Las políticas de RLS no se revierten automáticamente. Si las políticas anteriores
-- se basaban en `profiles.role = 'company_admin'`, necesitarán ser restauradas manualmente.

RAISE NOTICE 'Rollback de datos completado. Los perfiles han sido actualizados a company_admin.';

COMMIT;
```

### Señales de Éxito (SQL)
- El script se ejecuta sin errores.
- Los `RAISE NOTICE` indican el número de usuarios afectados.
- Al consultar `public.profiles`, los usuarios que antes eran `admin` en `company_members` ahora tienen `role = 'company_admin'`. 

---

## 2. Rollback de Código (TypeScript)

El rollback del código implica revertir los commits o los cambios aplicados.

### Diffs a Revertir

1.  **Eliminar `packages/shared/src/tenant/roles.ts`**: Este archivo contiene los nuevos helpers `canManageCompany`, etc.
    ```bash
    git rm packages/shared/src/tenant/roles.ts
    ```

2.  **Revertir cambios en `packages/shared/src/index.ts`**:
    - Eliminar la línea: `export * from "./tenant/roles";`

3.  **Revertir cambios en `apps/companies/src/app/layout.tsx`**:
    - Quitar la lógica de `useEffect` que consulta `company_members`.
    - Devolver la lista `sidebarItems` a su estado estático original, sin el filtrado condicional.
    - Restaurar la lógica que se basaba en el rol global (si existía).

4.  **Revertir cambios en `apps/companies/middleware.ts`**:
    - Reintroducir `'company_admin'` en el array `ALLOWED_ROLES`.
    ```typescript
    // ANTES
    const ALLOWED_ROLES = ['company', 'organization_admin', 'platform_admin'] as const;
    // DESPUÉS (REVERTIDO)
    const ALLOWED_ROLES = ['company', 'company_admin', 'organization_admin', 'platform_admin'] as const;
    ```

5.  **Eliminar `apps/companies/src/hooks/useCompanyMemberRole.ts`**:
    ```bash
    git rm apps/companies/src/hooks/useCompanyMemberRole.ts
    ```

### Ramas de Código a Restaurar

Busca en el código cualquier instancia donde se haya eliminado un `if` que comprobaba el rol global y restáuralo. Ejemplo:

```typescript
// Lógica nueva (a revertir)
const { memberRole } = useCompanyMemberRole(companyId);
if (canManageCompany(memberRole)) {
  // Renderizar componente de admin
}

// Lógica antigua (a restaurar)
const { globalRole } = useUserSession(); // o hook similar
if (globalRole === 'company_admin') {
  // Renderizar componente de admin
}
```

### Señales de Éxito (Código)
- La aplicación compila sin errores después de revertir los cambios.
- El comportamiento de la UI vuelve a depender del rol global `company_admin`.
- Los tests E2E que dependían de la lógica de `company_admin` vuelven a pasar.
