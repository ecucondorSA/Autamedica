#!/bin/bash

# Script para triggear redeploys en Cloudflare Pages
# Esto aplicará las nuevas variables de entorno

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}ERROR: CLOUDFLARE_API_TOKEN no esta configurado${NC}"
    echo ""
    echo "Ejecuta primero:"
    echo "  export CLOUDFLARE_API_TOKEN='tu_token'"
    exit 1
fi

ACCOUNT_ID="5737682cdee596a0781f795116a3120b"

# Lista de proyectos
PROJECTS=(
    "autamedica-auth"
    "autamedica-web-app"
    "autamedica-doctors"
    "autamedica-patients"
    "autamedica-companies"
)

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  Triggeando Redeploys - Cloudflare Pages     ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

trigger_redeploy() {
    local project=$1

    echo -e "${YELLOW}-> ${project}${NC}"

    # Obtener el último deployment
    deployments=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments?per_page=1" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json")

    deployment_id=$(echo "$deployments" | jq -r '.result[0].id')

    if [ "$deployment_id" == "null" ] || [ -z "$deployment_id" ]; then
        echo -e "${RED}  ERROR: No se encontro deployment${NC}"
        return 1
    fi

    # Retry del deployment (esto crea uno nuevo con las variables actualizadas)
    retry_response=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${project}/deployments/${deployment_id}/retry" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json")

    if echo "$retry_response" | jq -e '.success' > /dev/null 2>&1; then
        new_deployment=$(echo "$retry_response" | jq -r '.result.id')
        echo -e "${GREEN}  ✅ Redeploy triggeado: ${new_deployment}${NC}"
        return 0
    else
        echo -e "${RED}  ERROR al triggear redeploy${NC}"
        echo "$retry_response" | jq -r '.errors[]?.message' 2>/dev/null
        return 1
    fi
}

# Triggear redeploys
SUCCESS=0
FAILED=0

for project in "${PROJECTS[@]}"; do
    if trigger_redeploy "$project"; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
    echo ""
    sleep 2  # Evitar rate limiting
done

# Resumen
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  Resumen                                     ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "Exitosos: ${SUCCESS}/5"
echo -e "Fallidos:  ${FAILED}/5"
echo ""

if [ $SUCCESS -eq 5 ]; then
    echo -e "${GREEN}Todos los redeploys triggeados exitosamente!${NC}"
    echo ""
    echo -e "${YELLOW}Monitorea los deployments en:${NC}"
    echo "  https://dash.cloudflare.com -> Pages -> [Proyecto] -> Deployments"
    echo ""
    echo -e "${YELLOW}Siguiente paso:${NC}"
    echo "  Espera 5-10 minutos para que se completen los builds"
    echo "  Luego prueba el flujo de OAuth desde:"
    echo "    - https://autamedica-auth.pages.dev"
    echo "    - https://auth.autamedica.com"
else
    echo -e "${YELLOW}Algunos redeploys fallaron. Revisa los errores arriba.${NC}"
    echo ""
    echo "Puedes triggear manualmente desde:"
    echo "  https://dash.cloudflare.com -> Pages -> [Proyecto] -> Deployments -> Retry"
fi
