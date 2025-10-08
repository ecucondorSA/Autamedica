# 🚀 QUICK START - Playwright Debugger Enterprise

Guía rápida para empezar a usar el Playwright Debugger en 5 minutos.

## 📋 Prerrequisitos

- Python 3.11 o superior
- Ubuntu/Linux con visor de imágenes (eog, feh, gpicview)
- Apps de Autamedica corriendo localmente

## ⚡ Instalación Rápida

```bash
cd /home/edu/Autamedica/tools/playwright-debugger

# Ejecutar instalador automático
./install.sh

# Activar entorno virtual
source venv/bin/activate
```

## 🎯 Uso Básico

### 1. Debug de una App

```bash
# Debug de web-app (asume que está en http://localhost:3000)
python -m src.cli debug --app web-app

# Debug con análisis automático
python -m src.cli debug --app doctors --analyze

# Debug sin screenshots
python -m src.cli debug --app patients --no-screenshots
```

### 2. Monitoreo Persistente

```bash
# Monitorear web-app cada 30 segundos
python -m src.cli watch --apps web-app --interval 30

# Monitorear múltiples apps
python -m src.cli watch --apps web-app,doctors,patients --interval 60

# Monitorear con límite de runs
python -m src.cli watch --apps doctors --max-runs 10
```

### 3. Analizar Sesiones Anteriores

```bash
# Analizar última sesión
python -m src.cli analyze --latest

# Analizar sesión específica
python -m src.cli analyze abc123def

# Análisis profundo
python -m src.cli analyze --latest --depth deep
```

### 4. Generar Reportes

```bash
# Reporte de última sesión
python -m src.cli report --latest --format html --open

# Reporte JSON
python -m src.cli report --latest --format json
```

### 5. Gestión de Sesiones

```bash
# Listar sesiones disponibles
python -m src.cli sessions

# Ver configuración actual
python -m src.cli config

# Limpiar sesiones antiguas (>7 días)
python -m src.cli cleanup --days 7
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Debug Básico con Código Python

```bash
# Ejecutar ejemplo básico
python examples/basic_debug.py
```

Este ejemplo:
- Navega a web-app
- Toma screenshots automáticos
- Captura console logs, network requests, errores
- Analiza datos profundamente
- Muestra reporte completo

### Ejemplo 2: Monitoreo Continuo

```bash
# Ejecutar monitor persistente
python examples/persistent_monitor.py
```

Este ejemplo:
- Monitorea todas las apps simultáneamente
- Ejecuta cada 30 segundos
- Detecta issues automáticamente
- Corre indefinidamente hasta Ctrl+C

## 🔧 Configuración

Edita `.env` para personalizar:

```bash
# Screenshot viewer (eog, feh, gpicview)
SCREENSHOT_VIEWER=eog

# Auto-abrir screenshots
AUTO_OPEN_SCREENSHOTS=true

# Modo headless
HEADLESS=false

# Análisis automático
AUTO_ANALYZE=true
```

## 📊 Qué Captura el Debugger

✅ **Console Logs**: Todos los logs, warnings, errors
✅ **Network Requests**: URLs, status, timing, headers
✅ **JavaScript Errors**: Stack traces completos
✅ **Performance Metrics**: LCP, TTFB, load times
✅ **Screenshots**: Capturas automáticas en eventos clave
✅ **Análisis**: Patterns, security concerns, recommendations

## 🎨 Salida del Debugger

El debugger genera:

1. **Screenshots** → `screenshots/`
2. **Session Data** → `data/session_*.json`
3. **Analysis Reports** → `reports/analysis_*.json`
4. **Logs** → `logs/debugger_*.log`

## 🔍 Análisis Profundo

El analyzer detecta automáticamente:

- ❌ **Errores JavaScript**: Con stack traces
- 🌐 **CORS issues**: Configuración incorrecta
- 🔐 **Auth problems**: 401/403 errors
- ⚡ **Performance issues**: Requests lentos
- 🔒 **Security concerns**: Credentials en URLs, XSS

Y genera **auto-fix suggestions** con código listo para usar.

## 🚨 Troubleshooting

### Error: "No se encontró visor de imágenes"

```bash
# Instalar eog (Eye of GNOME)
sudo apt install eog

# O usar alternativa
sudo apt install feh
# Luego editar .env: SCREENSHOT_VIEWER=feh
```

### Error: "Failed to launch browser"

```bash
# Reinstalar navegadores Playwright
source venv/bin/activate
playwright install chromium
```

### Screenshots no se abren automáticamente

```bash
# Verificar en .env
AUTO_OPEN_SCREENSHOTS=true

# Verificar que el visor funcione
eog screenshots/web-app_*.png
```

## 💡 Tips Productivos

1. **Usa --headless para CI/CD**:
   ```bash
   python -m src.cli debug --app web-app --headless
   ```

2. **Analiza en profundidad solo cuando necesites**:
   ```bash
   python -m src.cli analyze --latest --depth quick
   ```

3. **Monitorea en background**:
   ```bash
   nohup python -m src.cli watch --apps web-app &
   ```

4. **Combina con tu workflow**:
   ```bash
   # En terminal 1: tus apps
   cd /home/edu/Autamedica && pnpm dev

   # En terminal 2: debugger
   cd tools/playwright-debugger && python -m src.cli watch --apps web-app
   ```

## 📚 Siguiente Nivel

Para uso avanzado, consulta:
- `README.md` - Documentación completa
- `examples/` - Más ejemplos de código
- Crear tus propios scripts usando las clases directamente

## 🆘 Ayuda

```bash
# Ver ayuda general
python -m src.cli --help

# Ayuda de un comando específico
python -m src.cli debug --help
python -m src.cli watch --help
python -m src.cli analyze --help
```

---

**¡Listo!** Ya puedes empezar a debugear tus apps de Autamedica con superpoderes. 🚀
