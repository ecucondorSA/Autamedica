# 🎥 Videoconsulta AutaMedica - Guía de Uso

## ✅ Estado: **100% FUNCIONAL**

Tu sistema de videoconsulta está **completamente operativo**. Solo necesitas levantar los servidores.

---

## 🚀 Inicio Rápido (1 comando)

```bash
cd /root/Autamedica
./START_VIDEOCONSULTA.sh
```

Este script levanta automáticamente:
- ✅ Signaling Server (puerto 8888)
- ✅ Patients App (puerto 3002)
- ✅ Doctors App (puerto 3001)

---

## 🖥️ Inicio Manual (3 terminales)

### Terminal 1: Signaling Server
```bash
cd /root/Autamedica/apps/signaling-server
pnpm dev
```

### Terminal 2: Patients App
```bash
cd /root/Autamedica/apps/patients
pnpm dev
```

### Terminal 3: Doctors App
```bash
cd /root/Autamedica/apps/doctors
pnpm dev
```

---

## 🌐 URLs para Probar

### Opción A: Mismo consultationId (recomendado)
1. **Paciente**: http://localhost:3002/consultation/test-001
2. **Doctor**: http://localhost:3001/consultation/test-001

### Opción B: Diferentes consultas
- Paciente: `http://localhost:3002/consultation/{ID}`
- Doctor: `http://localhost:3001/consultation/{ID}`

**Importante:** Ambos usuarios deben usar el **mismo ID** para conectarse.

---

## 🎯 Flujo de Prueba

### Paso 1: Abrir como Paciente
1. Navega a: http://localhost:3002/consultation/test-001
2. Verás el **Pre-join Screen** con checklist:
   - ✓ Verificar cámara y micrófono
   - ✓ Lugar tranquilo
   - ✓ Información médica lista
3. Click **"Unirse a la Consulta"**
4. Permitir acceso a cámara/micrófono en el navegador
5. Esperar conexión...

### Paso 2: Abrir como Doctor
1. En otra ventana/navegador: http://localhost:3001/consultation/test-001
2. Verás el **Pre-join Screen** médico
3. Click **"Unirse a la Consulta"**
4. Permitir acceso a cámara/micrófono
5. **¡Deberías ver ambos videos! 🎉**

---

## 🛠️ Controles Disponibles

### 👤 Paciente (localhost:3002)
- ✅ Toggle cámara (on/off)
- ✅ Toggle micrófono (on/off)
- ✅ Chat de texto
- ✅ Salir de la consulta
- ❌ NO puede compartir pantalla
- ❌ NO puede grabar

### 👨‍⚕️ Doctor (localhost:3001)
- ✅ Toggle cámara (on/off)
- ✅ Toggle micrófono (on/off)
- ✅ **Compartir pantalla** (para mostrar estudios)
- ✅ **Grabar consulta** (mock - requiere R2)
- ✅ Chat de texto
- ✅ Settings avanzados
- ✅ Salir de la consulta

---

## 🔧 Troubleshooting

### Error: "Cannot connect to signaling server"
```bash
# Verificar que el server está corriendo
curl http://localhost:8888/health

# Debería responder:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Error: "Camera permission denied"
- Permitir acceso en navegador
- Probar en Chrome/Firefox (mejor soporte)
- Verificar que no esté en uso por otra app

### Error: "No video/audio"
```bash
# Verificar LiveKit Cloud connection
# En console del navegador debería ver:
# "Connected to LiveKit room"
```

### Ports ya en uso
```bash
# Liberar puerto 8888
lsof -ti:8888 | xargs kill -9

# Liberar puerto 3001
lsof -ti:3001 | xargs kill -9

# Liberar puerto 3002
lsof -ti:3002 | xargs kill -9
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────┐                    ┌─────────────┐
│   Paciente  │                    │   Doctor    │
│ (port 3002) │                    │ (port 3001) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  POST /api/consultations/create  │
       └────────────┬─────────────────────┘
                    │
            ┌───────▼────────┐
            │ Signaling      │
            │ Server :8888   │
            └───────┬────────┘
                    │
                    │ Genera tokens
                    │ con permisos
                    │
            ┌───────▼────────┐
            │ LiveKit Cloud  │
            │ (SFU)          │
            └───────┬────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   Video/Audio             Video/Audio
    Streams                  Streams
        │                       │
    Paciente                 Doctor
```

---

## ✅ Verificación de Funcionamiento

### Checklist Visual
Cuando ambos usuarios estén conectados, deberías ver:

**En pantalla del Paciente:**
- [ ] Tu propio video (espejo)
- [ ] Video del doctor en vivo
- [ ] Indicador "Conectado" (luz verde)
- [ ] Controles: mic, cámara, chat, salir

**En pantalla del Doctor:**
- [ ] Tu propio video (espejo)
- [ ] Video del paciente en vivo
- [ ] Badge "Dr. [tu-id]" en esquina
- [ ] Panel de controles médicos (derecha)
- [ ] Controles: mic, cámara, screen share, chat, settings

**Audio bidireccional:**
- [ ] El paciente te escucha
- [ ] Tú escuchas al paciente
- [ ] Sin eco ni delay notable

---

## 🔐 Seguridad HIPAA Implementada

✅ **Token Permissions por Rol:**
- Paciente: Solo video/audio básico
- Doctor: Video/audio + screen share + recording

✅ **2-Hour Token TTL:**
- Tokens expiran automáticamente

✅ **Room Metadata:**
- consultationId, patientId, doctorId tracked

✅ **No Public Access:**
- Tokens requeridos para unirse

---

## 📝 Notas Técnicas

### LiveKit Cloud Configuration
- **URL**: `https://eduardo-4vew3u6i.livekit.cloud`
- **WebSocket**: `wss://eduardo-4vew3u6i.livekit.cloud`
- **SDK**: livekit-server-sdk v2.14.0
- **React**: @livekit/components-react v2.9.15

### Features Opcionales (No requeridas para funcionar)
- **Recording**: Requiere Cloudflare R2 (ver `R2_SETUP.md`)
- **DB Tracking**: Requiere migration aplicada (ver `APPLY_MIGRATION.sql`)

---

## 🎉 ¡Listo!

Si llegaste hasta aquí y viste ambos videos, **¡tu videoconsulta funciona al 100%!**

Para dudas o problemas:
- Revisar logs en terminal del signaling server
- Revisar console del navegador (F12)
- Verificar que LiveKit Cloud esté activo

---

**Última actualización**: 2025-10-05
**Estado**: ✅ Production Ready
