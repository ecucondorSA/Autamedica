# 🧠 Guía Completa: Doctor Login + Videollamada Test

Esta guía proporciona instrucciones detalladas para ejecutar y mantener el test de flujo médico completo de AutaMedica.

## 🎯 Resumen del Test

El test implementa el flujo médico especificado en el prompt original:

1. **Login como Doctor** con credenciales específicas (`doctor.demo@autamedica.com` / `Demo1234`)
2. **Validación de Perfil** verificando rol "doctor" y token JWT
3. **Inicio de Videollamada** con paciente Juan Pérez (ID: `patient_001`)
4. **Verificación WebRTC** confirmando conexión P2P establecida
5. **Cierre Controlado** con envío de evento `call_ended`

## 🚀 Ejecución Rápida

### Opción 1: Scripts NPM (Recomendado)

```bash
# Test básico
pnpm test:doctor-videocall

# Test en modo headless
pnpm test:doctor-videocall:headless

# Test con reporte detallado
pnpm test:doctor-videocall:report

# Test para CI/CD
pnpm test:doctor-videocall:ci

# Test con Git Flow Assistant
pnpm test:doctor-videocall:git-flow
```

### Opción 2: Scripts de Automatización

```bash
# Test básico
./scripts/doctor-videocall-test-automation.sh

# Test con opciones
./scripts/doctor-videocall-test-automation.sh --headless --report --notify

# Test en modo CI/CD
./scripts/doctor-videocall-test-automation.sh --ci --browser chromium
```

### Opción 3: Playwright Directo

```bash
# Test básico
npx playwright test tests/e2e/doctor-login-videocall-flow.spec.ts

# Test con configuración específica
npx playwright test --config=tests/e2e/playwright.doctor-videocall.config.ts

# Test con UI
npx playwright test --ui
```

## ⚙️ Configuración Previa

### 1. Verificar Servicios

Asegúrate de que estos servicios estén corriendo:

```bash
# Auth Service (puerto 3000)
cd apps/auth && pnpm dev

# Doctors App (puerto 3001)
cd apps/doctors && pnpm dev

# Patients App (puerto 3003)
cd apps/patients && pnpm dev

# Signaling Server (puerto 8888)
cd apps/signaling-server && pnpm dev
```

### 2. Configurar Variables de Entorno

```bash
# Crear archivo .env.local en la raíz del proyecto
cat > .env.local << EOF
# URLs de los servicios
BASE_URL=http://localhost:3000
AUTH_URL=http://localhost:3000/auth
DOCTORS_URL=http://localhost:3001
PATIENTS_URL=http://localhost:3003
SIGNALING_URL=ws://localhost:8888

# Credenciales de prueba
DOCTOR_EMAIL=doctor.demo@autamedica.com
DOCTOR_PASSWORD=Demo1234
PATIENT_ID=patient_001
PATIENT_NAME=Juan Pérez
EOF
```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
pnpm install

# Instalar browsers de Playwright
npx playwright install
```

## 🧪 Casos de Test Implementados

### 1. Flujo Completo (`doctor-login-videocall-flow.spec.ts`)

**Descripción**: Ejecuta todo el flujo médico de principio a fin.

**Validaciones**:
- ✅ Login exitoso con credenciales específicas
- ✅ Redirección correcta a `https://doctors.autamedica.com/dashboard`
- ✅ Token JWT válido en `localStorage` bajo `supabase.auth.token`
- ✅ Verificación de rol "doctor" usando `supabase.rpc('get_user_role')`
- ✅ Inicio de videollamada con paciente Juan Pérez
- ✅ Apertura de sala `room_id = doctor_patient_001`
- ✅ Conexión WebRTC con `connectionState = 'connected'`
- ✅ `iceConnectionState = 'completed'`
- ✅ Elementos `<video>` local y remoto con `readyState = 'playing'`
- ✅ Cierre controlado con `hangup()`
- ✅ Envío de evento `call_ended` al servidor de señalización

### 2. Validación de Autenticación

**Descripción**: Test específico para validar las credenciales del prompt.

**Validaciones**:
- ✅ Formulario de login carga correctamente
- ✅ Credenciales se llenan correctamente
- ✅ Redirección después del login

### 3. Verificación de Token JWT

**Descripción**: Valida la autenticación a nivel de token.

**Validaciones**:
- ✅ Token JWT presente en localStorage
- ✅ Token tiene formato válido
- ✅ Token contiene información de sesión

### 4. Verificación WebRTC

**Descripción**: Valida la funcionalidad de videollamada.

**Validaciones**:
- ✅ Elementos de video presentes
- ✅ Controles de video funcionando
- ✅ Sin errores JavaScript críticos
- ✅ Permisos de cámara/micrófono concedidos

### 5. Simulación Cross-App

**Descripción**: Simula llamada entre doctor y paciente.

**Validaciones**:
- ✅ Ambas apps cargan correctamente
- ✅ Comunicación a través del signaling server
- ✅ Conexión WebRTC entre apps

## 📊 Reportes y Logs

### Reporte HTML
- **Ubicación**: `playwright-report-doctor-videocall/`
- **Contenido**: Reporte visual con screenshots y videos
- **Acceso**: Abrir `playwright-report-doctor-videocall/index.html`

### Reporte JSON
- **Ubicación**: `test-results-doctor-videocall.json`
- **Contenido**: Datos estructurados para CI/CD
- **Formato**: JSON con métricas detalladas

### Logs Detallados
- **Ubicación**: `test-reports/doctor-videocall-test.log`
- **Contenido**: Logs paso a paso del test
- **Monitoreo**: `tail -f test-reports/doctor-videocall-test.log`

