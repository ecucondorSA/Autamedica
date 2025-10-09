# CRITICAL ISSUES - Immediate Action Required

**Branch:** `lab/debug-refactor-experiments`
**Date:** 2025-10-09
**Status:** 🔴 BLOCKS PRODUCTION DEPLOYMENT

---

## 🚨 Top 5 Critical Issues

### 1. TypeScript Compilation Failures - 50+ Errors
**Impact:** BLOCKS BUILD & DEPLOYMENT
**Priority:** 🚨 IMMEDIATE

**Root Causes:**
- Discriminated union mishandling in tests (apps/auth)
- Next.js/React version conflicts (apps/companies)
- Supabase client type mismatches (apps/auth)
- Missing module declarations (apps/companies)

**Files Affected:**
```
apps/auth/src/__tests__/profile-manager.test.ts (12 errors)
apps/companies/middleware.ts (4 errors)
apps/companies/src/app/layout.tsx (3 errors)
apps/auth/src/lib/supabase/config.ts (2 errors)
apps/auth/src/app/layout.tsx (1 error)
```

**Fix Required:**
1. Refactor test assertions to use type guards
2. Align Next.js/React versions across monorepo
3. Fix Supabase client instantiation
4. Add missing package declarations

**Estimated Effort:** 4-6 hours

---

### 2. Old Supabase Credentials - 145 Files
**Impact:** SECURITY RISK, DEPLOYMENT CONFUSION
**Priority:** 🚨 IMMEDIATE

**Old Project ID:** `gtyvdircfhmdjiaelqkg`

**Critical Files:**
```
wrangler.toml
apps/patients/.env.production
apps/doctors/.env.example
apps/auth/next.config.mjs
.env.cloudflare
```

**Security Implications:**
- Old credentials in git history
- Deployment configs pointing to wrong instance
- Documentation confusion

**Fix Required:**
1. Audit each of 145 files
2. Replace with new Supabase project ID
3. Update all .env.example files
4. Clean git history (BFG Repo-Cleaner)
5. Verify no secrets in commits

**Estimated Effort:** 1-2 days

---

### 3. Architecture Pattern Violations - 63+ Files
**Impact:** BREAKS ARCHITECTURAL CONTRACTS
**Priority:** ⚠️ HIGH

**Violations:**
- **63 files:** Direct `process.env` access (should use `ensureEnv`)
- **40 files:** `console.log` instead of `LoggerService`
- **48 instances:** Direct `fetch()` instead of `BaseAPIClient`

**Critical Violations:**
```typescript
// packages/auth/src/utils/config.ts:27
cookie: process.env.AUTH_COOKIE_DOMAIN || '.autamedica.com'

// packages/shared/src/auth/session.ts:27
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// apps/signaling-server/src/livekit.ts:87
console.log('[DEBUG] LiveKit Config:', { ... });
```

**Fix Required:**
```typescript
// Replace process.env
import { ensureEnv, ensureClientEnv } from '@autamedica/shared';
const url = ensureClientEnv('NEXT_PUBLIC_SUPABASE_URL');

// Replace console.log
import { logger } from '@autamedica/shared';
logger.info('LiveKit Config', { ... });

// Replace fetch()
import { BaseAPIClient } from '@autamedica/shared';
const api = new BaseAPIClient('/api');
```

**Estimated Effort:** 2-3 days

---

### 4. Undocumented Exports - Contract Violations
**Impact:** BREAKS CONTRACT-FIRST DEVELOPMENT
**Priority:** ⚠️ HIGH

**Missing from GLOSARIO_MAESTRO.md:**
- `UserRole` from `@autamedica/shared` (CRITICAL - used everywhere)
- 13 telemedicine hooks from `@autamedica/hooks`

**Impact:**
- No single source of truth
- Type changes can break unexpectedly
- Violates CLAUDE.md principles

**Fix Required:**
1. Document `UserRole` in `docs/glossary/packages.md`
2. Document all telemedicine hooks
3. Run `pnpm docs:validate` to verify

**Estimated Effort:** 2-4 hours

---

### 5. Node Version Mismatch
**Impact:** RUNTIME INCONSISTENCIES
**Priority:** ⚠️ HIGH

**Current:** Node v22.20.0
**Required:** Node 20.x (per package.json)

**Warning:**
```
WARN Unsupported engine: wanted: {"node":"20.x"}
(current: {"node":"v22.20.0","pnpm":"9.15.2"})
```

