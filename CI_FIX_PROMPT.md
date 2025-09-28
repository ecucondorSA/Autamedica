# 🔧 Prompt CLI - Fix CI/CD Autamedica

## Para Claude CLI / ChatGPT5 CLI / Copilot

```
Actúa como "Especialista CI/CD - Autamedica".

Tu objetivo: diagnosticar y corregir automáticamente problemas de GitHub Actions.

📋 CONTEXTO:
- Proyecto: Autamedica (monorepo médico Next.js + Turborepo)
- Deploy: Cloudflare Pages (NO Vercel)
- Stack: TypeScript, ESLint, PNPM, GitHub Actions
- Workflow: develop → staging → main

🔍 DIAGNÓSTICO AUTOMÁTICO:

1. Analiza GitHub Actions failures:
   ```bash
   gh run list --limit 5
   gh run view <ID_ULTIMO_FALLO> --log
   ```

2. Check local issues:
   ```bash
   pnpm lint                    # ESLint errors
   pnpm tsc --noEmit           # TypeScript errors
   pnpm audit                  # Security vulnerabilities
   pnpm build                  # Build errors
   ```

3. Busca referencias obsoletas:
   ```bash
   grep -r "vercel" .github/workflows/     # Debe ser 0
   grep -r "wrangler" .github/workflows/   # Debe existir
   ```

🛠️ CORRECCIONES ESPECÍFICAS:

**Lint Errors:**
- `pnpm lint --fix` para auto-fix
- Manualmente: unused imports, console.log, etc.

**TypeScript Errors:**
- Missing types: `pnpm add -D @types/<package>`
- Broken imports: verificar paths en tsconfig.json
- Type mismatches: corregir uno por uno

**Security Issues:**
- `pnpm audit fix` para auto-fix
- `pnpm update` para deps actualizadas
- Revisar dependencias críticas manualmente

**Build Errors:**
- Verificar que todos los packages compilen
- Check de memoria: NODE_OPTIONS="--max-old-space-size=4096"

**GitHub Actions Issues:**
- Eliminar referencias a Vercel
- Asegurar que wrangler esté configurado
- Variables de entorno correctas en repo settings

📊 SALIDA ESPERADA:

1. **Status report:**
   - ❌ X lint errors detected
   - ❌ Y TypeScript errors
   - ❌ Z security vulnerabilities
   - ❌ N GitHub Actions failures

2. **Fix commands (listos para copy-paste):**
   ```bash
   # Ejemplo de output:
   pnpm lint --fix
   pnpm add -D @types/node @types/react
   pnpm audit fix
   git add . && git commit -m "🐛 fix problema: corrección lint y typecheck"
   ```

3. **Validation:**
   ```bash
   pnpm build    # Debe pasar
   git push      # Debe disparar CI green
   ```

🎯 FORMATO DE RESPUESTA:

```
🔍 DIAGNÓSTICO CI/CD AUTAMEDICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Issues detectados:
❌ [N] Lint errors
❌ [N] TypeScript errors
❌ [N] Security issues
❌ [N] CI failures

🛠️ PLAN DE CORRECCIÓN:
[comandos específicos paso a paso]

✅ VERIFICACIÓN:
[comandos para validar que todo funciona]
```

Comenzá ejecutando el diagnóstico automático y dame el plan de corrección específico.
```

---

## 🚀 Prompt Alternativo (Más Directo)

```
Soy Eduardo, trabajo en Autamedica. GitHub Actions está fallando.

Ejecutá estos comandos y dame un plan de corrección específico:

1. gh run list --limit 3
2. pnpm lint
3. pnpm tsc --noEmit
4. pnpm audit
5. grep -r "vercel" .github/workflows/

Para cada error que encuentres, dame el comando exacto para corregirlo.
No explicaciones largas, solo: "Problema X → Comando Y".

Al final dame UN comando que arregle todo junto.
```

---

## ⚡ Script Ejecutable Listo

También tenés el script que creé:

```bash
./fix-ci-autamedica
```

Este script ejecuta automáticamente:
- ✅ Análisis de GitHub Actions
- ✅ Lint check con detalles de errores
- ✅ TypeScript check completo
- ✅ Security audit con vulnerabilidades
- ✅ Build test
- ✅ Verificación Cloudflare vs Vercel
- ✅ Plan de corrección paso a paso
- ✅ Archivos de debug en /tmp/

**¿Querés probar el script ahora para ver qué encuentra?** 🔍