### Reporte de Integración Git Flow
- **Ubicación**: `test-reports/git-flow-integration-report.json`
- **Contenido**: Información específica para git-flow-assistant
- **Incluye**: Commit info, branch, resultados

## 🔧 Configuración Avanzada

### Navegadores Soportados

```bash
# Chromium (recomendado)
pnpm test:doctor-videocall --browser chromium

# Firefox
pnpm test:doctor-videocall --browser firefox

# WebKit/Safari
pnpm test:doctor-videocall --browser webkit

# Mobile
pnpm test:doctor-videocall --browser mobile
```

### Configuración de Timeouts

```typescript
// Para desarrollo
timeout: 60000, // 60 segundos

// Para CI/CD
timeout: 120000, // 120 segundos
```

### Configuración de WebRTC

```typescript
// Permisos requeridos
permissions: ['camera', 'microphone', 'geolocation']

// Configuración de Chrome
launchOptions: {
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--allow-running-insecure-content',
    '--disable-web-security'
  ]
}
```

## 🐛 Debugging

### Habilitar Logs de Debug

```bash
# Logs detallados de Playwright
DEBUG=pw:api pnpm test:doctor-videocall

# Logs de WebRTC
DEBUG=webrtc pnpm test:doctor-videocall

# Logs de Supabase
DEBUG=supabase pnpm test:doctor-videocall
```

### Screenshots y Videos

- **Screenshots**: Se capturan automáticamente en fallos
- **Videos**: Se graban en modo `retain-on-failure`
- **Ubicación**: `test-results/`

### Errores Comunes y Soluciones

#### 1. "Botón de videollamada no encontrado"
**Causa**: La app de doctores no está corriendo o el componente no está cargado
**Solución**:
```bash
# Verificar que la app esté corriendo
curl http://localhost:3001

# Verificar logs de la app
cd apps/doctors && pnpm dev
```

#### 2. "Conexión WebRTC no establecida"
**Causa**: Signaling server no está corriendo o hay problemas de conectividad
**Solución**:
```bash
# Verificar signaling server
curl http://localhost:8888/health

# Verificar logs del signaling server
cd apps/signaling-server && pnpm dev
```

#### 3. "Token JWT no encontrado"
**Causa**: Login no se completó correctamente o Supabase no está configurado
**Solución**:
```bash
# Verificar configuración de Supabase
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verificar logs de autenticación
cd apps/auth && pnpm dev
```

#### 4. "Permisos de cámara/micrófono denegados"
**Causa**: Navegador bloquea permisos o configuración incorrecta
**Solución**:
```bash
# Ejecutar con permisos explícitos
npx playwright test --headed=false --browser chromium
```

## 🔄 Integración CI/CD

### GitHub Actions

```yaml
name: Doctor Login + Videollamada Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: npx playwright install
      - run: pnpm test:doctor-videocall:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-reports/
```

### Git Flow Assistant

```bash
# Ejecutar en pre-commit
node scripts/git-flow-doctor-videocall-test.js --headless

# Ejecutar en pre-push
node scripts/git-flow-doctor-videocall-test.js --ci --notify
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["pnpm", "test:doctor-videocall:ci"]
```

## 📈 Métricas y Monitoreo

### Métricas Clave

- **Tiempo de Login**: < 5 segundos
- **Tiempo de Conexión WebRTC**: < 10 segundos
- **Tasa de Éxito**: > 95%
- **Tiempo Total del Test**: < 2 minutos

### Alertas

- Fallo en login > 10%
- Fallo en conexión WebRTC > 5%
- Tiempo de respuesta > 2 minutos

### Dashboard de Monitoreo

```bash
# Generar reporte de métricas
node scripts/generate-metrics-report.js

# Ver dashboard local
open playwright-report-doctor-videocall/index.html
```

## 🤝 Contribución

### Agregar Nuevos Tests

1. Crear archivo `.spec.ts` en `tests/e2e/`
2. Seguir el patrón de `DoctorVideoCallTest`
3. Agregar validaciones específicas
4. Actualizar documentación

### Modificar Configuración

1. Editar `playwright.doctor-videocall.config.ts`
2. Actualizar variables de entorno
3. Probar cambios localmente
4. Actualizar documentación

### Reportar Bugs

1. Revisar logs en `test-reports/doctor-videocall-test.log`
2. Verificar configuración de servicios
3. Consultar documentación de Playwright
4. Crear issue en el repositorio

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [WebRTC Testing Guide](https://playwright.dev/docs/test-webrtc)
- [AutaMedica Project Structure](../..)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Git Flow Assistant](https://github.com/autamedica/git-flow-assistant)

## 🆘 Soporte

Para problemas o preguntas:

1. **Revisar logs**: `test-reports/doctor-videocall-test.log`
2. **Verificar servicios**: Asegurar que todos los servicios estén corriendo
3. **Consultar documentación**: Playwright y WebRTC guides
4. **Crear issue**: En el repositorio de AutaMedica

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo AutaMedica

## 🎉 Resultado Esperado

Al ejecutar el test exitosamente, deberías ver:

```
✅ Login exitoso
✅ Perfil del doctor cargado
✅ Llamada iniciada y conectada
✅ Logs de señalización sin errores
✅ Desconexión segura

📊 REPORTE FINAL:
{
  "login": "success",
  "role": "doctor",
  "patient": "Juan Pérez",
  "call_status": "connected",
  "duration_sec": 120,
  "webrtc_connection": true,
  "video_working": true,
  "audio_working": true,
  "errors": [],
  "logs": [...]
}
```

¡El test está listo para ser ejecutado! 🚀