**Fix Options:**
1. Update package.json to `"node": ">=20.x"`
2. Downgrade to Node 20.x LTS
3. Test thoroughly with current version

**Estimated Effort:** 1 hour (decision + update)

---

## 📋 High-Impact TODOs (47 markers found)

### Production Blockers

#### Missing Real Data Integration
```typescript
// apps/doctors/src/components/layout/DoctorsPortalShell.tsx
const patients = { length: 0 } // TODO: Conectar con patients stats

// apps/patients/src/app/(dashboard)/page.tsx
// TODO: Implementar lógica para obtener próxima cita desde Supabase
```

#### WebRTC Production Config
```typescript
// apps/patients/src/hooks/useWebRTC.ts
// TODO: Agregar TURN servers privados para producción
// TODO: Implementar lógica de reconexión
```

#### S3 Storage Integration
```typescript
// apps/signaling-server/src/livekit.ts
// TODO: Implementar recording cuando esté configurado S3
```

---

## 🎯 Action Plan

### TODAY (October 9, 2025)
- [ ] Fix permission issue on test-medical-panel (✅ DONE)
- [ ] Fix TypeScript errors in apps/auth tests
- [ ] Resolve Next.js version conflict
- [ ] Fix Supabase client issues

### THIS WEEK
- [ ] Audit & update 145 Supabase references
- [ ] Document UserRole and telemedicine exports
- [ ] Start refactoring process.env violations
- [ ] Start replacing console.log with logger

### THIS SPRINT
- [ ] Implement missing hooks (useVitalSigns, useRecords)
- [ ] Replace fetch() with BaseAPIClient
- [ ] Configure WebRTC TURN servers
- [ ] Configure S3/R2 storage
- [ ] Connect real Supabase data

---

## 🔧 Quick Commands

### Validation
```bash
# Type check (will show 50+ errors)
pnpm type-check

# Export validation (will show 14 missing)
pnpm docs:validate

# Dependency check
npx depcheck
```

### Cleanup
```bash
# Run safe cleanup script
./scripts/cleanup-plan.sh

# Archive old docs
mkdir -p .archive/generated-docs-2025-10-09
mv generated-docs/*.md .archive/generated-docs-2025-10-09/
```

### Search Patterns
```bash
# Find old Supabase references
grep -r "gtyvdircfhmdjiaelqkg" . --exclude-dir=node_modules

# Find process.env violations
grep -r "process\.env\." apps packages --include="*.ts" --include="*.tsx"

# Find console.log usage
grep -r "console\." apps packages --include="*.ts" --include="*.tsx"
```

---

## 📊 Deployment Readiness

| Category | Status | Blocker |
|----------|--------|---------|
| TypeScript Compilation | 🔴 FAIL | YES |
| ESLint Clean | 🟡 WARN | NO |
| Old Credentials | 🔴 FAIL | YES |
| Architecture Patterns | 🟡 WARN | NO |
| Documentation | 🟡 WARN | NO |
| Tests | 🟢 PASS | NO |
| Build | 🔴 FAIL | YES |

**Overall Status:** 🔴 **NOT PRODUCTION READY**

**Blockers:** 3 critical issues must be resolved before deployment

---

## 🎓 Key Takeaways

1. **TypeScript Strict Mode Catches Issues Early** - 50+ errors prevented runtime bugs
2. **Old Credentials Linger** - 145 references show need for better secret rotation
3. **Architecture Rules Need Enforcement** - Pattern violations accumulate without automation
4. **Contract-First Development Critical** - Missing docs cause confusion
5. **TODOs Need Tracking** - 47 deferred decisions need systematic resolution

---

## 📚 Related Documents

- **Full Report:** `/generated-docs/lab-debug-report-2025-10-09.md`
- **Cleanup Script:** `/scripts/cleanup-plan.sh`
- **Architecture Guide:** `/CLAUDE.md`
- **Contract Glossary:** `/docs/GLOSARIO_MAESTRO.md`

---

**Next Steps:**
1. Review this summary with team
2. Prioritize fixes (TypeScript → Supabase → Patterns)
3. Execute cleanup-plan.sh sections
4. Re-run validation after each fix
5. Update this document with progress

---

**Generated:** 2025-10-09
**By:** Claude Code - Autonomous Debugging Agent
**For:** AutaMedica Production Readiness
