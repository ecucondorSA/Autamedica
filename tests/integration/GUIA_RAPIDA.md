# ⚡ Guía Rápida - Tests de Autenticación en GitHub

## 🎯 **3 Formas de Ejecutar Tests**

### 1️⃣ **Automático** (Sin hacer nada)

```
Crear PR → Tests se ejecutan automáticamente ✅
```

**Cuándo:** Siempre que hagas push o PR

---

### 2️⃣ **Desde Comentario** (Keyword en Issue/PR)

```markdown
/test-auth
```

**Resultado:** Tests rápidos (15 min) + Comentario con resultados

```markdown
/test-auth-extensive
```

**Resultado:** Tests extensivos (30 min) + Screenshots

---

### 3️⃣ **Manual** (GitHub UI)

```
GitHub → Actions → 🎮 Auth Tests - Manual → Run workflow
```

**Configurar:**
- Tipo: `quick` / `extensive` / `both`
- Apps: `web-app,patients,doctors`
- Headless: `true`

---

## 📸 **Ver Resultados**

### **Método 1: Desde PR**

```
PR → Checks → 🔐 Auth Tests → Details
```

### **Método 2: Desde Actions**

```
GitHub → Actions → [Workflow] → [Run] → Artifacts
```

### **Método 3: Desde Comentario**

El workflow comenta automáticamente:
```
✅ Tests completados
📸 Screenshots → artifacts
📊 Logs → [link]
```

---

## 🔐 **Setup Inicial (Una sola vez)**

### **Paso 1: Agregar Secrets**

```
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

**Agregar:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Paso 2: Push de Workflows**

```bash
git add .github/workflows tests/integration
git commit -m "Add: GitHub Actions workflows"
git push origin main
```

### **Paso 3: Verificar**

```
GitHub → Actions (deberías ver 3 workflows)
```

---

## 🚀 **Ejemplos de Uso**

### **Ejemplo 1: Validar PR**

```bash
# En tu PR, agregar comentario:
/test-auth-extensive

# Workflow ejecuta tests y comenta resultados
```

---

### **Ejemplo 2: Pre-Deploy**

```
1. GitHub → Actions → 🎮 Manual
2. Run workflow con:
   - test_type: extensive
   - apps_to_test: web-app,patients,doctors,companies,admin
3. Esperar resultados
4. Si OK → Deploy
```

---

### **Ejemplo 3: Reportar Bug**

```markdown
## Bug: Login no funciona

Descripción del bug...

/test-auth

Ejecutar tests para reproducir.
```

---

## 📊 **Keywords Disponibles**

| Keyword | Tests | Duración |
|---------|-------|----------|
| `/test-auth` | Rápidos (12) | ~15 min |
| `/run-auth-tests` | Rápidos (12) | ~15 min |
| `/test-auth-extensive` | Extensivos (3) | ~30 min |
| `/test-auth-full` | Extensivos (3) | ~30 min |

---

## 📚 **Documentación Completa**

- 📖 **[RESUMEN_GITHUB_ACTIONS.md](./RESUMEN_GITHUB_ACTIONS.md)** - Resumen ejecutivo
- 📖 **[GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md)** - Guía detallada
- 📖 **[EXTENSIVE_TESTS.md](./EXTENSIVE_TESTS.md)** - Tests extensivos

---

## ✅ **Checklist Rápido**

- [ ] Secrets configurados en GitHub
- [ ] Workflows pusheados a main
- [ ] Primer PR con tests creado
- [ ] Keyword probado en Issue
- [ ] Test manual ejecutado
- [ ] Screenshots descargados

---

**🎉 Todo listo para usar!**
