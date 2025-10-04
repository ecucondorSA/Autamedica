# 🤖 GitOps Automation - AltaMedica

Sistema completo de automatización GitOps para desarrollo continuo sin intervención manual.

## 📋 Índice

- [Visión General](#visión-general)
- [Componentes del Sistema](#componentes-del-sistema)
- [Workflows de GitHub Actions](#workflows-de-github-actions)
- [Git Watcher Local](#git-watcher-local)
- [Configuración](#configuración)
- [Uso](#uso)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visión General

Este sistema automatiza completamente el flujo de desarrollo:

1. **Auto-Commit Local**: Detecta cambios cada 5 minutos y commitea automáticamente
2. **Auto-Commit Remoto**: GitHub Actions commitea cada 30 minutos desde CI/CD
3. **Auto-PR Creation**: Crea PRs automáticamente para branches `feat/*`, `fix/*`, etc.
4. **Auto-Merge**: Mergea PRs aprobados con CI verde automáticamente
5. **Auto-Release**: Genera releases con changelog categorizado
6. **Auto-Issues**: Detecta errores en logs y crea issues automáticamente
7. **Monitoreo GitOps**: Workflow maestro que orquesta todo

### ✨ Beneficios

- ✅ **Zero Manual Work**: Todo se automatiza
- ✅ **Continuous Integration**: Código siempre sincronizado
- ✅ **Fast Iteration**: Ciclos de desarrollo acelerados
- ✅ **Quality Gates**: Solo se mergea código aprobado
- ✅ **Automatic Documentation**: Release notes generados
- ✅ **Error Detection**: Issues creados automáticamente

---

## 🧩 Componentes del Sistema

### 1. **Git Watcher Local** 🔍

Script en background que monitorea cambios localmente.

**Ubicación:** `scripts/git-watcher.sh`

**Características:**
- Intervalo: 5 minutos (configurable)
- Safety checks: No commitea en `main`/`master`
- Límite: Salta si >500 archivos modificados
- Logs: `git-watcher.log`

**Comandos:**
```bash
# Iniciar
./scripts/start-git-watcher.sh

# Detener
./scripts/stop-git-watcher.sh

# Ver estado
./scripts/status-git-watcher.sh

# Ver logs en vivo
tail -f git-watcher.log
```

### 2. **Auto-Commit Push** (GitHub Actions) ⬆️

Workflow que commitea cambios desde CI/CD.

**Trigger:**
- Cron: Cada 30 minutos
- Manual: `workflow_dispatch`

**Protecciones:**
- No commitea en branches protegidas (`main`/`master`)
- Skip con `[skip ci]` en mensaje

### 3. **Auto-PR Creation** 🔀

Crea PRs automáticamente para branches de feature.

**Trigger:**
- Push a `feat/**`, `fix/**`, `chore/**`, `docs/**`, `refactor/**`
- Manual: `workflow_dispatch`

**Características:**
- Genera título desde último commit
- Body con changelog y archivos modificados
- Labels automáticos según tipo de branch
- No duplica PRs existentes

### 4. **Auto-Merge** ✅

Mergea PRs que cumplen condiciones.

**Condiciones:**
- Label `auto-merge` presente
- Al menos 1 aprobación
- Todos los checks en verde
- Sin conflictos

**Trigger:**
- Eventos de PR (opened, labeled, reviewed)
- Check suite completado
- Manual: `workflow_dispatch` (batch mode)

### 5. **Auto-Release** 📦

Genera releases automáticos con changelog.

**Trigger:**
- Push a `main`/`master`
- Cron: Lunes 9am
- Manual: `workflow_dispatch`

**Versioning:**
- Semantic versioning automático
- Detecta tipo de bump desde conventional commits
- Changelog categorizado (Features, Fixes, Chores, etc.)

**Categorías:**
- `BREAKING CHANGE` → major bump
- `feat:` → minor bump
- `fix:`, `chore:`, `docs:` → patch bump

### 6. **GitOps Master** 🎯

Workflow maestro que orquesta todo.

**Trigger:**
- Cron: Cada 2 horas
- Manual: `workflow_dispatch`

**Acciones:**
- Auto-commit de cambios
- Análisis de logs
- Creación de issues para errores
- Detección de PRs estancados (>7 días)
- Estadísticas del repositorio

---

## 🚀 Workflows de GitHub Actions

### Ubicación

Todos los workflows están en `.github/workflows/`:

```
.github/workflows/
├── auto-commit-push.yml      # Auto-commit cada 30min
├── auto-pr-creation.yml       # Auto-PR para feat/fix branches
├── auto-merge.yml             # Auto-merge PRs aprobados
├── auto-release.yml           # Auto-release con changelog
└── gitops-master.yml          # Workflow maestro
```

### Permisos Requeridos

Todos los workflows necesitan estos permisos en GitHub:

```yaml
permissions:
  contents: write        # Para commits y tags
  pull-requests: write   # Para crear/editar PRs
  issues: write          # Para crear issues
  checks: read           # Para leer status de CI
```

### Variables de Entorno

No se requieren secrets adicionales. Usa `GITHUB_TOKEN` automático.

---

## 🔧 Git Watcher Local

### Instalación

El watcher ya está configurado. Solo necesitas iniciarlo:

```bash
cd /root/altamedica-reboot-fresh
./scripts/start-git-watcher.sh
```

### Configuración

Edita `scripts/git-watcher.sh` para cambiar parámetros:

```bash
INTERVAL=300          # 5 minutos (en segundos)
MAX_FILES=500        # Máximo de archivos para auto-commit
```

### Comportamiento

**Qué hace:**
- ✅ Auto-commitea cambios cada 5 minutos
- ✅ Genera commit message descriptivo
- ✅ Push automático a branch actual
- ✅ Logging completo

**Qué NO hace:**
- ❌ No commitea en `main`/`master`/`develop`
- ❌ No commitea si >500 archivos modificados
- ❌ No corre durante procesos manuales de git

### Logs

Todos los logs se guardan en `git-watcher.log`:

```bash
# Ver logs completos
cat git-watcher.log

# Ver en tiempo real
tail -f git-watcher.log

# Últimas 50 líneas
tail -50 git-watcher.log
```

### Detener el Watcher

```bash
./scripts/stop-git-watcher.sh
```

O manualmente:

```bash
pkill -f git-watcher.sh
```

---

## 📖 Uso

### Flujo Completo de Desarrollo Automatizado

1. **Desarrollo Local**
   ```bash
   # Iniciar watcher (una sola vez)
   ./scripts/start-git-watcher.sh

   # Trabajar normalmente
   # El watcher commitea automáticamente cada 5 min
   ```

2. **Crear Feature Branch**
   ```bash
   git checkout -b feat/nueva-funcionalidad

   # Desarrollar...
   # Auto-commits cada 5 min
   # Auto-push cada 5 min
   ```

3. **PR Automático**
   ```bash
   # Simplemente push a la branch
   git push origin feat/nueva-funcionalidad

   # GitHub Actions crea PR automáticamente
   ```

4. **Review & Merge**
   ```bash
   # Agregar label 'auto-merge' al PR
   gh pr edit <PR_NUMBER> --add-label "auto-merge"

   # Aprobar PR
   gh pr review <PR_NUMBER> --approve

   # Auto-merge cuando CI esté verde
   ```

5. **Release Automático**
   ```bash
   # Merge a main dispara auto-release
   # O esperar al cron de lunes 9am
   ```

### Comandos Útiles

```bash
# Ver estado del watcher
./scripts/status-git-watcher.sh

# Trigger manual de auto-commit (GitHub)
gh workflow run auto-commit-push.yml

# Trigger manual de auto-merge (batch)
gh workflow run auto-merge.yml

# Trigger manual de release
gh workflow run auto-release.yml

# Ver workflows corriendo
gh run list

# Ver logs de workflow
gh run view <RUN_ID> --log
```

---

## 🎛️ Configuración

### Habilitar/Deshabilitar Workflows

Edita cada workflow `.yml` para cambiar triggers:

```yaml
# Deshabilitar cron
on:
  # schedule:
  #   - cron: '*/30 * * * *'  # Comentar para deshabilitar
  workflow_dispatch:  # Mantener para trigger manual
```

### Cambiar Intervalos

**Git Watcher Local:**
```bash
# En scripts/git-watcher.sh
INTERVAL=600  # 10 minutos
```

**GitHub Actions:**
```yaml
# En cada workflow
schedule:
  - cron: '0 * * * *'  # Cada hora
```

### Configurar Auto-Merge

Los PRs necesitan label `auto-merge` para auto-mergearse:

```bash
# Agregar label a PR
gh pr edit <PR_NUMBER> --add-label "auto-merge"

# O crear PR con label
gh pr create --label "auto-merge"
```

### Configurar Branch Protections

Para que auto-merge funcione, configurar en GitHub:

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. ✅ Require pull request reviews (1 approval)
4. ✅ Require status checks to pass
5. ✅ Allow auto-merge

---

## 🐛 Troubleshooting

### Git Watcher no inicia

```bash
# Verificar si ya está corriendo
ps aux | grep git-watcher

# Ver logs de error
tail -50 git-watcher.log

# Limpiar PID file y reintentar
rm -f .git-watcher.pid
./scripts/start-git-watcher.sh
```

### Watcher no commitea

**Posibles causas:**
1. Branch protegida (`main`/`master`) → Cambiar a feature branch
2. Demasiados archivos (>500) → Commit manual primero
3. Proceso detenido → Verificar con `status-git-watcher.sh`

### GitHub Actions no corre

**Verificar:**
1. Permisos en Settings → Actions → General → Workflow permissions
2. Habilitar "Read and write permissions"
3. Habilitar "Allow GitHub Actions to create and approve pull requests"

### Auto-merge no funciona

**Verificar:**
1. PR tiene label `auto-merge`
2. PR tiene al menos 1 aprobación
3. Todos los checks están en verde
4. No hay conflictos de merge
5. Branch protections configuradas correctamente

### Workflow falla con permisos

```yaml
# Agregar a cada workflow
permissions:
  contents: write
  pull-requests: write
  issues: write
```

### Demasiados commits automáticos

**Ajustar intervalos:**

```bash
# Git Watcher: de 5 min a 15 min
INTERVAL=900  # en git-watcher.sh

# GitHub Actions: de 30 min a 2 horas
cron: '0 */2 * * *'  # en workflows
```

---

## 📊 Monitoreo

### Ver Estado Completo

```bash
# Git Watcher
./scripts/status-git-watcher.sh

# GitHub Workflows
gh run list --limit 20

# PRs automáticos
gh pr list --label "auto-generated"

# Issues automáticos
gh issue list --label "auto-generated"

# Releases
gh release list
```

### Logs Centralizados

**Git Watcher:**
```bash
tail -f git-watcher.log
```

**GitHub Actions:**
```bash
gh run list
gh run view <RUN_ID> --log
```

---

## 🎯 Best Practices

### 1. **Usar Conventional Commits**

Para que auto-release funcione correctamente:

```bash
feat: add new feature       # minor bump
fix: resolve bug            # patch bump
chore: update dependencies  # patch bump
BREAKING CHANGE: ...        # major bump
```

### 2. **Branch Naming**

Para que auto-PR funcione:

```bash
feat/nueva-funcionalidad    # Feature
fix/corregir-bug           # Bug fix
chore/actualizar-deps      # Maintenance
docs/documentar-api        # Documentation
refactor/limpiar-codigo    # Refactoring
```

### 3. **Labels para Control**

```bash
auto-merge     # Para auto-merge
auto-generated # PRs/Issues automáticos
stale          # PRs inactivos >7 días
```

### 4. **Skip Automation**

```bash
# Skip auto-commit en GitHub Actions
git commit -m "fix: bug [skip ci]"

# Skip auto-release
git commit -m "chore: update [skip release]"
```

---

## 🚀 Modo Productivo

Para máxima automatización:

```bash
# 1. Iniciar watcher local
./scripts/start-git-watcher.sh

# 2. Habilitar todos los workflows (ya están habilitados)

# 3. Configurar branch protections en GitHub

# 4. ¡Desarrollar sin preocuparte de git!
```

**El sistema se encarga de:**
- ✅ Commits automáticos
- ✅ PRs automáticos
- ✅ Merges automáticos (con aprobación)
- ✅ Releases automáticos
- ✅ Issues de errores automáticos
- ✅ Monitoreo de PRs estancados

---

## 📚 Referencias

- **Workflows:** `.github/workflows/`
- **Scripts:** `scripts/git-watcher.sh`, `scripts/{start,stop,status}-git-watcher.sh`
- **Logs:** `git-watcher.log`
- **GitHub CLI:** https://cli.github.com/manual/

---

🤖 **Sistema implementado y listo para usar**

Documentación generada automáticamente por Claude Code
