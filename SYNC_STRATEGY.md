# 🔄 Estrategia de Sincronización Dual - AutaMedica

**Fecha**: 2025-10-07
**Problema**: Base de datos en `/home/edu/Autamedica`, proyecto principal en `/root/Autamedica`
**Solución**: Sistema de sincronización bidireccional con script automatizado

---

## 📊 **Situación Resuelta**

### ✅ **Estado Actual**

| Ubicación | Propósito | Estado |
|-----------|-----------|--------|
| `/home/edu/Autamedica` | **Desarrollo principal** con Supabase CLI | ✅ 24 migraciones sincronizadas |
| `/root/Autamedica` | Proyecto alternativo | ✅ 23 migraciones + backup |
| **Base de Datos** | Supabase Production | ✅ 51 tablas operativas |

### 🎯 **Ventajas de Esta Estrategia**

1. **Flexibilidad**: Puedes trabajar desde cualquier ubicación
2. **Seguridad**: Usuario `edu` evita problemas de permisos de root
3. **Supabase CLI**: Funciona sin limitaciones en `/home/edu/`
4. **Sincronización**: Script automatizado mantiene ambos proyectos actualizados

---

## 🛠️ **Comandos de Sincronización**

### **Script Principal**: `/root/sync-autamedica.sh`

```bash
# Ver diferencias entre ambos proyectos
/root/sync-autamedica.sh check

# Sincronizar cambios de edu → root
/root/sync-autamedica.sh to-root

# Sincronizar cambios de root → edu
/root/sync-autamedica.sh to-edu
```

### **Aliases Recomendados** (añadir a `.bashrc` o `.zshrc`)

```bash
# En /root/.bashrc
alias sync-check='/root/sync-autamedica.sh check'
alias sync-to-root='/root/sync-autamedica.sh to-root'
alias sync-to-edu='/root/sync-autamedica.sh to-edu'

# Acceso rápido a directorios
alias cd-root-aut='cd /root/Autamedica'
alias cd-edu-aut='cd /home/edu/Autamedica'
```

---

## 📋 **Workflow Recomendado**

### **Escenario 1: Desarrollo Normal** (Recomendado)

```bash
# 1. Trabajar en /home/edu/Autamedica (sin limitaciones de Supabase)
cd /home/edu/Autamedica

# 2. Hacer cambios, commits, migraciones, etc.
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Sincronizar a root si es necesario
/root/sync-autamedica.sh to-root
```

### **Escenario 2: Trabajo Ocasional desde Root**

```bash
# 1. Trabajar en /root/Autamedica
cd /root/Autamedica

# 2. Hacer cambios
# ... ediciones ...

# 3. Sincronizar a edu (ubicación principal)
/root/sync-autamedica.sh to-edu

# 4. Desde edu, hacer commit y push
cd /home/edu/Autamedica
git add .
git commit -m "feat: cambios desde root"
git push
```

### **Escenario 3: Migraciones de Supabase**

```bash
# SIEMPRE crear migraciones desde /home/edu/Autamedica
cd /home/edu/Autamedica

# Crear nueva migración
supabase migration new nombre_migracion

# Editar migración
vim supabase/migrations/XXXXXX_nombre_migracion.sql

# Aplicar migración
supabase db push

# Sincronizar a root
/root/sync-autamedica.sh to-root
```

---

## 🚨 **Reglas Importantes**

### ✅ **HACER**

- ✅ Usar `/home/edu/Autamedica` como ubicación principal
- ✅ Ejecutar `supabase` CLI desde `/home/edu/Autamedica`
- ✅ Hacer commits Git desde `/home/edu/Autamedica`
- ✅ Ejecutar `sync-check` antes de sincronizar
- ✅ Sincronizar regularmente para mantener consistencia

### ❌ **NO HACER**

- ❌ Ejecutar `supabase` CLI desde `/root` (limitaciones de permisos)
- ❌ Hacer cambios simultáneos en ambas ubicaciones sin sincronizar
- ❌ Commitear desde root sin sincronizar primero a edu
- ❌ Olvidar sincronizar antes de hacer push a Git

---

## 📁 **Qué se Sincroniza**

### ✅ **Incluido en Sincronización**

