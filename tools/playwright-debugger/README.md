# 🔍 Playwright Debugger Enterprise - Autamedica

Sistema enterprise de debugging persistente con Playwright para desarrollo continuo de aplicaciones Autamedica.

## 🎯 Características Principales

- **🖥️ Captura Completa**: Console logs, network requests, errores JavaScript
- **📸 Screenshots Automáticos**: Capturas que se abren automáticamente en visor Ubuntu
- **🔬 Análisis Profundo**: Análisis inteligente de datos capturados
- **🔧 Auto-Corrección**: Sugerencias automáticas de fixes
- **♻️ Ciclo Persistente**: Monitoreo continuo durante desarrollo
- **🔌 MCP Integration**: Comunicación con Claude Code via MCP

## 📦 Instalación

```bash
cd /home/edu/Autamedica/tools/playwright-debugger

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Instalar navegadores Playwright
playwright install chromium
```

## 🚀 Uso Rápido

### 1. Debugging Single Session

```bash
# Debug de una app específica
python -m src.cli debug --url http://localhost:3000 --app web-app

# Con screenshots automáticos
python -m src.cli debug --url http://localhost:3000 --screenshots

# Con análisis completo
python -m src.cli debug --url http://localhost:3000 --analyze
```

### 2. Monitoreo Persistente

```bash
# Monitoreo continuo de todas las apps
python -m src.cli watch --apps web-app,doctors,patients,companies

# Con auto-refresh cada 30 segundos
python -m src.cli watch --apps web-app --interval 30
```

### 3. Análisis de Datos

```bash
# Analizar session anterior
python -m src.cli analyze --session-id abc123

# Generar reporte HTML
python -m src.cli report --session-id abc123 --format html
```

## 🏗️ Arquitectura

```
playwright-debugger/
├── src/
│   ├── debugger/          # Core debugging engine
│   │   ├── session.py     # DebugSession manager
│   │   ├── capture.py     # Data capture (console, network, errors)
│   │   └── browser.py     # Browser controller
│   ├── screenshot/        # Screenshot management
│   │   ├── manager.py     # ScreenshotManager
│   │   └── viewer.py      # Auto-open with Ubuntu viewer
│   ├── analyzer/          # Data analysis
│   │   ├── engine.py      # Analysis engine
│   │   ├── patterns.py    # Pattern detection
│   │   └── suggestions.py # Auto-fix suggestions
│   ├── mcp/              # MCP integration
│   │   ├── server.py     # MCP server
│   │   └── client.py     # MCP client
│   ├── utils/            # Utilities
│   │   ├── logger.py     # Logging
│   │   └── config.py     # Configuration
│   └── cli.py            # CLI interface
├── tests/                # Tests
├── reports/              # Generated reports
├── screenshots/          # Captured screenshots
└── logs/                 # Debug logs
```

## 🔧 Configuración

Crear `.env` en el directorio raíz:

```env
# Apps Autamedica
WEB_APP_URL=http://localhost:3000
DOCTORS_URL=http://localhost:3001
PATIENTS_URL=http://localhost:3002
COMPANIES_URL=http://localhost:3003

# Screenshot Settings
SCREENSHOT_VIEWER=eog  # eog, feh, or gpicview
AUTO_OPEN_SCREENSHOTS=true

# Debug Settings
HEADLESS=false
SLOW_MO=100
TIMEOUT=30000

# MCP Settings
MCP_PORT=8765
MCP_ENABLED=true

# Analysis Settings
AUTO_ANALYZE=true
AUTO_FIX_SUGGESTIONS=true
```

## 📊 Datos Capturados

### Console Logs
- Todos los `console.log`, `console.error`, `console.warn`
- Timestamps precisos
- Stack traces completos

### Network Requests
- URL, method, status, timing
- Request/response headers
- Request/response bodies
- Failed requests destacados

### Errores JavaScript
- Mensajes de error completos
- Stack traces
- Línea y archivo específicos

### Screenshots
- Capturas automáticas en eventos clave
- Comparación visual entre sessions
- Anotaciones automáticas de errores

## 🎨 Reportes Generados

### HTML Report
Reporte visual interactivo con:
- Timeline de eventos
- Console logs con highlighting
- Network waterfall
- Screenshots con thumbnails
- Sugerencias de fixes

### JSON Report
Datos estructurados para análisis programático

### Markdown Report
Reporte legible para documentación

## 🔄 Ciclo de Desarrollo

```
1. Start Monitor → 2. Capture Data → 3. Analyze → 4. Suggest Fixes → 5. Loop
```

## 📝 Ejemplos

### Ejemplo 1: Debug App Web

```python
from src.debugger import DebugSession

async with DebugSession(url="http://localhost:3000") as session:
    await session.navigate()
    await session.interact("#login-button")

    # Datos capturados automáticamente
    console_logs = session.get_console_logs()
    network = session.get_network_activity()
    errors = session.get_errors()

    # Screenshot
    await session.screenshot("after-login.png", auto_open=True)
```

### Ejemplo 2: Monitoreo Persistente

```python
from src.debugger import PersistentMonitor

monitor = PersistentMonitor(
    apps=["web-app", "doctors"],
    interval=30,
    auto_analyze=True
)

await monitor.start()  # Corre indefinidamente
```

## 🛠️ Comandos Útiles

```bash
# Ver sessions activas
python -m src.cli sessions --list

# Ver últimos errores
python -m src.cli errors --last 10

# Limpiar datos antiguos
python -m src.cli cleanup --days 7

# Exportar datos
python -m src.cli export --session-id abc123 --format json
```

## 🔌 Integración MCP

El debugger expone servidor MCP para comunicación con Claude Code:

```python
# Servidor MCP corre automáticamente
# Claude Code puede:
# - Obtener datos de debugging en tiempo real
# - Solicitar análisis específicos
# - Recibir sugerencias de fixes
# - Controlar el monitor
```

## 📈 Métricas Monitoreadas

- **Performance**: LCP, FID, CLS, TTFB
- **Errores**: JS errors, network failures, console errors
- **Uso**: Memory, CPU, network usage
- **Usuario**: Interacciones, navegación, tiempos

## 🎯 Roadmap

- [ ] Integration con Supabase para logs persistentes
- [ ] AI-powered error analysis con Claude
- [ ] Visual regression testing
- [ ] Performance budgets y alertas
- [ ] Integration con GitHub Issues

---

**Desarrollado para Autamedica** - Sistema enterprise de debugging persistente
