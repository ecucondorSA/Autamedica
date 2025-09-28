# 🚀 Git Workflow - Autamedica

## 📋 Quick Reference

### 🌿 **Flujo de Ramas**
```
feature/* ──→ develop ──→ staging ──→ main
     ↑                                  ↓
   fix/*                            hotfix/*
```

### 🎯 **Tipos de Commit (con emojis)**
| Emoji | Tipo | Descripción | Conventional |
|-------|------|-------------|--------------|
| ✨ | `nova feature` | Nueva funcionalidad completa | `feat:` |
| 🐛 | `fix problema` | Corrección de bug/error | `fix:` |
| ⚙️ | `ops tarea` | Infraestructura, CI/CD, deps | `chore:` |
| 📝 | `docs` | Documentación, README | `docs:` |
| 🧹 | `clean código` | Refactor, limpieza | `refactor:` |
| ⚡ | `mejorias` | Optimización performance | `perf:` |
| 🧪 | `tests` | Agregar/ajustar testing | `test:` |

### 🤖 **Herramientas Disponibles**

#### Option 1: Script Claude Opus 4.1
```bash
./git-claude          # Commit guiado con IA
```

#### Option 2: Asistente de Flujo Completo
```bash
./git-flow-assistant  # Commit + Push + PR workflow
```

#### Option 3: Prompt para CLI (Claude/ChatGPT5)
```
"Actúa como Asistente de Flujo Git – Autamedica.
Detectá mi rama actual, guiame en commit (tipos: ✨nova 🐛fix ⚙️ops 📝docs 🧹clean ⚡mejorias 🧪tests),
push y PR según flujo: feature→develop→staging→main.
Preguntá: ¿commitear lo staged ahora?"
```

---

## 📖 **Workflows Detallados**

### 🌟 **Desarrollo de Features**
```bash
# 1. Crear rama desde develop
git checkout develop
git pull
git checkout -b feature/calendar-system

# 2. Desarrollo
# ... hacer cambios ...
git add .
./git-claude                    # o ./git-flow-assistant

# 3. Push y PR automático
# El asistente sugiere:
git push -u origin feature/calendar-system
gh pr create --base develop --title "✨ Calendar system for patients"

# 4. Revisión IA (prompts incluidos en asistentes)
# Claude: "Revisá este diff con foco en seguridad, performance y legibilidad"
# ChatGPT5: "Validá build OK, naming consistente, sin secretos"
```

### 🐛 **Bugfixes**
```bash
# 1. Crear desde develop
git checkout develop
git pull
git checkout -b fix/auth-redirect-loop

# 2. Fix y commit
git add .
./git-claude
# Seleccionar: 🐛 fix problema

# 3. PR automático hacia develop
./git-flow-assistant  # Detecta rama fix/* → sugiere PR develop
```

### 🚀 **Releases (develop → staging → main)**
```bash
# 1. QA Release (develop → staging)
git checkout develop
./git-flow-assistant
# Opción: "¿Promover develop → staging (QA)?"

# 2. Production Release (staging → main)
git checkout staging
./git-flow-assistant
# Opción: "¿Promover staging → main (PRODUCCIÓN)?"
```

### 🆘 **Hotfixes Críticos**
```bash
# 1. Desde main (producción)
git checkout main
./git-flow-assistant
# Opción: "¿Crear hotfix/<slug> desde main?"

# 2. Desarrollo hotfix
git checkout -b hotfix/critical-security-patch
# ... fix urgente ...
git add .
./git-claude
# Tipo: 🐛 fix problema

# 3. PR directo a main
./git-flow-assistant  # Detecta hotfix/* → PR main

# 4. Back-merge automático (después del merge)
git checkout staging && git pull && git merge origin/main && git push
git checkout develop && git pull && git merge origin/main && git push
```

---

## 🔀 **Reglas por Rama**

| Rama | Commits Directos | PR Target | Deploy |
|------|------------------|-----------|---------|
| `feature/*` | ✅ Sí | `develop` | Preview efímero |
| `fix/*` | ✅ Sí | `develop` | Preview efímero |
| `develop` | ✅ Sí (integración) | `staging` | Preview DEV |
| `staging` | ⚠️ Solo via PR | `main` | Preview QA |
| `main` | ❌ Solo hotfix | - | **PRODUCCIÓN** |
| `hotfix/*` | ✅ Sí | `main` | Preview + backmerge |

---

## 🌐 **Deployment (Cloudflare Pages)**

```bash
# Configuración automática:
main branch     → PRODUCCIÓN (autamedica-*.pages.dev)
staging branch  → PREVIEW QA
develop branch  → PREVIEW DEV
PR branches     → PREVIEW efímero (auto-cleanup)

# Variables sincronizadas:
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_SIGNALING_URL
✅ NODE_VERSION=20
```

---

## 🧰 **Comandos de Emergencia**

### 🔄 **Sincronizar ramas después de hotfix**
```bash
# Después de merge hotfix → main
git checkout staging && git pull && git merge origin/main && git push
git checkout develop && git pull && git merge origin/main && git push
```

### 🧹 **Limpieza de ramas**
```bash
# Listar ramas mergeadas
git branch --merged develop

# Limpiar ramas locales
git branch -d feature/old-feature

# Limpiar ramas remotas
git push origin --delete feature/old-feature
```

### 📊 **Estado del proyecto**
```bash
# Ver diferencias entre ramas
git log --oneline main..staging     # Cambios staging pendientes
git log --oneline staging..develop  # Cambios develop pendientes

# Ver PRs activos
gh pr list

# Estado deployments
wrangler pages project list
```

---

## 🎯 **Integración con IAs**

### Claude Code Review
```
"Revisá este diff con foco en seguridad, performance y legibilidad.
Señalá riesgos críticos y sugiere fixes específicos para el contexto médico de Autamedica."
```

### ChatGPT5 PR Checklist
```
"Validá que este PR cumpla los estándares Autamedica:
- Build y tests passing
- Rutas críticas no afectadas
- Naming consistente con convenciones
- Sin secretos o credenciales expuestas
- Historias de usuario cubiertas
- Compatibilidad con HIPAA"
```

### Gemini Performance Review
```
"Analiza el impacto de performance de estos cambios en una aplicación médica.
Foco en: bundle size, rendering, API calls, memoria y experiencia del usuario."
```

---

## 📚 **Recursos**

- **Scripts**: `./git-claude`, `./git-flow-assistant`
- **GitHub CLI**: `gh pr create`, `gh pr view --web`
- **Cloudflare**: `wrangler pages project list`
- **Monorepo**: `pnpm build`, `pnpm dev --filter @autamedica/web-app`

---

**💡 Pro Tip**: Usa `./git-flow-assistant` para workflow completo o `./git-claude` para commits individuales con IA.