```
✅ supabase/migrations/     - Todas las migraciones SQL
✅ apps/                    - Todas las aplicaciones
✅ packages/                - Todos los packages compartidos
✅ Archivos de configuración (.env.example, configs, etc.)
```

### ❌ **Excluido de Sincronización**

```
❌ node_modules/           - Dependencias (reinstalar con pnpm install)
❌ .next/                  - Build artifacts (regenerar con pnpm build)
❌ dist/                   - Build outputs (regenerar con pnpm build)
❌ _archive/               - Archivos archivados
❌ .env.local              - Configuraciones locales específicas
```

---

## 🔍 **Verificación Post-Sincronización**

Después de sincronizar, verificar que todo funcione:

```bash
# En la ubicación sincronizada
cd /home/edu/Autamedica  # o /root/Autamedica

# 1. Reinstalar dependencias si es necesario
pnpm install

# 2. Verificar builds
pnpm build

# 3. Verificar TypeScript
pnpm type-check

# 4. Verificar Supabase (solo desde edu)
cd /home/edu/Autamedica
supabase status
supabase migration list
```

---

## 📊 **Estado de Migraciones**

### **Base de Datos (Producción)**
```
✅ 51 tablas activas
✅ 21 funciones RPC
✅ HIPAA compliance implementado
✅ Audit trail completo
```

### **Archivos de Migración Sincronizados**

Ambas ubicaciones tienen ahora **las mismas migraciones críticas**:

```
✅ 20250920000001_create_medical_tables.sql
✅ 20250922000002_fix_rls_policies.sql
✅ 20250928_create_calls_system.sql
✅ 20250929090001_create_profiles_table.sql
✅ 20250929090010_introduce_role_system.sql
✅ 20250929090020_unified_identity_system.sql
✅ 20250929090030_unify_company_roles.sql
✅ 20250929_user_numeric_id.sql
✅ 20250930000001_medical_advanced_rls.sql
✅ 20250930_auth_lifecycle_hooks.sql
✅ 20250930_simplified_role_system.sql
✅ 20251002_buenos_aires_health_centers_seed.sql
✅ 20251002_preventive_care_schema.sql
✅ 20251002_reproductive_health_schema.sql
✅ 20251003_telemedicine_tables.sql
✅ 20251004_medical_record_authorizations.sql
✅ 20251004_medical_records_hipaa_compliance.sql
✅ 20251005_livekit_consultation_rooms.sql
✅ 20251006_patient_activity_tracking.sql
✅ 20251006_patient_care_team.sql
✅ 20251006_patient_care_team_and_audit.sql
✅ 20251007_patient_screenings.sql
✅ 20251007_patient_weekly_goals.sql
```

---

## 🚀 **Quick Start Guide**

### Para comenzar a trabajar HOY:

```bash
# 1. Ir a ubicación principal (edu)
cd /home/edu/Autamedica

# 2. Verificar sincronización
/root/sync-autamedica.sh check

# 3. Instalar dependencias si es necesario
pnpm install

# 4. Iniciar desarrollo
pnpm dev

# 5. Verificar Supabase
supabase status
```

---

## 🔐 **Credenciales Supabase**

Las credenciales están disponibles en el password store:

```bash
pass show supabase/url                # URL del proyecto
pass show supabase/db-password        # Password DB
pass show supabase/anon-key          # Anon key
pass show supabase/service-role-key  # Service role key
```

---

## 📞 **Soporte**

Si tienes problemas con la sincronización:

1. **Verificar diferencias**: `/root/sync-autamedica.sh check`
2. **Revisar logs**: El script muestra output detallado
3. **Backup manual**: Siempre puedes copiar manualmente si algo falla
4. **Git como respaldo**: Ambos proyectos tienen git, usa commits frecuentes

---

## ✨ **Mejoras Futuras**

Posibles mejoras al sistema de sincronización:

- [ ] Watcher automático con `inotify`
- [ ] Git hooks para sincronización pre-commit
- [ ] Validación de integridad post-sync
- [ ] Dashboard web para monitorear sincronización
- [ ] Alertas de drift entre ubicaciones

---

**Última actualización**: 2025-10-07
**Autor**: Claude Code + Usuario
**Estado**: ✅ Implementado y funcionando
