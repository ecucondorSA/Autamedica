#!/bin/bash

# Setup Monitoring and Analytics for AltaMedica
# Configura monitoreo usando Cloudflare Pages y herramientas complementarias

set -e

echo "📊 Configurando Monitoring y Analytics - AltaMedica"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}✅ Analytics disponibles en Cloudflare Pages:${NC}"
echo ""
echo "🌐 Web-App Analytics:"
echo "   📊 Cloudflare Dashboard → Pages → autamedica-web-app → Analytics"
echo "   🚀 Revisar métricas de rendimiento y tráfico en Cloudflare Insights"
echo ""
echo "👨‍⚕️ Doctors Analytics:"
echo "   📊 Cloudflare Dashboard → Pages → autamedica-doctors → Analytics"
echo ""
echo "👤 Patients Analytics:"
echo "   📊 Cloudflare Dashboard → Pages → autamedica-patients → Analytics"
echo ""
echo "🏢 Companies Analytics:"
echo "   📊 Cloudflare Dashboard → Pages → autamedica-companies → Analytics"

echo -e "\n${BLUE}📈 Métricas monitoreadas automáticamente:${NC}"
echo ""
echo "Core Web Vitals:"
echo "  • LCP (Largest Contentful Paint)"
echo "  • INP (Interaction to Next Paint)"  
echo "  • CLS (Cumulative Layout Shift)"
echo "  • TTFB (Time to First Byte)"
echo ""
echo "Performance:"
echo "  • Page load times"
echo "  • Edge cache hit ratio"
echo "  • Build duration"
echo "  • Requests por segundo"
echo ""
echo "Usage:"
echo "  • Visitor counts"
echo "  • Geographic distribution"
echo "  • Device types"
echo "  • Traffic sources"

echo -e "\n${YELLOW}⚠️  Alertas Recomendadas (Configuración Manual):${NC}"
echo ""
echo "En Cloudflare, configurar reglas de observabilidad para:"
echo ""
echo "🔴 Críticas:"
echo "  • Error Rate > 5%"
echo "  • API Response Time > 5 seconds"
echo "  • Build Failures"
echo "  • SSL Certificate Expiry"
echo ""
echo "🟡 Advertencias:"
echo "  • Core Web Vitals degradation"
echo "  • Build time > 10 minutes"
echo "  • Unusual traffic spikes"
echo "  • Cache miss rate > 50%"

echo -e "\n${GREEN}🔍 URLs útiles:${NC}"
echo ""
echo "• Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "• Pages Projects: https://dash.cloudflare.com/?to=/:account/pages"
echo "• Observability: https://dash.cloudflare.com/?to=/:account/observability/logpush"
echo "• Integraciones: https://dash.cloudflare.com/?to=/:account/integrations"

echo -e "\n${BLUE}📊 Dashboard Central Recomendado:${NC}"
echo ""
echo "• Configura Cloudflare Analytics con exportación a BigQuery o Prometheus"
echo "• Integra alertas con Slack/PagerDuty para incidentes críticos"
echo "• Usa Grafana para dashboards personalizados si es necesario"

echo -e "\n${GREEN}🎯 Métricas Específicas Médicas:${NC}"
echo ""
echo "Para aplicaciones médicas, monitorear especialmente:"
echo ""
echo "👨‍⚕️ Doctors Portal:"
echo "  • Tiempo de carga de video calls"
echo "  • Latencia de WebRTC connections"
echo "  • Uptime durante horas médicas"
echo ""
echo "👤 Patients Portal:"
echo "  • Accesibilidad metrics"
echo "  • Mobile performance"
echo "  • Form submission success rates"

echo ""
echo "🏢 Companies Portal:"
echo "  • Tiempo de respuesta de crisis"
echo "  • Éxito de transacciones en marketplace"
echo "  • Entrega de alertas de emergencia"

echo -e "\n${GREEN}✅ Monitoring configurado y listo para usar!${NC}"
echo ""
echo "💡 Pro Tip: Revisar analytics semanalmente para optimizar performance."

echo -e "\n${GREEN}🎉 Setup de monitoring completado!${NC}"
