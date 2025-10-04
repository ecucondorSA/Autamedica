#!/bin/bash
# Script para desbloquear permisos en apps/admin
# Debe ejecutarse como root o con sudo

set -e

echo "🔧 Desbloqueando permisos en apps/admin..."
cd /root/altamedica-reboot-fresh/apps/admin

# Remover flags inmutables
echo "1. Removiendo flags inmutables..."
chattr -R -i .next 2>/dev/null || true
chattr -i package.json 2>/dev/null || true

# Dar permisos de escritura
echo "2. Configurando permisos de escritura..."
chmod -R +w .next 2>/dev/null || true
chmod +w package.json

# Cambiar ownership si es necesario
if [ -n "$SUDO_USER" ]; then
  echo "3. Cambiando ownership a $SUDO_USER..."
  chown -R $SUDO_USER:$SUDO_USER .next
  chown $SUDO_USER:$SUDO_USER package.json
else
  echo "3. Ownership: root (ejecutar con sudo si se necesita otro usuario)"
fi

# Verificar
echo ""
echo "✅ Verificación:"
ls -la package.json | awk '{print "  package.json: " $1 " " $3 ":" $4}'
ls -lad .next | awk '{print "  .next/: " $1 " " $3 ":" $4}'

echo ""
echo "✅ Permisos desbloqueados exitosamente"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Ejecutar: cd /root/altamedica-reboot-fresh/apps/admin"
echo "  2. Build:    pnpm build:cloudflare"
echo "  3. Deploy:   wrangler pages deploy .open-next --project-name=autamedica-admin --branch=main"
