# Configuración de TURN Servers para WebRTC en Producción

## 🎯 Propósito

Los servidores TURN (Traversal Using Relays around NAT) son **críticos** para garantizar conectividad WebRTC en entornos con firewalls restrictivos o NAT simétrico (~10-15% de usuarios).

Sin TURN servers, las videollamadas fallarán para usuarios detrás de:
- Firewalls corporativos
- Redes móviles con NAT estricto
- ISPs con CG-NAT (Carrier-Grade NAT)

---

## 🏗️ Opciones de Implementación

### Opción 1: Twilio (Recomendado para MVP)

**Ventajas:**
- ✅ Setup en 5 minutos
- ✅ Global edge locations
- ✅ 99.99% uptime SLA
- ✅ Pay-as-you-go pricing

**Costos:**
- $0.0004 USD por minuto de relay
- ~$1 USD por 40 horas de videollamadas

**Configuración:**

```bash
# 1. Crear cuenta en Twilio (https://www.twilio.com)
# 2. Obtener credenciales TURN desde Network Traversal Service

# 3. Configurar variables de entorno
NEXT_PUBLIC_TURN_URLS=turn:global.turn.twilio.com:3478?transport=udp,turn:global.turn.twilio.com:3478?transport=tcp,turn:global.turn.twilio.com:443?transport=tcp
NEXT_PUBLIC_TURN_USERNAME=<your-twilio-sid>
NEXT_PUBLIC_TURN_CREDENTIAL=<your-twilio-auth-token>
```

---

### Opción 2: Cloudflare Calls (Beta)

**Ventajas:**
- ✅ Integración nativa con Cloudflare Workers
- ✅ Global anycast network
- ✅ Generación dinámica de credenciales TURN

**Estado:** Beta pública (Septiembre 2024)

**Documentación:** https://developers.cloudflare.com/calls/

---

### Opción 3: Servidor Propio (coturn)

**Ventajas:**
- ✅ Control total
- ✅ Sin costos por minuto
- ✅ HIPAA compliant

**Requisitos:**
- VPS con IP pública estática
- Puertos abiertos: 3478 (UDP/TCP), 5349 (TLS)
- Certificado SSL válido

**Setup con coturn (Ubuntu):**

```bash
# 1. Instalar coturn
sudo apt-get update
sudo apt-get install coturn

# 2. Configurar /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
listening-ip=<server-public-ip>
relay-ip=<server-public-ip>
external-ip=<server-public-ip>

realm=autamedica.com
server-name=turn.autamedica.com

# Autenticación
lt-cred-mech
user=autamedica:<secure-password>

# SSL certificates (Let's Encrypt)
cert=/etc/letsencrypt/live/turn.autamedica.com/fullchain.pem
pkey=/etc/letsencrypt/live/turn.autamedica.com/privkey.pem

# Logs
verbose
log-file=/var/log/turnserver.log

# 3. Habilitar y arrancar
sudo systemctl enable coturn
sudo systemctl start coturn

# 4. Abrir puertos en firewall
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 5349/udp
```

**Variables de entorno:**

```bash
NEXT_PUBLIC_TURN_URLS=turn:turn.autamedica.com:3478,turns:turn.autamedica.com:5349
NEXT_PUBLIC_TURN_USERNAME=autamedica
NEXT_PUBLIC_TURN_CREDENTIAL=<secure-password>
```

---

## 🧪 Testing de TURN Servers

### Test automático con Trickle ICE

Visitar: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

**Configurar:**
1. Agregar TURN servers en "ICE servers"
2. Click "Gather candidates"
3. Verificar que aparezcan candidatos tipo "relay"

**Output esperado:**
```
relay 10.20.30.40 54321 typ relay raddr 192.168.1.100 rport 12345
```

### Test desde código

```typescript
import { WebRTCDiagnostics } from '@autamedica/shared'

// Test TURN connectivity
const isValid = await WebRTCDiagnostics.testICEServers([
  {
    urls: ['turn:turn.autamedica.com:3478'],
    username: 'autamedica',
    credential: 'secure-password'
  }
])

console.log('TURN servers valid:', isValid)
```

---

## 📊 Monitoring en Producción

### Métricas clave:

```typescript
import { WebRTCDiagnostics } from '@autamedica/shared'

const stats = await WebRTCDiagnostics.getConnectionStats(peerConnection)

console.log({
  connectionState: stats.connectionState,
  iceConnectionState: stats.iceConnectionState,
  bytesReceived: stats.bytesReceived,
  bytesSent: stats.bytesSent,
})
```

### Alertas recomendadas:

- ❌ `iceConnectionState === 'failed'` → Reconexión automática
- ⚠️ `bytesReceived === 0` por >10s → Calidad de red degradada
- 🔄 Reconexiones frecuentes → Revisar TURN servers

---

## 🔐 Seguridad

### Credenciales temporales (Recomendado)

Generar credenciales TURN de corta duración (30 min) usando HMAC:

```typescript
// Server-side (Next.js API route)
import crypto from 'crypto'

export async function POST(req: Request) {
  const timestamp = Math.floor(Date.now() / 1000) + 1800 // 30 min
  const username = `${timestamp}:autamedica`

  const hmac = crypto.createHmac('sha1', TURN_SECRET)
  hmac.update(username)
  const credential = hmac.digest('base64')

  return Response.json({
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302'] },
      {
        urls: ['turn:turn.autamedica.com:3478'],
        username,
        credential,
      }
    ]
  })
}
```

---

## 🚀 Deployment Checklist

- [ ] Configurar variables de entorno en Cloudflare Pages
- [ ] Verificar TURN servers con Trickle ICE test
- [ ] Implementar monitoring de `iceConnectionState`
- [ ] Configurar alertas para conexiones fallidas
- [ ] Documentar credenciales TURN en 1Password/Vault
- [ ] Setup de backup TURN server (failover)
- [ ] Performance testing con usuarios reales

---

## 📚 Referencias

- [WebRTC TURN RFC](https://datatracker.ietf.org/doc/html/rfc5766)
- [Twilio TURN Servers](https://www.twilio.com/docs/stun-turn)
- [coturn Setup Guide](https://github.com/coturn/coturn/wiki/turnserver)
- [Cloudflare Calls Beta](https://developers.cloudflare.com/calls/)

---

**Última actualización:** 2025-10-04
**Responsable:** Claude Code - DevOps
