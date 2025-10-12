# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with `pnpm` + `turbo`.
- Apps: `apps/web-app`, `apps/doctors`, `apps/patients`, `apps/companies`, `apps/admin`, `apps/signaling-server`.
- Packages: `packages/{types,shared,auth,hooks,ui,telemedicine,tailwind-config,eslint-config,session,supabase-client}`.
- Tests: `tests/{e2e,integration}/` and root scripts like `test-role-routing.mjs`.
- Infra/data: `supabase/` (migrations, seeds), `scripts/`, `docs/`.

## Build, Test, and Development Commands
- Dev (all apps): `pnpm dev`
- Dev (single app): `pnpm dev --filter @autamedica/web-app`
- Build all: `pnpm build` • Build core packages: `pnpm build:packages`
- Typecheck/lint: `pnpm typecheck && pnpm lint`
- Unit/integration (Vitest): `pnpm test:auth` (UI: `pnpm test:auth:ui`)
- E2E (Playwright): `pnpm test:e2e` or focused doctor flow: `pnpm test:doctor-videocall`
- Role routing smoke: `node test-role-routing.mjs`
- Docs/contracts validation: `pnpm docs:validate`

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
