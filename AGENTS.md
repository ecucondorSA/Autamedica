# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with `pnpm` + `turbo`.
- Apps: `apps/web-app`, `apps/doctors`, `apps/patients`, `apps/companies`, `apps/admin`, `apps/signaling-server`.
- Packages: `packages/{types,shared,auth,hooks,ui,telemedicine,tailwind-config,eslint-config,session,supabase-client}`.
- Tests: `tests/{e2e,integration}/` and root scripts like `test-role-routing.mjs`.
- Infra/data: `supabase/` (migrations, seeds), `scripts/`, `docs/`.

## Build, Test, and Development Commands
- Dev (all apps): `pnpm dev`; single app: `pnpm dev --filter @autamedica/web-app`
- Build: `pnpm build`; core packages: `pnpm build:packages`
- Quality: `pnpm typecheck && pnpm lint`; contracts: `pnpm docs:validate`
- Tests: unit/integration `pnpm test:auth`; E2E `pnpm test:e2e` (doctor flow: `pnpm test:doctor-videocall`)
- Smoke: role routing `node test-role-routing.mjs`

## Coding Style & Naming Conventions
- Language: TypeScript (Node 20). Indent 2 spaces; LF; final newline (`.editorconfig`).
- Linting: ESLint Flat config + Next.js + TypeScript; formatting via Prettier (`pnpm format`).
- Import rules: avoid deep imports (`@autamedica/*/src/*`) and direct `process.env` (use `ensureEnv` from `@autamedica/shared`).
- File names: kebab-case for files, PascalCase for React components, named exports preferred; no `export *`.

## Testing Guidelines
- Frameworks: Vitest for browser/unit, Playwright for E2E, SQL smoke via `pnpm test:rls`.
- Locations: unit/integration under `tests/`, E2E under `tests/e2e` (`*.spec.ts`).
- Quick check before PR: `pnpm typecheck && pnpm lint && pnpm build:packages && node test-role-routing.mjs`.

## Commit & Pull Request Guidelines
- Conventional commits with emoji + Spanish type enforced by Commitlint.
  - Examples: `✨ nova feature: agregar routing de roles`, `🐛 fix: corregir redirección admin`.
- PRs must:
  - Use `PR_TEMPLATE.md` checklist, describe scope/impact, link issues, and include screenshots/video for UI or E2E changes.
  - Pass CI gates: types, lint, build, role routing, docs/contracts.

## Security & Configuration
- Do not commit secrets. Use `.env.*` templates and `pnpm env:validate`.
- Validate DB/types before release: `pnpm db:sync` and `pnpm docs:db:check-diff`.

## Patients Auth & Session (Dev)
- Auth Hub runs on `:3005`; Patients on `:3002`. Tokens pass via URL/localStorage; `SessionSync` converts them to a Supabase session.
- Required envs:
  - `apps/patients/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `apps/auth/.env.local`: same `NEXT_PUBLIC_*` values (Auth Hub at `:3005`).
- Flow: Login at Auth Hub with `returnTo=http://localhost:3002/...` → Patients `/auth/callback` receives `access_token`/`refresh_token` → `SessionSync` sets session and cleans URL.
- API auth (Patients): accepts Supabase cookies or `Authorization: Bearer <access_token>` in dev.
- Key files:
  - `apps/patients/src/components/SessionSync.tsx`: token→session (client only), mounted in `apps/patients/src/app/layout.tsx` and `/auth/callback` page.
  - `apps/patients/src/app/api/profile/ensure/route.ts` (POST): ensure minimal `profiles` row; upsert `patients` if table exists (Service Role).
  - `apps/patients/src/app/api/profile/route.ts` (PATCH): updates `profiles` (snake_case → legacy `full_name` fallback) and `patients` by `user_id`.
- Helpful scripts: `scripts/e2e/patients-login.mjs` (Playwright login flow) and `scripts/db/probe-supabase-schema.mjs` (schema probe).

## Auta AI Personalization
- Endpoints (Patients):
  - `GET/POST /api/ai/patterns` (patrones/FAQs por usuario), `POST /api/ai/telemetry` (logs).
  - Contexto: `GET /api/ai/context`, resincroniza: `POST /api/ai/context/sync`.
- Tablas (Supabase migrations): `ai_user_patterns`, `ai_user_faq`, `patient_ai_chats` (ver `supabase/migrations/20251012_ai_user_personalization.sql`).
- Seed opcional: `supabase/seed_ai_personalization.sql` (inserta una FAQ y un patrón para el último usuario).
- ONNX en navegador (opcional): colocar modelo en `apps/patients/public/models/intent.onnx` y activar en `.env.local`:
  - `NEXT_PUBLIC_AUTA_ONNX=1`, `NEXT_PUBLIC_AUTA_ONNX_MODEL=/models/intent.onnx`.
