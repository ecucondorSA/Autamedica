#!/bin/bash

# Script simplificado - requiere que hagas wrangler login primero
# Uso: ./update-cf-vars-simple.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Account ID obtenido de wrangler whoami
ACCOUNT_ID="5737682cdee596a0781f795116a3120b"

# Variables de Supabase (proyecto correcto)
SUPABASE_URL="https://ewpsepaieakqbywxnidu.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk"
SUPABASE_SERVICE_KEY="sb_secret_Xmou75UAl7DG0gfL5Omgew_m0fptr37"

# Lista de proyectos (5 principales)
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
echo -e "${YELLOW}⚠️  Este script requiere que hayas hecho 'wrangler login' primero${NC}"
echo ""

# Leer token de wrangler (si está disponible en variables de entorno)
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_API_TOKEN no está configurado${NC}"
    echo ""
    echo "Por favor, obtén tu API token:"
    echo "1. Ve a: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Crea un token con permisos 'Cloudflare Pages - Edit'"
    echo "3. Exporta el token:"
    echo "   export CLOUDFLARE_API_TOKEN='tu_token_aqui'"
    echo ""
    echo "Luego ejecuta este script de nuevo."
    exit 1
fi

echo -e "${GREEN}✅ Token encontrado${NC}"
echo -e "${YELLOW}📦 Actualizando 5 proyectos...${NC}"
echo ""

# Función para actualizar variables
update_project() {
    local project=$1

    echo -e "${YELLOW}→ ${project}${NC}"

    # Actualizar variables usando API de Cloudflare
    response=$(curl -s -X PATCH \
        "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
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

    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}  ✅ Actualizado${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Error${NC}"
        echo "$response" | jq -r '.errors[]?.message // .errors' 2>/dev/null || echo "$response"
        return 1
    fi
}

# Actualizar cada proyecto
SUCCESS=0
FAILED=0

for project in "${PROJECTS[@]}"; do
    if update_project "$project"; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
    echo ""
done

# Resumen
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Resumen                                                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "✅ Exitosos: ${SUCCESS}/5"
echo -e "❌ Fallidos:  ${FAILED}/5"
echo ""

if [ $SUCCESS -eq 5 ]; then
    echo -e "${GREEN}🎉 ¡Todos los proyectos actualizados!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Siguiente paso: Triggear redeploys${NC}"
    echo "   Para aplicar los cambios, ejecuta:"
    echo "   ./trigger-redeploys.sh"
else
    echo -e "${YELLOW}⚠️  Algunos proyectos fallaron. Revisa los errores arriba.${NC}"
fi
