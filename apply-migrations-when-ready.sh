#!/bin/bash
# ============================================================================
# SCRIPT: Aplicar Migraciones a Supabase
# Ejecutar cuando el proyecto esté completamente inicializado
# ============================================================================

echo "🚀 AutaMedica - Aplicar Migraciones a Supabase"
echo "=============================================="
echo ""

# Credentials
DB_HOST="db.ewpsepaieakqbywxnidu.supabase.co"
DB_USER="postgres.ewpsepaieakqbywxnidu"
DB_PASS="hr4Bd6Xdep3K4pNrOJ1uXaqIgLUA4BUL"
DB_NAME="postgres"
SQL_FILE="/tmp/autamedica_full_migration.sql"

# Test connection
echo "🔌 Probando conexión..."
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexión exitosa!"
    echo ""

    # Apply migrations
    echo "⚡ Aplicando migraciones..."
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
        echo ""
        echo "✅ ¡MIGRACIONES APLICADAS EXITOSAMENTE!"
        echo ""

        # Verify tables
        echo "📊 Tablas creadas:"
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\dt public.*"

        echo ""
        echo "🎉 ¡Supabase configurado completamente!"
        echo ""
        echo "📋 Siguiente paso:"
        echo "   pnpm dev --filter @autamedica/web-app"
        echo ""
        exit 0
    else
        echo "❌ Error aplicando migraciones"
        exit 1
    fi
else
    echo "❌ No se pudo conectar a Supabase"
    echo ""
    echo "⏰ El proyecto probablemente aún se está inicializando."
    echo "   Espera 2-3 minutos más e intenta nuevamente."
    echo ""
    echo "💡 Puedes verificar el estado en:"
    echo "   https://supabase.com/dashboard/project/ewpsepaieakqbywxnidu"
    echo ""
    exit 1
fi
