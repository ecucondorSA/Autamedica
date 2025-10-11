#!/bin/bash
# AutaMedica Lab Debug - Cleanup Plan Script
# Generated: 2025-10-09
# Branch: lab/debug-refactor-experiments
# DO NOT RUN THIS SCRIPT WITHOUT REVIEWING EACH SECTION

set -e  # Exit on error

echo "=================================================="
echo "AutaMedica Cleanup Plan - Safe Execution Mode"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This script performs destructive operations"
echo "📋 Review each section before executing"
echo "✅ Uncomment sections you want to run"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================
# IMMEDIATE FIXES (Run First)
# ==============================================

echo -e "${RED}=== IMMEDIATE FIXES ===${NC}"

# FIX 1: Permission on test-medical-panel (ALREADY DONE)
echo "✅ Permission fix already applied"
# sudo chmod -R 755 /home/edu/Autamedica/apps/patients/src/app/test-medical-panel

# FIX 2: TypeScript errors - profile-manager.test.ts
# MANUAL FIX REQUIRED - See report section 2
echo "⏳ TODO: Fix profile-manager.test.ts discriminated union handling"

# FIX 3: Next.js version conflict in apps/companies
# MANUAL REVIEW REQUIRED - Check package.json for React version conflicts
echo "⏳ TODO: Resolve Next.js/React version conflict in apps/companies"

# FIX 4: Node version alignment
echo "⏳ TODO: Update package.json engine to node 22.x or downgrade to 20.x"

# ==============================================
# THIS WEEK - High Priority Refactoring
# ==============================================

echo ""
echo -e "${YELLOW}=== THIS WEEK - High Priority ===${NC}"

# CLEANUP 5: Archive old generated docs
echo "📚 Archiving old generated documentation..."
# Uncomment to execute:
# mkdir -p .archive/generated-docs-2025-10-09
# mv generated-docs/browser-captures/*.md .archive/generated-docs-2025-10-09/ 2>/dev/null || true
# mv generated-docs/RLS_*.md .archive/generated-docs-2025-10-09/ 2>/dev/null || true
# mv generated-docs/TEST_*.md .archive/generated-docs-2025-10-09/ 2>/dev/null || true
# mv generated-docs/FINAL_*.md .archive/generated-docs-2025-10-09/ 2>/dev/null || true
# echo "✅ Archived old docs to .archive/"

# CLEANUP 6: Remove unused test dependencies
echo "🧹 Removing unused test dependencies..."
# Uncomment to execute:
# pnpm remove @testing-library/react @testing-library/user-event
# echo "✅ Removed unused testing libraries"

# CLEANUP 7: Add missing dependencies
echo "📦 Adding missing dependencies..."
# Uncomment to execute:
# pnpm add -D @eslint/js ws
# echo "✅ Added missing dev dependencies"

# CLEANUP 8: Old Supabase reference audit (MANUAL)
echo "🔍 Auditing old Supabase references..."
echo "   Found in 145 files - see report for list"
echo "   ⚠️  MANUAL REVIEW REQUIRED before updating"
echo ""
echo "   Files to prioritize:"
echo "   - wrangler.toml"
echo "   - apps/*/env.production"
echo "   - apps/*/env.example"
echo "   - scripts/setup/*.sh"
echo ""
echo "   ⏳ Create tracking issue for systematic replacement"

# ==============================================
# THIS SPRINT - Medium Priority
# ==============================================

echo ""
echo -e "${GREEN}=== THIS SPRINT - Medium Priority ===${NC}"

# REFACTOR 9: console.log to logger migration
echo "📊 Identifying console.log violations..."
echo "   Found in 40+ files - prioritize production code"
echo "   Pattern to use:"
echo "   import { logger } from '@autamedica/shared';"
echo "   logger.info/debug/error(...)"
echo ""
echo "   ⏳ TODO: Create refactoring script or manual fix"

# REFACTOR 10: process.env to ensureEnv migration
echo "🔐 Identifying process.env violations..."
echo "   Found in 63 files - violates architecture"
echo "   Pattern to use:"
echo "   import { ensureEnv, ensureClientEnv } from '@autamedica/shared';"
echo ""
echo "   ⏳ TODO: Systematic refactoring needed"

# REFACTOR 11: fetch() to BaseAPIClient migration
echo "🌐 Identifying direct fetch() violations..."
echo "   Found 48+ instances - should use BaseAPIClient"
echo "   Pattern to use:"
echo "   import { BaseAPIClient } from '@autamedica/shared';"
echo "   const api = new BaseAPIClient('/api');"
echo ""
echo "   ⏳ TODO: Service-by-service refactoring"

