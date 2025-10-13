# Guía de Pruebas de LiveKit - AutaMedica

## Estado Actual del Sistema

### Servicios Configurados y Funcionando

**1. Signaling Server (Backend)**
- Puerto: `8888`
- URL LiveKit Cloud: `wss://eduardo-4vew3u6i.livekit.cloud`
- Estado: ✅ Operativo
- Health Check: http://localhost:8888/health

**2. App de Pacientes (Frontend)**
- Puerto: `3002`
- Estado: ✅ Operativo
- URL: http://localhost:3002

### Configuración de Variables de Entorno

#### `apps/signaling-server/.env`
```env
LIVEKIT_API_URL=wss://eduardo-4vew3u6i.livekit.cloud
LIVEKIT_API_KEY=APldeCcSqaJyrTG
LIVEKIT_API_SECRET=vJleNiqEHNONSQse4amjzhlAL4y9pN68QmOY6KHOMr
PORT=8888
```

#### `apps/patients/.env.local`
```env
# LiveKit Configuration
NEXT_PUBLIC_USE_LIVEKIT=true
NEXT_PUBLIC_LIVEKIT=true
NEXT_PUBLIC_USE_MOCK_VIDEO=false
SIGNALING_SERVICE_URL=http://localhost:8888

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ewpsepaieakqbywxnidu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Xmou75UAl7DG0gfL5Omgew_m0fptr37

# App Configuration
NODE_ENV=development
PORT=3002
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## Proceso de Inicio de Servicios

### 1. Iniciar el Signaling Server

```bash
# Instalar dependencias (solo la primera vez)
HUSKY=0 pnpm -C apps/signaling-server install

# Iniciar el servidor
pnpm -C apps/signaling-server dev
```

**Salida esperada:**
```
[DEBUG] LiveKit Config: {
  url: 'wss://eduardo-4vew3u6i.livekit.cloud',
  hasKey: true,
  hasSecret: true
}
[INFO] 2025-10-13T03:32:00.021Z [LiveKit] Service initialized
[INFO] 2025-10-13T03:32:00.029Z [Signaling] Server running on port 8888
[INFO] 2025-10-13T03:32:00.029Z [Signaling] CORS origin: http://localhost:3003
[INFO] 2025-10-13T03:32:00.029Z [Signaling] Health check: http://localhost:8888/health
```

### 2. Iniciar la App de Pacientes

```bash
# Iniciar la aplicación
pnpm --filter=@autamedica/patients dev
```

**Salida esperada:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3002
- Network:      http://192.168.0.116:3002
- Environments: .env.local

✓ Ready in 13.6s
```

## Verificación de Servicios

### Health Check del Signaling Server

```bash
curl http://localhost:8888/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T03:34:53.383Z",
  "uptime": 175.696290646,
  "activeRooms": 0,
  "activeConnections": 0
}
```

### Verificar App de Pacientes

```bash
curl http://localhost:3002
```

Debe retornar el HTML de la aplicación sin errores 500.

## Proceso de Prueba de Videollamadas

### Paso 1: Preparar Dos Sesiones

Para probar la funcionalidad bidireccional, necesitas:

1. **Navegador 1 (Paciente)**: http://localhost:3002
2. **Navegador 2 (Doctor)**: Usar app de doctors o segunda ventana de incógnito

### Paso 2: Flujo de Creación de Consulta

#### Desde el Frontend (Paciente)

1. Acceder al portal de pacientes
2. Navegar a la sección de videoconsultas
3. El componente `EnhancedVideoCall` detectará automáticamente LiveKit (via `NEXT_PUBLIC_USE_LIVEKIT=true`)
4. Al iniciar sesión, se llamará al hook `useTelemedicine`

#### Flujo del Sistema

1. **Frontend llama a API de telemedicina:**
   ```typescript
   // apps/patients/src/app/api/telemedicine/session/route.ts
   POST /api/telemedicine/session
   ```

2. **La API solicita token al signaling-server:**
   ```typescript
   const signalingUrl = ensureEnv('SIGNALING_SERVICE_URL', process.env);
   const response = await fetch(`${signalingUrl}/api/consultations/create`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       consultationId: appointmentId,
       patientId: patientData.id,
       doctorId: doctorData.id
     })
   });
   ```

3. **Signaling-server genera tokens LiveKit:**
   ```typescript
   // apps/signaling-server/src/routes.ts
   const room = await livekitService.createConsultationRoom(
     consultationId,
     patientId,
     doctorId
   );
   ```

4. **Frontend recibe credenciales:**
   ```json
   {
     "telemedicine": {
       "livekit": {
         "roomName": "consultation-123",
         "token": "eyJhbGc...",
         "url": "wss://eduardo-4vew3u6i.livekit.cloud"
       }
     }
   }
   ```

