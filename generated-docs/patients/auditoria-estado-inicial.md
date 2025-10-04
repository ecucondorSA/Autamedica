# Auditoría Inicial – apps/patients (03-10-2025)

## Estado del repositorio
- Rama base: `feat/web-app-responsive-fix` → nueva rama de trabajo `feat/patients-integration` creada.
- Worktree ya contaba con 300+ archivos modificados (principalmente `apps/patients`, `apps/auth`, `docs/`, `packages`), todos preservados; no se tocaron cambios previos.

## Setup ejecutado
- `pnpm i` completó sin descargar paquetes adicionales (lockfile vigente). Se instaló husky correctamente.
- `pnpm -w build` falló en `packages/shared` durante la generación de tipos (`tsup dts build`); varios archivos (`webrtc-diagnostics.ts`, `tenant/roles.ts`, `roles.ts`, `casing.ts`, `db.ts`) no están incluidos en el `tsconfig`. Requiere actualizar `tsconfig.json` o `tsup.config.ts` de shared.
- `pnpm -w lint` reportó 69 errores / 468 warnings existentes. Principales fallos:
  - Archivos en `apps/api.backup`, `supabase/functions`, `worker/` fuera de los proyectos TypeScript declarados → error de parser.
  - Uso de `process.env` directo en `apps/auth` (violación de reglas internas).
  - Amplio backlog de `no-unused-vars` en scripts utilitarios.
- `pnpm -w typecheck` terminó con errores en `apps/web-app` (uso incorrecto de componentes styled-jsx, props incompatibles, imports faltantes) y dependencias no resueltas (`@autamedica/shared`, `@supabase/ssr`).
- `node scripts/validate-contracts.js` → 167 issues (124 críticos, 43 warnings). Falta documentar múltiples exports de `@autamedica/types` en `docs/GLOSARIO_MAESTRO.md`; también hay tipos documentados que ya no se exportan.

## Entorno y dependencias relevantes
- Node actual: `v22.20.0` (warning: repositorio declara preferencia por Node 20.x).
- Variables requeridas (`apps/patients/.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - URLs públicas (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PATIENTS_URL`, etc.).
  - `AUTH_COOKIE_DOMAIN`, `NEXT_PUBLIC_AUTH_CALLBACK_URL`.
  - Feature flags (`NEXT_PUBLIC_PATIENT_PORTAL_ENABLED`, `NEXT_PUBLIC_TELEMEDICINE_ENABLED`, etc.).

## Observaciones para siguientes bloques
1. La librería `apps/patients/src/lib/supabase.ts` usa bypass mock; será necesario reemplazarla por cliente edge real con normalización snake→camel.
2. `usePatientSession` todavía simula datos en memoria; no hay integración con Supabase ni sincronización `profiles/patients`.
3. Componentes de Appointments, Preventive Health y Medical Records dependen de stores y hooks mock; habrá que revisar su compatibilidad con los contratos reales.
4. Revisar compatibilidad de `packages/types` y `packages/shared` antes de consumirlos en Patients (ajustar tsconfig y normalizadores comunes).

## Próximos pasos
- Diseñar Zod schemas + mapeadores snake↔camel reutilizables en `apps/patients/src/lib` o en `packages/shared`.
- Sustituir hooks mock (`usePatientSession`, `usePatientScreenings`, `useMedicalHistory`) por implementaciones Supabase.
- Planificar migraciones/documentación para alinear `packages/types` con el glosario antes de correr `scripts/validate-contracts.js` en CI.
