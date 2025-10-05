# 🎥 WebRTC Implementation - AutaMedica

## 📊 Resumen de Implementación

Hemos implementado un **sistema híbrido de videoconsultas** que soporta:
1. **WebRTC Peer-to-Peer** (Socket.io) - Para consultas 1:1 simples
2. **LiveKit SFU** - Para consultas escalables y features enterprise

---

## 🏗️ Arquitectura Implementada

```
┌─────────────────────────────────────────────────────┐
│                 Signaling Server                     │
│                   (Port 8888)                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────┐       ┌────────────────────┐   │
│  │   Socket.io   │       │   LiveKit REST     │   │
│  │   (WebRTC     │       │      API           │   │
│  │    P2P)       │       │   (Scalable)       │   │
│  └───────────────┘       └────────────────────┘   │
│         │                         │                 │
│         │                         │                 │
│         ▼                         ▼                 │
│  ┌───────────────┐       ┌────────────────────┐   │
│  │  RoomManager  │       │  LiveKitService    │   │
│  │  (P2P Rooms)  │       │  (SFU Rooms)       │   │
│  └───────────────┘       └────────────────────┘   │
│         │                         │                 │
│         └─────────┬───────────────┘                 │
│                   │                                 │
│                   ▼                                 │
│            ┌─────────────┐                         │
│            │  Supabase   │                         │
│            │  (Tracking) │                         │
│            └─────────────┘                         │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Creados

### Backend (Signaling Server)

1. **`src/livekit.ts`** - LiveKit Service
   - Gestión de salas de consulta
   - Generación de tokens por rol
   - Recording HIPAA compliant
   - Estadísticas de salas

2. **`src/routes.ts`** - REST API Endpoints
   - `POST /api/consultations/create` - Crear sala
   - `POST /api/consultations/:id/recording/start` - Iniciar grabación
   - `POST /api/consultations/:id/recording/stop` - Detener grabación
   - `GET /api/rooms/active` - Listar salas activas
   - `GET /api/rooms/:roomName/stats` - Estadísticas
   - `DELETE /api/rooms/:roomName/participants/:identity` - Desconectar participante

3. **`.env.example`** - Variables de entorno actualizadas

### Sistema Existente (Mantenido)

- ✅ `src/server.ts` - Socket.io signaling (P2P)
- ✅ `src/rooms.ts` - Room management P2P
- ✅ `src/auth.ts` - Authentication
- ✅ `src/types.ts` - TypeScript types

---

## 🚀 API Endpoints LiveKit

### Crear Sala de Consulta

```bash
POST http://localhost:8888/api/consultations/create
Content-Type: application/json

{
  "consultationId": "uuid-consultation-id",
  "patientId": "uuid-patient-id",
  "doctorId": "uuid-doctor-id"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "roomName": "consultation-uuid",
    "roomSid": "RM_xxx",
    "patientId": "uuid",
    "doctorId": "uuid",
    "patientToken": "eyJhbGci...",
    "doctorToken": "eyJhbGci...",
    "livekitUrl": "ws://localhost:7880",
    "createdAt": "2025-10-05T..."
  }
}
```

### Iniciar Grabación

```bash
POST http://localhost:8888/api/consultations/{id}/recording/start
Content-Type: application/json

{
  "roomName": "consultation-uuid"
}
```

### Detener Grabación

```bash
POST http://localhost:8888/api/consultations/{id}/recording/stop
Content-Type: application/json

{
  "egressId": "EG_xxx"
}
```

### Listar Salas Activas

```bash
GET http://localhost:8888/api/rooms/active
```

### Estadísticas de Sala

```bash
GET http://localhost:8888/api/rooms/{roomName}/stats
```

---

## 🔐 Sistema de Tokens por Rol

### Paciente
- ✅ Puede unirse a la sala
- ✅ Puede publicar cámara y micrófono
- ❌ No puede compartir pantalla
- ❌ No puede grabar

### Doctor
- ✅ Puede unirse a la sala
- ✅ Puede publicar cámara, micrófono y pantalla
- ✅ Puede iniciar/detener grabación
- ✅ Puede desconectar participantes

### Observador (Opcional)
- ✅ Puede unirse a la sala
- ✅ Solo puede ver/escuchar
- ❌ No puede publicar media
- ❌ No puede grabar

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Configuración mínima:**

```env
# Server
PORT=8888
CORS_ORIGIN=http://localhost:3003

# Supabase (opcional, para tracking)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# LiveKit (REQUERIDO para SFU)
LIVEKIT_API_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Instalar LiveKit Server (Local Development)

**Opción 1: Docker (Recomendado)**

```bash
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: devsecret" \
  livekit/livekit-server --dev
```

**Opción 2: Binary**

```bash
# Descargar desde https://github.com/livekit/livekit/releases
curl -sSL https://get.livekit.io | bash

# Ejecutar en modo desarrollo
livekit-server --dev
```

