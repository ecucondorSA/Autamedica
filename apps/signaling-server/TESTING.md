# 🧪 Testing WebRTC Implementation

## ✅ Backend Funcionando

### 1. Verificar Servidor
```bash
# El servidor debe estar corriendo en puerto 8888
curl http://localhost:8888/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-10-05T...",
  "uptime": 1234.56,
  "activeRooms": 0,
  "activeConnections": 0
}
```

### 2. Crear Sala de Consulta
```bash
curl -X POST http://localhost:8888/api/consultations/create \
  -H 'Content-Type: application/json' \
  -d '{
    "consultationId": "test-001",
    "patientId": "patient-maria",
    "doctorId": "doctor-carlos"
  }' | jq .
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "consultationId": "test-001",
    "roomName": "consultation-test-001",
    "roomSid": "RM_xyz123",
    "patientId": "patient-maria",
    "doctorId": "doctor-carlos",
    "patientToken": "eyJhbGci...",
    "doctorToken": "eyJhbGci...",
    "livekitUrl": "https://eduardo-4vew3u6i.livekit.cloud",
    "createdAt": "2025-10-05T..."
  }
}
```

### 3. Listar Salas Activas
```bash
curl http://localhost:8888/api/rooms/active | jq .
```

## 🖥️ Frontend Testing

### 1. Iniciar App de Pacientes
```bash
cd /root/Autamedica/apps/patients
pnpm dev
```

**URL**: http://localhost:3002

### 2. Acceder a Videoconsulta
Abrir en el navegador:
```
http://localhost:3002/consultation/test-consultation-123
```

### 3. Flujo de Prueba

**Pantalla de Pre-Consulta:**
1. ✅ Verifica que aparezca la pantalla de preparación
2. ✅ Lee las instrucciones de privacidad
3. ✅ Click en "Unirse a la Consulta"

**Sala de Videoconsulta:**
1. ✅ Permite acceso a cámara y micrófono
2. ✅ Verifica que aparezca tu video
3. ✅ Prueba controles:
   - Silenciar/activar micrófono
   - Encender/apagar cámara
   - Abrir chat (opcional)
   - Colgar llamada

## 🎭 Prueba Multi-Usuario

Para probar una consulta real entre paciente y doctor:

### Terminal 1: Crear Sala
```bash
curl -X POST http://localhost:8888/api/consultations/create \
  -H 'Content-Type: application/json' \
  -d '{
    "consultationId": "live-test-001",
    "patientId": "patient-test",
    "doctorId": "doctor-test"
  }' | jq .
```

**Guardar los tokens** de la respuesta.

### Terminal 2: Navegador Paciente
```
http://localhost:3002/consultation/live-test-001
```
(Automáticamente usa patientToken)

### Terminal 3: Navegador Doctor (Incógnito)
```
http://localhost:3002/consultation/live-test-001?role=doctor
```
(Usaría doctorToken si implementamos el parámetro)

## 🐛 Debugging

### Logs del Servidor
```bash
# Ver logs en tiempo real
tail -f /root/Autamedica/apps/signaling-server/logs/server.log

# O en la consola donde corre pnpm dev
```

**Logs Esperados:**
```
[INFO] [LiveKit] Service initialized
[INFO] [Signaling] Server running on port 8888
[INFO] [API] Creating consultation room: test-001
[INFO] [LiveKit] Creating room: consultation-test-001
[INFO] [LiveKit] Room created: consultation-test-001 (SID: RM_xyz)
[INFO] [LiveKit] Token generated for patient: patient-maria
[INFO] [LiveKit] Token generated for doctor: doctor-carlos
```

### Logs del Frontend
Abrir DevTools del navegador (F12):

**Console esperada:**
```javascript
[LiveKit] Connecting to wss://eduardo-4vew3u6i.livekit.cloud
[LiveKit] Connected to room: consultation-test-001
[LiveKit] Local participant joined
```

### Errores Comunes

**Error: "Failed to create consultation room"**
- ✅ Verificar que el signaling server esté corriendo
- ✅ Verificar credenciales LiveKit en `.env`
- ✅ Verificar conectividad a LiveKit Cloud

**Error: "Camera/Microphone permission denied"**
- ✅ Permitir acceso en el navegador
- ✅ Verificar que no haya otra app usando la cámara
- ✅ Usar HTTPS en producción (localhost funciona con HTTP)

**Error: "Connection timeout"**
- ✅ Verificar firewall/red
- ✅ LiveKit Cloud requiere conexión a internet
- ✅ Verificar que el token no haya expirado (2 horas)

## 📊 Verificación de Conectividad

### Test de Red
```bash
# Verificar conexión a LiveKit Cloud
curl -I https://eduardo-4vew3u6i.livekit.cloud

# Debería retornar 200 OK o 404 (ambos indican que el servidor responde)
```

### Test de WebSocket
```javascript
// En la consola del navegador
const ws = new WebSocket('wss://eduardo-4vew3u6i.livekit.cloud');
ws.onopen = () => console.log('✅ WebSocket conectado');
ws.onerror = (e) => console.error('❌ Error:', e);
```

## 🎯 Checklist de Testing

- [ ] ✅ Servidor signaling corriendo en puerto 8888
- [ ] ✅ Health check retorna status ok
- [ ] ✅ API crea salas correctamente
- [ ] ✅ Tokens generados válidos (no expirados)
- [ ] ✅ App frontend carga sin errores
- [ ] ✅ Página de consulta accesible
- [ ] ✅ Conexión a LiveKit Cloud exitosa
- [ ] ✅ Cámara y micrófono funcionando
- [ ] ✅ Controles de UI respondiendo
- [ ] ✅ Chat funcionando (opcional)
- [ ] ✅ Desconexión limpia al salir

## 🚀 Siguiente Paso: Implementar Portal Médico

Para completar el flujo completo, necesitas:

1. **Crear componente para médicos** en `/apps/doctors`
2. **Habilitar screen sharing** para doctores
3. **Implementar grabación** (cuando configures S3)
4. **Integrar con sistema de citas** existente

---

**Estado**: ✅ Backend 100% funcional | ✅ Frontend básico implementado
**Última actualización**: 2025-10-05
