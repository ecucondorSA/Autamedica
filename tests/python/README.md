# 🧠 AutaMedica Playwright Python Tests

Este directorio contiene una suite completa de tests de Playwright en Python para AutaMedica, incluyendo tests E2E, regresión visual, accesibilidad, performance y mocking de red.

## 🚀 Instalación Rápida

```bash
# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Instalar navegadores de Playwright
python -m playwright install chromium
```

## 📁 Estructura del Proyecto

```
tests/python/
├── conftest.py                    # Fixtures de pytest para Playwright
├── utils.py                       # Utilidades y helpers
├── test_e2e_autamedica_auth.py   # Tests E2E de autenticación
├── test_visual_regression.py     # Tests de regresión visual
├── test_accessibility.py         # Tests de accesibilidad
├── test_performance.py           # Tests de performance
├── test_network_mocking.py       # Tests de mocking de red
├── run_tests.py                  # Script principal de ejecución
├── requirements.txt              # Dependencias de Python
├── ci/
│   └── Dockerfile.headless       # Docker para CI
├── .github/workflows/
│   └── playwright-ci.yml         # GitHub Actions
└── README.md                     # Este archivo
```

## 🧪 Tipos de Tests

### 1. Tests E2E (`test_e2e_autamedica_auth.py`)
- **Login de doctor** con credenciales específicas
- **Flujo de videollamada** completo
- **Comunicación cross-app** entre doctor y paciente
- **Configuración WebRTC** y permisos

### 2. Regresión Visual (`test_visual_regression.py`)
- **Página de login** en desktop y móvil
- **Dashboard de doctores**
- **Interfaz de videollamada**
- **App de pacientes**
- **Modo oscuro** (si está disponible)

### 3. Accesibilidad (`test_accessibility.py`)
- **Auditoría con axe-core**
- **Navegación por teclado**
- **Compatibilidad con lectores de pantalla**
- **Estructura semántica** y landmarks ARIA

### 4. Performance (`test_performance.py`)
- **Tiempos de carga** de páginas
- **Métricas de memoria** y CPU
- **Performance de red**
- **Optimización móvil**

### 5. Mocking de Red (`test_network_mocking.py`)
- **Simulación de APIs** de AutaMedica
- **Red lenta** y timeouts
- **Manejo de errores** de red
- **Rate limiting** y modo offline

## 🚀 Ejecución

### Script Principal
```bash
# Ejecutar todos los tests
python run_tests.py

# Ejecutar tests específicos
python run_tests.py --type auth
python run_tests.py --type visual
python run_tests.py --type accessibility
python run_tests.py --type performance
python run_tests.py --type network

# Modo visual (no headless)
python run_tests.py --no-headless

# Modo verbose
python run_tests.py --verbose

# Solo verificar servicios
python run_tests.py --check-services

# Solo instalar dependencias
python run_tests.py --install
```

### Pytest Directo
```bash
# Todos los tests
pytest -v

# Tests específicos
pytest test_e2e_autamedica_auth.py -v
pytest test_visual_regression.py -v
pytest test_accessibility.py -v
pytest test_performance.py -v
pytest test_network_mocking.py -v

# Con reportes
pytest -v --html=report.html --self-contained-html

# Modo headless
pytest -v --headless
```

## ⚙️ Configuración

### Variables de Entorno
```bash
# URLs de los servicios
export AUTAMEDICA_BASE_URL="http://localhost:3000"
export AUTAMEDICA_DOCTORS_URL="http://localhost:3001"
export AUTAMEDICA_PATIENTS_URL="http://localhost:3003"
export AUTAMEDICA_SIGNALING_URL="ws://localhost:8888"

# Credenciales de prueba
export AUTAMEDICA_DOCTOR_EMAIL="doctor.demo@autamedica.com"
export AUTAMEDICA_DOCTOR_PASSWORD="Demo1234"
```

### Configuración de Playwright
Los tests están configurados para:
- **Navegador**: Chromium
- **Viewport**: 1280x800 (desktop), 375x667 (móvil)
- **Permisos**: Cámara, micrófono, geolocalización
- **Timezone**: America/Guayaquil
- **Locale**: es-EC

## 📊 Reportes

### Reportes HTML
- **Ubicación**: `test-results/report.html`
- **Contenido**: Reporte visual con screenshots y videos
- **Acceso**: Abrir en navegador

### Reportes JUnit
- **Ubicación**: `test-results/junit.xml`
- **Contenido**: Datos estructurados para CI/CD
- **Formato**: XML estándar

### Artefactos de Test
- **Screenshots**: Capturados en fallos
- **Videos**: Grabados durante ejecución
- **Traces**: Para debugging avanzado
- **Métricas**: Performance y accesibilidad

## 🔧 CI/CD

### GitHub Actions
```yaml
# Ejecutar en push/PR
name: AutaMedica Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - run: pip install -r tests/python/requirements.txt
      - run: python -m playwright install chromium
      - run: python tests/python/run_tests.py
```

### Docker
```bash
# Construir imagen
docker build -f tests/python/ci/Dockerfile.headless -t autamedica-playwright .

# Ejecutar tests
docker run --rm autamedica-playwright
```

## 🐛 Debugging

### Modo Visual
```bash
# Ejecutar con navegador visible
python run_tests.py --no-headless

# O con pytest
pytest -v --headed
```

### Logs Detallados
```bash
# Modo verbose
python run_tests.py --verbose

# Con pytest
pytest -v -s
```

### Screenshots y Videos
- Se capturan automáticamente en fallos
- Ubicación: `test-artifacts/`
- Incluyen timestamps y nombres descriptivos

## 📈 Métricas y Monitoreo

### Performance
- **Tiempo de carga**: < 5s (desktop), < 8s (móvil)
- **DOM Content Loaded**: < 3s
- **Memoria**: < 80% del límite
- **Requests de red**: < 2s por request

### Accesibilidad
- **Violaciones críticas**: 0
- **Violaciones moderadas**: < 10
- **Navegación por teclado**: Funcional
- **Lectores de pantalla**: Compatible

### Regresión Visual
- **Threshold de diferencia**: 5-10 píxeles
- **Baselines**: Generadas automáticamente
- **Comparación**: Hash perceptual

## 🤝 Contribución

### Agregar Nuevos Tests
1. Crear archivo `test_nuevo_tipo.py`
2. Seguir patrón de fixtures existentes
3. Usar helpers de `utils.py`
4. Agregar documentación

### Modificar Configuración
1. Editar `conftest.py` para fixtures globales
2. Actualizar `utils.py` para helpers
3. Modificar `run_tests.py` para opciones
4. Actualizar documentación

### Reportar Bugs
1. Revisar logs en `test-results/`
2. Verificar screenshots en `test-artifacts/`
3. Consultar documentación de Playwright
4. Crear issue en el repositorio

## 📚 Referencias

- [Playwright Python](https://playwright.dev/python/)
- [Pytest](https://docs.pytest.org/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [AutaMedica Project](../..)

## 🆘 Soporte

Para problemas o preguntas:

1. **Revisar logs**: `test-results/` y `test-artifacts/`
2. **Verificar servicios**: Asegurar que todos los servicios estén corriendo
3. **Consultar documentación**: Playwright y pytest guides
4. **Crear issue**: En el repositorio de AutaMedica

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo AutaMedica