**Opción 3: LiveKit Cloud (Producción)**

1. Crear cuenta en https://cloud.livekit.io
2. Obtener API Key y Secret
3. Usar `wss://your-project.livekit.cloud` como URL

---

## 🚀 Iniciar el Servidor

```bash
# Desarrollo (con hot reload)
pnpm dev

# Producción
pnpm build
pnpm start
```

**Endpoints disponibles:**

- WebSocket (P2P): `ws://localhost:8888`
- Health check: `http://localhost:8888/health`
- REST API: `http://localhost:8888/api/*`

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8888/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T...",
  "uptime": 1234.56,
  "activeRooms": 3,
  "activeConnections": 6
}
```

### Logs

El servidor utiliza un logger estructurado que muestra:
- ✅ Conexiones/desconexiones
- ✅ Creación de salas
- ✅ Inicio/fin de grabaciones
- ✅ Errores y excepciones

```
[2025-10-05 10:30:00] [LiveKit] Service initialized
[2025-10-05 10:30:05] [API] Creating consultation room: uuid-123
[2025-10-05 10:30:06] [LiveKit] Room created: consultation-uuid-123 (SID: RM_abc123)
[2025-10-05 10:30:10] [LiveKit] Token generated for doctor: doctor-uuid
[2025-10-05 10:30:11] [LiveKit] Token generated for patient: patient-uuid
```

---

## 🔄 Flujo de Videoconsulta

### 1. Crear Sala (Backend)

```typescript
// Backend crea la sala
const response = await fetch('http://localhost:8888/api/consultations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consultationId: 'uuid-123',
    patientId: 'patient-uuid',
    doctorId: 'doctor-uuid'
  })
});

const { data } = await response.json();
// data.patientToken, data.doctorToken
```

### 2. Frontend se Conecta (✅ IMPLEMENTADO)

```typescript
// apps/patients/src/components/consultation/VideoConsultation.tsx
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

<LiveKitRoom
  token={consultationData.data.patientToken} // o doctorToken
  serverUrl={consultationData.data.livekitUrl} // wss://eduardo-4vew3u6i.livekit.cloud
  connect={true}
  video={true}
  audio={true}
  onDisconnected={handleDisconnect}
>
  <RoomAudioRenderer />
  <VideoConference />
  <ControlBar variation="minimal" />
</LiveKitRoom>
```

**Ruta de Prueba:**
```
http://localhost:3002/consultation/test-consultation-123
```

### 3. Doctor Inicia Grabación

```typescript
await fetch(`http://localhost:8888/api/consultations/${consultationId}/recording/start`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomName: 'consultation-uuid-123'
  })
});
```

### 4. Finalizar Consulta

```typescript
// Detener grabación
await fetch(`http://localhost:8888/api/consultations/${consultationId}/recording/stop`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    egressId: 'EG_xxx'
  })
});

// Desconectar del frontend (automático al cerrar)
```

---

## 🔒 Seguridad

### Tokens con Expiración

- ✅ Tokens válidos por 2 horas
- ✅ Permisos granulares por rol
- ✅ Metadata cifrada en tokens

### HIPAA Compliance

- ✅ Encryption in transit (DTLS + TLS)
- ✅ Encryption at rest (recordings)
- ✅ Audit logs en base de datos
- ✅ Access control por rol

---

## 📈 Próximos Pasos

### ✅ Completado

1. LiveKit Service backend
2. REST API endpoints
3. Token generation por rol
4. Recording support
5. Room management
6. Variables de entorno

### 🚧 Pendiente

1. **Frontend Components**
   - VideoConsultation React component
   - Toggle P2P vs LiveKit
   - UI controls (mute, video, screen share)

2. **Features Adicionales**
   - Chat durante consulta
   - Screen sharing
   - Virtual backgrounds
   - Network quality indicators

3. **Production Setup**
   - Twilio TURN servers
   - S3 para recordings
   - DataDog monitoring
   - Load testing

---

## 🧪 Testing

### Test Manual API

```bash
# 1. Health check
curl http://localhost:8888/health

# 2. Crear consulta
curl -X POST http://localhost:8888/api/consultations/create \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": "test-123",
    "patientId": "patient-123",
    "doctorId": "doctor-123"
  }'

# 3. Listar salas activas
curl http://localhost:8888/api/rooms/active

# 4. Stats de sala
curl http://localhost:8888/api/rooms/consultation-test-123/stats
```

### Test con Postman

Importar colección desde: `postman_collection.json` (próximo)

---

## 📚 Referencias

- LiveKit Docs: https://docs.livekit.io
- LiveKit Server SDK: https://github.com/livekit/server-sdk-js
- Socket.io Docs: https://socket.io/docs/

---

**Última actualización:** 2025-10-05
**Versión:** 1.0.0
**Autor:** AutaMedica DevOps Team
