# ✅ Test Plan Pre-Producción – AutaMedica

**Objetivo:** Validar extremo a extremo (E2E) que AutaMedica está lista para producción sin degradar seguridad, performance ni confiabilidad.

**Ámbitos:** Frontend (patients/doctors/auth), Backend (Supabase/RPC/RLS), Infra (Cloudflare Pages/Workers), DNS/SSL, CI/CD, Seguridad.

---

## 0. Preparación (no destructivo)
- [ ] `node -v` y `pnpm -v` correctos
- [ ] Instalar dependencias (lockfile inmutable)
```bash
pnpm -w install --frozen-lockfile
```

---

## 1. Smoke Tests Web (apps)

- [ ] **Patients** carga `/` y `/auth/login`
- [ ] **Doctors** carga `/` y `/dashboard`
- [ ] **Auth** muestra formulario y redirige con rol

```bash
curl -I https://patients.autamedica.com/
curl -I https://doctors.autamedica.com/
curl -I "https://auth.autamedica.com/auth/login/?role=patient"
```

**Esperado:** `200/302`, sin bucles de redirect, `Content-Type` correcto.

---

## 2. Headers de Seguridad

- [ ] HSTS, CSP básica, X-Frame-Options, Referrer-Policy, Permissions-Policy

```bash
curl -sI https://patients.autamedica.com | tee generated-docs/headers-patients.txt
curl -sI https://doctors.autamedica.com | tee generated-docs/headers-doctors.txt
curl -sI https://auth.autamedica.com | tee generated-docs/headers-auth.txt
```

**Esperado:**
- `strict-transport-security: max-age>=15552000`
- `x-frame-options: DENY`
- `content-security-policy: ...` (sin `unsafe-inline` amplio)
- `permissions-policy` presente

---

## 3. DNS / SSL / CORS

- [ ] Certificados válidos y `SSL/TLS = FULL`
- [ ] CORS entre subdominios funcional

```bash
curl -Iv https://patients.autamedica.com | head -n 30
curl -s -D- -o /dev/null https://auth.autamedica.com
```

**Esperado:** handshake TLS correcto, sin `522`, CORS no bloquea flujos normales.

---

## 4. Build y Calidad del Código

- [ ] Lint + Typecheck + Tests + Build sin **warnings críticos**

```bash
pnpm -w turbo run lint typecheck --filter=...
pnpm -w turbo run test --filter=...
pnpm -w turbo run build --filter=apps/*
```

**Esperado:** procesos "green", sin `console.log`/`debugger` en bundles.

---

## 5. Base de Datos (Supabase) – Lectura/Seguridad

- [ ] Migraciones aplicadas
- [ ] RLS habilitado en tablas sensibles
- [ ] RPC críticas disponibles

```bash
supabase migration list
psql -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';"
psql -c "SELECT * FROM pg_policies WHERE schemaname='public' LIMIT 50;"
```

**Esperado:** `rowsecurity = true` en `profiles, companies, company_members, doctors, patients, appointments, medical_records, patient_care_team, roles, user_roles`.

---

## 6. Pruebas RLS (positivo/negativo)

> *Usar tokens de prueba; no tocar datos reales.*

- [ ] Usuario **paciente** puede leer **sus** datos y **no** otros
- [ ] Usuario **doctor** sólo accede a sus pacientes/turnos

*(Define dos tokens de testing y realiza fetch a endpoints protegidos.)*
**Esperado:** 200 en accesos propios, 403/401 en ajenos.

---

## 7. Flujos Críticos E2E

- [ ] **Login OAuth** paciente y doctor
- [ ] **Programar turno** (staging) y ver en dashboard doctor
- [ ] **Video/signal**: handshake de señalización (Workers) responde 200
- [ ] **Logs**: eventos relevantes quedan en `audit_logs`

*(Si no hay entorno staging aislado, simular con cuentas dummy y revocar.)*

---

## 8. Performance Quick-Checks

- [ ] TTFB p95 < 600 ms en páginas principales

```bash
node -e "const https=require('https');const u='https://patients.autamedica.com/';const s=Date.now();https.get(u,(r)=>{r.resume();r.on('end',()=>console.log('TTFB(ms):',Date.now()-s));});"
```

**Esperado:** valores en rango aceptable. Registrar en `generated-docs/perf-checks.txt`.

---

## 9. CI/CD Salud

- [ ] Workflows existen, gates activos, sin secretos en YAML

```bash
ls .github/workflows
grep -R "SECRET\|TOKEN\|KEY\|PASSWORD" -n .github/workflows || true
```

**Esperado:** secretos manejados vía GitHub Secrets, gates: lint/type/test/build.

---

## 10. Vulnerabilidades de Dependencias

- [ ] Sin críticas en producción

```bash
pnpm audit --prod --audit-level=moderate || true
```

**Esperado:** 0 críticas; documentar mitigaciones si aparecen.

---

## 11. Backups y Recuperación (DR)

- [ ] Backups automáticos habilitados
- [ ] Procedimiento de restauración **documentado** (no ejecutar en prod)
  *(Capturar evidencia de configuración en Supabase.)*

---

## 12. Resultado y Go/No-Go

- [ ] Generar **Resumen Ejecutivo** con estado por bloque y decisión:
  - **GO** si 0 críticos y ≤2 medios (con plan de mitigación).
  - **NO-GO** si ≥1 crítico o fallan RLS/DNS/SSL/Headers.

**Exportar informe:**
```bash
echo "- Fecha: $(date -Iseconds)
- Resultado: GO/NO-GO
- Observaciones: ..." > generated-docs/TEST_RESULT_SUMMARY.md
```
