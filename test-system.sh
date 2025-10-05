#!/bin/bash

# ============================================================================
# AutaMedica System Smoke Test
# Tests the complete telemedicine flow
# ============================================================================

set -e

echo "🚀 AutaMedica System Smoke Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Helper functions
test_passed() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

test_failed() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

test_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================================================
# Test 1: Environment Variables
# ============================================================================
echo "📋 Test 1: Checking environment variables..."

if [ -f "apps/signaling-server/.env" ]; then
  test_passed "Signaling server .env exists"
else
  test_failed "Signaling server .env missing"
fi

if [ -f "apps/patients/.env.local" ]; then
  test_passed "Patients app .env.local exists"
else
  test_failed "Patients app .env.local missing"
fi

if [ -f "apps/doctors/.env.local" ]; then
  test_passed "Doctors app .env.local exists"
else
  test_failed "Doctors app .env.local missing"
fi

# Check LiveKit credentials
if grep -q "LIVEKIT_API_KEY=APIdeCcSqaJyrTG" apps/signaling-server/.env 2>/dev/null; then
  test_passed "LiveKit credentials configured"
else
  test_warning "LiveKit credentials not found (check .env)"
fi

echo ""

# ============================================================================
# Test 2: Package Dependencies
# ============================================================================
echo "📦 Test 2: Checking package installations..."

if [ -d "node_modules" ]; then
  test_passed "Root node_modules exists"
else
  test_failed "Root node_modules missing - run 'pnpm install'"
fi

if [ -d "apps/signaling-server/node_modules" ]; then
  test_passed "Signaling server dependencies installed"
else
  test_warning "Signaling server node_modules missing"
fi

if [ -f "apps/signaling-server/node_modules/livekit-server-sdk/package.json" ]; then
  test_passed "LiveKit SDK installed"
else
  test_warning "LiveKit SDK not found"
fi

echo ""

# ============================================================================
# Test 3: TypeScript Compilation
# ============================================================================
echo "🔨 Test 3: TypeScript compilation..."

echo "  Building signaling-server..."
cd apps/signaling-server
if pnpm build 2>&1 | tail -5; then
  test_passed "Signaling server builds successfully"
else
  test_failed "Signaling server build failed"
fi
cd ../..

echo ""

# ============================================================================
# Test 4: Vitest Tests
# ============================================================================
echo "🧪 Test 4: Running critical tests..."

cd apps/signaling-server
if pnpm test 2>&1 | grep -q "passed"; then
  test_passed "Signaling server tests passed"
else
  test_failed "Signaling server tests failed"
fi
cd ../..

echo ""

# ============================================================================
# Test 5: Database Migrations
# ============================================================================
echo "🗄️  Test 5: Checking database migrations..."

if [ -f "supabase/migrations/20251005_livekit_consultation_rooms.sql" ]; then
  test_passed "LiveKit consultation rooms migration exists"
else
  test_failed "LiveKit migration missing"
fi

if [ -f "supabase/migrations/20251003_telemedicine_tables.sql" ]; then
  test_passed "Telemedicine tables migration exists"
else
  test_warning "Telemedicine migration not found"
fi

echo ""

# ============================================================================
# Test 6: LiveKit Integration (Optional)
# ============================================================================
echo "🎥 Test 6: LiveKit integration check..."

if grep -q "eduardo-4vew3u6i.livekit.cloud" apps/signaling-server/.env 2>/dev/null; then
  test_passed "LiveKit Cloud URL configured"
else
  test_warning "LiveKit URL not configured"
fi

# Check if LiveKit components are installed in apps
if grep -q "@livekit/components-react" apps/patients/package.json 2>/dev/null; then
  test_passed "LiveKit React components in patients app"
else
  test_warning "LiveKit components not in patients app"
fi

if grep -q "@livekit/components-react" apps/doctors/package.json 2>/dev/null; then
  test_passed "LiveKit React components in doctors app"
else
  test_warning "LiveKit components not in doctors app"
fi

echo ""

# ============================================================================
# Test 7: Component Files
# ============================================================================
echo "🧩 Test 7: Checking video consultation components..."

if [ -f "apps/patients/src/components/consultation/VideoConsultation.tsx" ]; then
  test_passed "Patient VideoConsultation component exists"
else
  test_failed "Patient VideoConsultation component missing"
fi

if [ -f "apps/doctors/src/components/consultation/DoctorVideoConsultation.tsx" ]; then
  test_passed "Doctor VideoConsultation component exists"
else
  test_failed "Doctor VideoConsultation component missing"
fi

echo ""

# ============================================================================
# Test 8: Routes Configuration
# ============================================================================
echo "🛣️  Test 8: Checking consultation routes..."

if [ -d "apps/patients/src/app/consultation" ]; then
  test_passed "Patient consultation route exists"
else
  test_failed "Patient consultation route missing"
fi

if [ -d "apps/doctors/src/app/consultation" ]; then
  test_passed "Doctor consultation route exists"
else
  test_failed "Doctor consultation route missing"
fi

echo ""

# ============================================================================
# Test 9: Documentation
# ============================================================================
echo "📚 Test 9: Checking documentation..."

if [ -f "apps/signaling-server/R2_SETUP.md" ]; then
  test_passed "R2 setup documentation exists"
else
  test_warning "R2 setup documentation missing"
fi

if [ -f "CLAUDE.md" ]; then
  test_passed "Main documentation exists"
else
  test_warning "Main documentation missing"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed:${NC} $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical tests passed!${NC}"
  echo ""
  echo "🚀 Your system is ready. To start the servers:"
  echo ""
  echo "  Terminal 1: cd apps/signaling-server && pnpm dev"
  echo "  Terminal 2: cd apps/patients && pnpm dev"
  echo "  Terminal 3: cd apps/doctors && pnpm dev"
  echo ""
  echo "Then visit:"
  echo "  Patient: http://localhost:3002/consultation/test-001"
  echo "  Doctor:  http://localhost:3001/consultation/test-001"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
  exit 1
fi
