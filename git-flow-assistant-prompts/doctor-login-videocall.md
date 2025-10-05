# 🧠 Prompt • Doctor Login + Videollamada (git-flow-assistant)

## 🎯 Meta
Validar de extremo a extremo el flujo clínico del portal de doctores en producción:
- Autenticación Supabase (correo+contraseña).
- Carga correcta del perfil médico (nombre, especialidad, estado online).
- Inicio de videollamada en tiempo real con paciente de prueba.
- Confirmación de WebRTC estable (video/audio bidireccional) y cierre limpio.

## ⚙️ Contexto operativo
- Portales productivos (`*.autamedica.com`).
- Autenticación: Supabase (JWT en `localStorage`).
- Señalización WebRTC: `wss://autamedica-signaling-server.ecucondor.workers.dev/signaling`.
- Paciente de prueba: Juan Pérez (`patient_001`).
- Herramienta de ejecución: `./git-flow-assistant` (Claude Opus 4.1).

## ✅ Checklist guiado para Claude
1. **Login médico**
   - Ir a `https://auth.autamedica.com/auth/login?role=doctor`.
   - Credenciales: `doctor.demo@autamedica.com` / `Demo1234`.
   - Confirmar redirección a `https://doctors.autamedica.com/dashboard`.
   - Validar que `localStorage.supabase.auth.token` exista y tenga un `access_token` vigente.

2. **Validación de perfil**
   - Ejecutar `await supabase.rpc('get_user_role')` (usar sesión vigente) y registrar respuesta.
   - Corroborar que `role === 'doctor'` y que el dashboard muestre:
     - Nombre profesional.
     - Especialidad principal.
     - Estado online (`Conectado`).

3. **Inicio de videollamada**
   - Localizar a “Juan Pérez” (ID `patient_001`).
   - Accionar botón “Iniciar videollamada”.
   - Guardar `room_id` (`doctor_patient_001` esperado) y `callId`.

4. **Conexión WebRTC**
   - Verificar en `RTCPeerConnection`:
     - `connectionState === 'connected'`.
     - `iceConnectionState === 'completed'` o `'connected'`.
   - Confirmar `<video>` local y remoto con `readyState === 'HAVE_ENOUGH_DATA'`.
   - Registrar logs clave de señalización.

5. **Cierre controlado**
   - Ejecutar `hangup()` / botón finalizar.
   - Confirmar envío de `call_ended` al signaling server.
   - Hacer logout seguro y limpiar storage/cookies.

## 🧪 Evidencia requerida
- Logs relevantes (auth, signaling, WebRTC) en el buffer de salida del asistente.
- JSON resumen (`/tmp/test_doctor_video_call.json`):
  ```json
  {
    "login": "success",
    "role": "doctor",
    "patient": "Juan Pérez",
    "call_status": "connected",
    "duration_sec": 120,
    "room_id": "doctor_patient_001",
    "call_id": "...",
    "notes": "Observaciones puntuales"
  }
  ```
- Adjuntar capturas opcionales (frames de video) si están disponibles.

## 🧩 Reglas adicionales
- Reintentar hasta 2 veces si falla la conexión WebRTC.
- Marcar explícitamente cualquier desviación (p. ej. paciente distinto o fallback a sala demo).
- Al finalizar, compartir próximo paso sugerido (ej. reprobar en CI, abrir incidencia).

> Usa este prompt dentro de `./git-flow-assistant` seleccionando modo "Claude Opus 4.1" y pegando el contenido en la sección de instrucciones interactivas.
