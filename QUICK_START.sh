#!/bin/bash

# QUICK START - Migración Supabase AutaMedica
# ============================================

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            MIGRACIÓN SUPABASE - QUICK START                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ SQL Migration file ready:${NC}"
echo "   supabase/migrations/20251008_core_medical_tables.sql"
echo "   (455 lines, 7 tables, 20+ RLS policies)"
echo ""

echo -e "${YELLOW}📋 MANUAL EXECUTION (Recommended):${NC}"
echo ""
echo "   1. Open in browser:"
echo "      https://supabase.com/dashboard/project/ewpsepaieakqbywxnidu/sql/new"
echo ""
echo "   2. Copy SQL to clipboard:"
echo "      xclip -selection clipboard < supabase/migrations/20251008_core_medical_tables.sql"
echo "      (Or manually copy from the file)"
echo ""
echo "   3. Paste in SQL Editor → Run"
echo ""
echo "   4. Verify 'Success' message"
echo ""

echo -e "${GREEN}📁 Documentation:${NC}"
echo "   • Full guide: EJECUTAR_MIGRACION_AHORA.md"
echo "   • Validation: scripts/validate-migration.sql"
echo "   • Summary: RESUMEN_ACCIONES_INMEDIATAS.md"
echo ""

echo -e "${YELLOW}⏱️  Estimated time: 5 minutes${NC}"
echo ""

read -p "Press Enter to open Supabase Dashboard in browser... " 

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/ewpsepaieakqbywxnidu/sql/new"
elif command -v open &> /dev/null; then
    open "https://supabase.com/dashboard/project/ewpsepaieakqbywxnidu/sql/new"
else
    echo "Please open manually:"
    echo "https://supabase.com/dashboard/project/ewpsepaieakqbywxnidu/sql/new"
fi

echo ""
echo -e "${GREEN}Next: After executing migration, run validation:${NC}"
echo "   cat scripts/validate-migration.sql"
echo ""