# ==============================================
# ONGOING - Continuous Improvement
# ==============================================

echo ""
echo -e "${GREEN}=== ONGOING - Continuous Improvement ===${NC}"

# QUALITY 12: Run validation checks
echo "🔍 Running validation checks..."
# Uncomment to execute:
# echo "Type checking..."
# pnpm type-check 2>&1 | head -50
#
# echo "Export validation..."
# pnpm docs:validate
#
# echo "Dependency check..."
# npx depcheck --ignores="@types/*,eslint-*,prettier,husky"

# QUALITY 13: TODO audit
echo "📝 TODO markers found: 47+"
echo "   High-priority TODOs:"
echo "   - S3/R2 storage configuration"
echo "   - WebRTC TURN servers for production"
echo "   - Real data integration (Supabase queries)"
echo "   - Missing hook implementations"
echo ""
echo "   ⏳ Convert high-impact TODOs to GitHub issues"

# QUALITY 14: Test coverage check
echo "🧪 Test coverage analysis..."
echo "   Current: ~40% estimated"
echo "   Target: 85%+"
echo "   Gaps: Companies app, Admin app, React components"
echo ""
echo "   ⏳ Implement component tests with Vitest"

# ==============================================
# SAFE CLEANUP OPERATIONS
# ==============================================

echo ""
echo -e "${GREEN}=== SAFE CLEANUP OPERATIONS ===${NC}"

# SAFE 15: Consolidate SQL migrations
echo "🗄️  SQL migration consolidation..."
echo "   Found 20+ SQL files in different locations"
echo "   Recommendation: Move to /supabase/migrations/"
echo "   ⏳ MANUAL - Requires understanding of migration order"

# SAFE 16: Archive old scripts
echo "🗂️  Script archival..."
echo "   Old Supabase setup scripts should be archived"
echo "   Keep only actively used deployment scripts"
# Uncomment to execute:
# mkdir -p .archive/old-supabase-scripts
# mv scripts/update-supabase-*.sh .archive/old-supabase-scripts/ 2>/dev/null || true
# mv scripts/setup-supabase-*.sh .archive/old-supabase-scripts/ 2>/dev/null || true
# mv scripts/fix-supabase-*.sh .archive/old-supabase-scripts/ 2>/dev/null || true
# echo "✅ Archived old Supabase scripts"

# SAFE 17: Clean node_modules (safe to re-install)
echo "🧹 Node modules cleanup..."
# Uncomment to execute (will take time to reinstall):
# echo "Removing node_modules..."
# rm -rf node_modules apps/*/node_modules packages/*/node_modules
# echo "Reinstalling dependencies..."
# pnpm install
# echo "✅ Clean reinstall completed"

# ==============================================
# VERIFICATION STEPS
# ==============================================

echo ""
echo -e "${YELLOW}=== VERIFICATION STEPS ===${NC}"
echo "After cleanup, run these commands to verify:"
echo ""
echo "1. Type checking:"
echo "   pnpm type-check"
echo ""
echo "2. Linting:"
echo "   pnpm lint"
echo ""
echo "3. Build test:"
echo "   pnpm build"
echo ""
echo "4. Export validation:"
echo "   pnpm docs:validate"
echo ""
echo "5. Unit tests:"
echo "   pnpm test:unit"
echo ""
echo "6. Security audit:"
echo "   pnpm audit"
echo ""

# ==============================================
# SUMMARY
# ==============================================

echo ""
echo "=================================================="
echo "Cleanup Plan Summary"
echo "=================================================="
echo ""
echo "🚨 CRITICAL (Do First):"
echo "   - Fix TypeScript errors (50+)"
echo "   - Resolve permission issues (done)"
echo "   - Fix Next.js version conflicts"
echo ""
echo "⚠️  HIGH PRIORITY:"
echo "   - Old Supabase refs (145 files)"
echo "   - process.env violations (63 files)"
echo "   - console.log violations (40 files)"
echo "   - Undocumented exports (14)"
echo ""
echo "📋 MEDIUM PRIORITY:"
echo "   - Direct fetch() calls (48)"
echo "   - TODO markers (47)"
echo "   - Missing hooks"
echo ""
echo "💡 LOW PRIORITY:"
echo "   - Doc cleanup"
echo "   - SQL consolidation"
echo "   - Test coverage"
echo ""
echo "=================================================="
echo "⚠️  Review generated-docs/lab-debug-report-2025-10-09.md"
echo "📝 Uncomment sections above to execute cleanup"
echo "✅ Run verification steps after each section"
echo "=================================================="
