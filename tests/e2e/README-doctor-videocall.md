# 🧠 Doctor Login + Videollamada - Test Suite

Este directorio contiene la implementación completa del test de flujo médico de AutaMedica, incluyendo login de doctor, verificación de perfil, y videollamada WebRTC.

## 📋 Descripción

El test implementa el flujo médico completo especificado en el prompt:

1. **Login como Doctor** - Autenticación con credenciales específicas
2. **Validación de Perfil** - Verificación de rol y estado en línea
3. **Inicio de Videollamada** - Conexión con paciente asignado
4. **Verificación WebRTC** - Validación de conexión P2P
5. **Cierre Controlado** - Terminación segura de la llamada

## 🗂️ Estructura de Archivos

```
tests/e2e/
├── doctor-login-videocall-flow.spec.ts    # Test principal de Playwright
├── playwright.doctor-videocall.config.ts  # Configuración específica
├── global-setup.ts                        # Setup global
├── global-teardown.ts                     # Teardown global
└── README-doctor-videocall.md             # Este archivo
```

## 🚀 Uso Rápido

### Ejecutar Tests con Playwright

```bash
# Test básico
npx playwright test tests/e2e/doctor-login-videocall-flow.spec.ts

# Test con configuración específica
npx playwright test --config=tests/e2e/playwright.doctor-videocall.config.ts

# Test en modo headless
npx playwright test --headed=false

# Test con reporte detallado
npx playwright test --reporter=html,json
```

### Ejecutar con Script de Automatización

```bash
# Test básico
./scripts/doctor-videocall-test-automation.sh

# Test con opciones
./scripts/doctor-videocall-test-automation.sh --headless --report --notify

# Test en modo CI/CD
./scripts/doctor-videocall-test-automation.sh --ci --browser chromium
```

### Ejecutar con Git Flow Assistant

```bash
# Integración con git-flow-assistant
node scripts/git-flow-doctor-videocall-test.js

# Con opciones específicas
node scripts/git-flow-doctor-videocall-test.js --headless --report --notify --ci
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# URLs de los servicios
export BASE_URL="http://localhost:3000"
export AUTH_URL="http://localhost:3000/auth"
export DOCTORS_URL="http://localhost:3001"
export PATIENTS_URL="http://localhost:3003"
export SIGNALING_URL="ws://localhost:8888"

# Credenciales de prueba
export DOCTOR_EMAIL="doctor.demo@autamedica.com"
export DOCTOR_PASSWORD="Demo1234"
export PATIENT_ID="patient_001"
export PATIENT_NAME="Juan Pérez"
```

### Credenciales de Prueba

El test utiliza las credenciales específicas del prompt:

- **Email**: `doctor.demo@autamedica.com`
- **Contraseña**: `Demo1234`
- **Paciente**: `Juan Pérez` (ID: `patient_001`)

## 🧪 Casos de Test

### 1. Flujo Completo
- **Archivo**: `doctor-login-videocall-flow.spec.ts`
- **Descripción**: Ejecuta todo el flujo médico de principio a fin
- **Validaciones**:
  - ✅ Login exitoso con credenciales específicas
  - ✅ Redirección correcta al dashboard de doctores
  - ✅ Token JWT válido en localStorage
  - ✅ Verificación de rol "doctor"
  - ✅ Inicio de videollamada
  - ✅ Conexión WebRTC establecida
  - ✅ Elementos de video funcionando
  - ✅ Cierre controlado de la llamada

### 2. Validación de Autenticación
- **Descripción**: Test específico para validar credenciales
- **Validaciones**:
  - ✅ Formulario de login carga correctamente
  - ✅ Credenciales se llenan correctamente
  - ✅ Redirección después del login

### 3. Verificación de Token JWT
- **Descripción**: Valida la autenticación a nivel de token
- **Validaciones**:
  - ✅ Token JWT presente en localStorage
  - ✅ Token tiene formato válido
  - ✅ Token contiene información de sesión

### 4. Verificación WebRTC
- **Descripción**: Valida la funcionalidad de videollamada
- **Validaciones**:
  - ✅ Elementos de video presentes
  - ✅ Controles de video funcionando
  - ✅ Sin errores JavaScript críticos
  - ✅ Permisos de cámara/micrófono concedidos

### 5. Simulación Cross-App
- **Descripción**: Simula llamada entre doctor y paciente
- **Validaciones**:
  - ✅ Ambas apps cargan correctamente
  - ✅ Comunicación a través del signaling server
  - ✅ Conexión WebRTC entre apps

## 📊 Reportes

### Reporte HTML
- **Ubicación**: `playwright-report-doctor-videocall/`
- **Contenido**: Reporte visual con screenshots y videos
- **Generación**: Automática con `--reporter=html`

### Reporte JSON
- **Ubicación**: `test-results-doctor-videocall.json`
- **Contenido**: Datos estructurados para CI/CD
- **Formato**:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "test_suite": "doctor-login-videocall-flow",
  "results": {
    "login": "success",
    "role": "doctor",
    "patient": "Juan Pérez",
    "call_status": "connected",
    "duration_sec": 120,
    "webrtc_connection": true,
    "video_working": true,
    "audio_working": true,
    "errors": [],
    "logs": []
  }
}
```

### Reporte de Integración
- **Ubicación**: `test-reports/git-flow-integration-report.json`
- **Contenido**: Información específica para git-flow-assistant
- **Incluye**: Información del commit, branch, y resultados

## 🔧 Configuración Avanzada

### Navegadores Soportados

- **Chromium** (recomendado)
- **Firefox**
- **WebKit/Safari**
- **Mobile (iPhone 12)**

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

### Logs Detallados

```bash
# Habilitar logs de debug
DEBUG=pw:api npx playwright test

# Ver logs en tiempo real
tail -f test-reports/doctor-videocall-test.log
```

### Screenshots y Videos

- **Screenshots**: Se capturan automáticamente en fallos
- **Videos**: Se graban en modo `retain-on-failure`
- **Ubicación**: `test-results/`

### Errores Comunes

1. **"Botón de videollamada no encontrado"**
   - Verificar que la app de doctores esté corriendo
   - Verificar que el componente UnifiedVideoCall esté cargado

2. **"Conexión WebRTC no establecida"**
   - Verificar que el signaling server esté corriendo
   - Verificar permisos de cámara/micrófono

3. **"Token JWT no encontrado"**
   - Verificar que el login se completó correctamente
   - Verificar que Supabase esté configurado

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
      - run: ./scripts/doctor-videocall-test-automation.sh --ci --headless
```

### Git Flow Assistant

```bash
# Ejecutar en pre-commit
node scripts/git-flow-doctor-videocall-test.js --headless

# Ejecutar en pre-push
node scripts/git-flow-doctor-videocall-test.js --ci --notify
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

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [WebRTC Testing Guide](https://playwright.dev/docs/test-webrtc)
- [AutaMedica Project Structure](../..)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

## 🆘 Soporte

Para problemas o preguntas:

1. Revisar logs en `test-reports/doctor-videocall-test.log`
2. Verificar configuración de servicios
3. Consultar documentación de Playwright
4. Crear issue en el repositorio

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo AutaMedica