5. **EnhancedVideoCall inicia conexión:**
   ```typescript
   <LiveKitRoom
     serverUrl={session.telemedicine.livekit.url}
     token={session.telemedicine.livekit.token}
     connect={true}
   >
     <RoomAudioRenderer />
     <VideoTrack />
   </LiveKitRoom>
   ```

### Paso 3: Verificar Conexión Bidireccional

#### Checklist de Pruebas

- [ ] **Audio del paciente se escucha en el doctor**
- [ ] **Video del paciente se ve en el doctor**
- [ ] **Audio del doctor se escucha en el paciente**
- [ ] **Video del doctor se ve en el paciente**
- [ ] **Controles de mute/unmute funcionan**
- [ ] **Controles de video on/off funcionan**
- [ ] **La sesión se registra en Supabase** (tabla `telemedicine_sessions`)
- [ ] **Los eventos LiveKit se logean correctamente**

### Paso 4: Finalizar Sesión

1. El paciente o doctor hace clic en "Finalizar consulta"
2. Se llama a `telemedicine.leaveSession()`
3. La cita debe marcarse como `completed` en la base de datos
4. Los eventos de desconexión deben registrarse

## Debugging y Troubleshooting

### Ver Logs del Signaling Server

```bash
# Ver logs en tiempo real
tail -f <shell_id_logs>

# O usar BashOutput si está corriendo en background
```

### Ver Logs del Frontend

Abrir las DevTools del navegador y buscar:

```javascript
console.log('[LiveKit]', ...);
console.log('[Telemedicine]', ...);
```

### Errores Comunes

#### 1. "Failed to connect to LiveKit"

**Causa**: URL incorrecta o credenciales inválidas

**Solución**: Verificar que:
- `LIVEKIT_API_URL` usa `wss://` (no `ws://`)
- API Key y Secret son correctos
- El servidor LiveKit Cloud está accesible

#### 2. "Token expired"

**Causa**: Token LiveKit expirado (TTL: 2 horas)

**Solución**: Generar nuevo token haciendo una nueva solicitud

#### 3. "CORS error"

**Causa**: Origen no permitido en el signaling-server

**Solución**: Verificar `CORS_ORIGIN` en `.env.example` del signaling-server

#### 4. "No audio/video tracks"

**Causa**: Permisos del navegador no otorgados

**Solución**:
- Verificar permisos de cámara y micrófono en el navegador
- Usar HTTPS en producción (en local http://localhost está permitido)

## Arquitectura del Sistema

```
┌─────────────────┐
│  Navegador      │
│  (Patient)      │
│  localhost:3002 │
└────────┬────────┘
         │ 1. Solicita sesión
         ▼
┌─────────────────────────┐
│ Next.js API Route       │
│ /api/telemedicine/      │
│ session                 │
└────────┬────────────────┘
         │ 2. Solicita token
         ▼
┌─────────────────────────┐
│ Signaling Server        │
│ localhost:8888          │
│ /api/consultations/     │
│ create                  │
└────────┬────────────────┘
         │ 3. Crea sala y tokens
         ▼
┌─────────────────────────┐
│ LiveKit Cloud           │
│ wss://eduardo-4vew...   │
│ .livekit.cloud          │
└─────────────────────────┘
         ▲
         │ 4. Conexión WebRTC
         │
┌────────┴────────┐
│ Navegadores     │
│ Patient + Doctor│
└─────────────────┘
```

## Monitoreo de Sesiones

### Ver Salas Activas

```bash
curl http://localhost:8888/api/rooms/list
```

### Ver Estadísticas de una Sala

```bash
curl http://localhost:8888/api/rooms/stats?roomName=consultation-123
```

## Próximos Pasos

1. **Implementar app de doctors** con interfaz LiveKit
2. **Agregar recording** cuando se configure S3/R2
3. **Implementar chat en tiempo real** usando LiveKit Data Channels
4. **Agregar transcripción automática** de consultas
5. **Implementar métricas de calidad** (latencia, packet loss, etc.)

## Referencias

- [LiveKit Docs](https://docs.livekit.io/)
- [LiveKit React Components](https://docs.livekit.io/reference/components/react/)
- [LiveKit Server SDK](https://docs.livekit.io/server/quickstart/)
- Código fuente:
  - `apps/signaling-server/src/livekit.ts` - Servicio LiveKit
  - `apps/signaling-server/src/routes.ts` - Endpoints API
  - `apps/patients/src/components/telemedicine/EnhancedVideoCall.tsx` - UI
  - `apps/patients/src/hooks/useTelemedicine.ts` - Hook de telemedicina
  - `apps/patients/src/app/api/telemedicine/session/route.ts` - API Route

## Estado Final

✅ **Signaling Server**: Corriendo en puerto 8888
✅ **Patients App**: Corriendo en puerto 3002
✅ **Configuración LiveKit**: Completa y operativa
✅ **Variables de entorno**: Configuradas correctamente

**Sistema listo para pruebas de videollamadas bidireccionales.**
