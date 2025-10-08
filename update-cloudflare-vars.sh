#!/bin/bash

# Script para actualizar variables de entorno en Cloudflare Pages
# Uso: ./update-cloudflare-vars.sh <CLOUDFLARE_API_TOKEN> <CLOUDFLARE_ACCOUNT_ID>

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar argumentos
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}❌ Error: Faltan argumentos${NC}"
    echo ""
    echo "Uso: $0 <CLOUDFLARE_API_TOKEN> <CLOUDFLARE_ACCOUNT_ID>"
    echo ""
    echo "Obtén tus credenciales en:"
    echo "  Token: https://dash.cloudflare.com/profile/api-tokens"
    echo "  Account ID: https://dash.cloudflare.com → Selecciona tu cuenta → Account ID"
    exit 1
fi

API_TOKEN="$1"
ACCOUNT_ID="$2"

# Variables de Supabase (proyecto correcto)
SUPABASE_URL="https://ewpsepaieakqbywxnidu.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk"
SUPABASE_SERVICE_KEY="sb_secret_Xmou75UAl7DG0gfL5Omgew_m0fptr37"

# Lista de proyectos
PROJECTS=(
    "autamedica-auth"
    "autamedica-web-app"
    "autamedica-doctors"
    "autamedica-patients"
    "autamedica-companies"
)

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Actualización de Variables - Cloudflare Pages              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para actualizar variables de un proyecto
update_project_vars() {
    local project_name=$1

    echo -e "${YELLOW}📦 Actualizando: ${project_name}${NC}"

    # Obtener el ID del proyecto
    PROJECT_DATA=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project_name}" \
        -H "Authorization: Bearer ${API_TOKEN}" \
        -H "Content-Type: application/json")

    # Verificar si el proyecto existe
    if echo "$PROJECT_DATA" | grep -q '"success":false'; then
        echo -e "${RED}  ❌ Proyecto no encontrado o error de autenticación${NC}"
        echo "$PROJECT_DATA" | grep -o '"message":"[^"]*"'
        return 1
    fi

    # Actualizar variables para Production
    echo -e "   → Actualizando variables de Production..."

    PATCH_RESPONSE=$(curl -s -X PATCH \
        "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project_name}" \
        -H "Authorization: Bearer ${API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{
            \"deployment_configs\": {
                \"production\": {
                    \"env_vars\": {
                        \"NEXT_PUBLIC_SUPABASE_URL\": {
                            \"type\": \"plain_text\",
                            \"value\": \"${SUPABASE_URL}\"
                        },
                        \"NEXT_PUBLIC_SUPABASE_ANON_KEY\": {
                            \"type\": \"plain_text\",
                            \"value\": \"${SUPABASE_ANON_KEY}\"
                        },
                        \"SUPABASE_SERVICE_ROLE_KEY\": {
                            \"type\": \"secret_text\",
                            \"value\": \"${SUPABASE_SERVICE_KEY}\"
                        }
                    }
                },
                \"preview\": {
                    \"env_vars\": {
                        \"NEXT_PUBLIC_SUPABASE_URL\": {
                            \"type\": \"plain_text\",
                            \"value\": \"${SUPABASE_URL}\"
                        },
                        \"NEXT_PUBLIC_SUPABASE_ANON_KEY\": {
                            \"type\": \"plain_text\",
                            \"value\": \"${SUPABASE_ANON_KEY}\"
                        },
                        \"SUPABASE_SERVICE_ROLE_KEY\": {
                            \"type\": \"secret_text\",
                            \"value\": \"${SUPABASE_SERVICE_KEY}\"
                        }
                    }
                }
            }
        }")

    if echo "$PATCH_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}   ✅ Variables actualizadas correctamente${NC}"
        return 0
    else
        echo -e "${RED}   ❌ Error al actualizar variables${NC}"
        echo "$PATCH_RESPONSE" | grep -o '"message":"[^"]*"'
        return 1
    fi
}

# Actualizar cada proyecto
SUCCESS_COUNT=0
FAIL_COUNT=0

for project in "${PROJECTS[@]}"; do
    if update_project_vars "$project"; then
        ((SUCCESS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
    echo ""
done

# Resumen
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Resumen de Actualización                                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "✅ Proyectos actualizados: ${GREEN}${SUCCESS_COUNT}${NC}"
echo -e "❌ Proyectos con errores:  ${RED}${FAIL_COUNT}${NC}"
echo ""

if [ $SUCCESS_COUNT -eq 5 ]; then
    echo -e "${GREEN}🎉 ¡Todos los proyectos actualizados exitosamente!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Siguiente paso:${NC}"
    echo -e "   Triggear redeploy en cada proyecto para aplicar los cambios:"
    echo -e "   1. Ve a: https://dash.cloudflare.com → Pages"
    echo -e "   2. Selecciona cada proyecto"
    echo -e "   3. Ve a 'Deployments' → 'View build'"
    echo -e "   4. Haz clic en 'Retry deployment'"
    echo ""
else
    echo -e "${RED}⚠️  Algunos proyectos no se pudieron actualizar.${NC}"
    echo -e "   Verifica las credenciales y los nombres de los proyectos."
fi
