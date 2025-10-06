# 🤖 Claude Code Agents - Sistema de Sincronización Automática

## 📋 Resumen

Este sistema mantiene tus agentes de Claude Code sincronizados automáticamente con tu configuración en `~/.claude/agentic-config.json`.

---

## 🎯 Tres Métodos de Sincronización

### 1. **Manual** (Cuando quieras)
```bash
pnpm agents:register
```

**Cuándo usar:**
- Después de editar `~/.claude/agentic-config.json`
- Primera vez configurando agentes
- Para forzar re-sincronización

---

### 2. **Automático con Git Hooks** (Recomendado)

Los agentes se sincronizan automáticamente en estos eventos:

#### **Post-Merge Hook** (`.husky/post-merge`)
- Se ejecuta después de `git pull` o `git merge`
- Detecta cambios en `agentic-config.json`
- Re-registra agentes solo si hay cambios

```bash
# Ejemplo de uso:
git pull origin main
# 🤖 Syncing Claude Code agents...
# 📝 agentic-config.json changed, re-registering agents...
# ✅ Agents synchronized!
```

#### **Post-Checkout Hook** (`.husky/post-checkout`)
- Se ejecuta después de `git checkout <branch>`
- Detecta si la rama tiene config diferente
- Sincroniza agentes automáticamente

```bash
# Ejemplo de uso:
git checkout feature/new-agents
# 🤖 Checking Claude Code agents...
# 📝 Agent config changed, re-registering agents...
# ✅ Agents synchronized!
```

**Ventajas:**
- ✅ Cero fricción: funciona automáticamente
- ✅ Solo se ejecuta si hay cambios
- ✅ No interfiere con workflow normal

---

### 3. **Watch Mode** (Desarrollo activo)

Para desarrollo activo de agentes:

```bash
pnpm agents:watch
```

**Cómo funciona:**
- Monitorea `~/.claude/agentic-config.json` en tiempo real
- Auto-sincroniza cada vez que guardas cambios
- Debounce de 500ms para evitar sincronizaciones múltiples

**Cuándo usar:**
- Cuando estés ajustando configuración de agentes
- Durante desarrollo de nuevos agentes
- Para iteración rápida

**Ejemplo:**
```bash
Terminal 1:
$ pnpm agents:watch
👀 Watching for changes in: /root/.claude/agentic-config.json
🤖 Agents will auto-sync when config changes...
Press Ctrl+C to stop watching...

# Editas agentic-config.json...

📝 Config changed, re-registering agents...
✅ Agents synchronized!
👀 Watching for more changes...
```

---

## 📊 Flujo de Trabajo Completo

### Escenario 1: Primera Configuración
```bash
# 1. Edita tu configuración
nano ~/.claude/agentic-config.json

# 2. Registra agentes
pnpm agents:register

# 3. Verifica
pnpm agents:list

# ✅ Listo! Los hooks automáticos se encargarán del resto
```

### Escenario 2: Desarrollo de Nuevos Agentes
```bash
# Terminal 1: Watch mode
pnpm agents:watch

# Terminal 2: Editar configuración
nano ~/.claude/agentic-config.json
# Guardar cambios → agents se sincronizan automáticamente

# Terminal 3: Probar agentes
claude
> "test agent functionality"
```

### Escenario 3: Trabajo en Equipo
```bash
# Desarrollador A crea nuevo agente
git add ~/.claude/agentic-config.json
git commit -m "feat: add agent_performance"
git push

# Desarrollador B obtiene cambios
git pull
# 🤖 Syncing Claude Code agents...
# ✅ Agents synchronized!
# → Automáticamente tiene el nuevo agente
```

---

## 🔧 Configuración de Hooks

### Verificar Hooks Instalados
```bash
ls -lah .husky/
```

**Deberías ver:**
```
-rwxr-xr-x post-commit
-rwxr-xr-x post-merge      # ← Sincroniza después de pull/merge
-rwxr-xr-x post-checkout   # ← Sincroniza después de checkout
-rwxr-xr-x pre-commit
-rwxr-xr-x pre-push
```

### Deshabilitar Hooks Temporalmente
```bash
# Opción 1: Usar HUSKY=0
HUSKY=0 git pull

# Opción 2: Eliminar hook específico
chmod -x .husky/post-merge
```

### Re-habilitar Hooks
```bash
chmod +x .husky/post-merge .husky/post-checkout
```

---

## 📁 Archivos del Sistema

```
/root/Autamedica/
├── .husky/
│   ├── post-merge           # Git hook: después de pull/merge
│   └── post-checkout        # Git hook: después de checkout
├── scripts/
│   ├── register-claude-agents.mjs   # Script de registro
│   └── watch-agents-config.mjs      # Script de watch mode
├── package.json             # Comandos agents:*
└── docs/
    └── AGENTS_SYNC_GUIDE.md # Esta guía

~/.claude/
├── agentic-config.json      # Configuración fuente de verdad
└── agents/                  # Agentes registrados
    ├── agent_code.md
    ├── agent_db.md
    ├── agent_security.md
    ├── agent_dns_deploy.md
    ├── agent_qa.md
    └── agent_docs.md
```

---

## 🐛 Troubleshooting

### Agentes no se sincronizan después de pull
```bash
# Verificar que el hook existe y es ejecutable
ls -lah .husky/post-merge
chmod +x .husky/post-merge

# Sincronizar manualmente
pnpm agents:register
```

### Hook se ejecuta pero no sincroniza
```bash
# Verificar que el script existe
ls -lah scripts/register-claude-agents.mjs

# Ejecutar directamente para ver errores
node scripts/register-claude-agents.mjs
```

### Watch mode no detecta cambios
```bash
# Verificar que el archivo existe
ls -lah ~/.claude/agentic-config.json

# Probar con cambio manual
echo " " >> ~/.claude/agentic-config.json

# Si no funciona, usar manual sync
pnpm agents:register
```

---

## 💡 Mejores Prácticas

### ✅ DO (Recomendado)

1. **Usar Git hooks para sincronización automática**
   - Cero fricción en el workflow diario
   - Siempre sincronizado con el equipo

2. **Usar watch mode durante desarrollo activo**
   - Feedback inmediato
   - Iteración rápida

3. **Commitear agentic-config.json**
   - Compartir configuración con el equipo
   - Versionado de agentes

### ❌ DON'T (Evitar)

1. **No editar archivos en ~/.claude/agents/ directamente**
   - Usa agentic-config.json como fuente de verdad
   - Los archivos .md se sobrescriben en cada sync

2. **No usar watch mode en CI/CD**
   - Solo para desarrollo local
   - En CI/CD usar `pnpm agents:register` directamente

---

## 🚀 Comandos Quick Reference

| Comando | Descripción |
|---------|-------------|
| `pnpm agents:register` | Sincronizar agentes manualmente |
| `pnpm agents:list` | Listar agentes registrados |
| `pnpm agents:watch` | Watch mode para desarrollo |
| `git pull` | Auto-sincroniza si hay cambios (hook) |
| `git checkout <branch>` | Auto-sincroniza si hay cambios (hook) |

---

**Última actualización**: 2025-10-06
**Versión**: 1.0.0
