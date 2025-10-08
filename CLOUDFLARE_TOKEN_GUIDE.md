# 🔐 Guía: Obtener Token de Cloudflare y Actualizar Variables

## 📋 Paso 1: Obtener el Token

### Opción A: Manual (Recomendado - 2 minutos)

1. **Abre el link** en tu navegador:
   ```
   https://dash.cloudflare.com/profile/api-tokens
   ```

2. **Haz clic** en el botón azul **"Create Token"**

3. **Busca la plantilla** "Edit Cloudflare Workers"
   - O crea uno personalizado con permisos:
     - ✅ Account → Cloudflare Pages → Edit
     - ✅ (Opcional) Zone → Workers Routes → Edit

4. **Haz clic** en **"Use template"**

5. **Revisa los permisos** y haz clic en **"Continue to summary"**

6. **Haz clic** en **"Create Token"**

7. ⚠️  **COPIA EL TOKEN** (solo se muestra una vez!)

---

## 🚀 Paso 2: Usar el Token

Una vez que tengas el token copiado:

```bash
# 1. Navegar al proyecto
cd /home/edu/Autamedica

# 2. Exportar el token (reemplaza TU_TOKEN_AQUI con el token que copiaste)
export CLOUDFLARE_API_TOKEN="TU_TOKEN_AQUI"

# 3. Ejecutar el script de actualización
./update-cf-vars-simple.sh
```

### Ejemplo completo:

```bash
cd /home/edu/Autamedica

# Reemplaza esto con tu token real
export CLOUDFLARE_API_TOKEN="v1.0.aBc123...xyz789"

# Ejecutar
./update-cf-vars-simple.sh
```

---

## ✅ Qué hace el script

El script `update-cf-vars-simple.sh` actualizará estas variables en tus 5 proyectos de Cloudflare Pages:

- ✅ `autamedica-auth`
- ✅ `autamedica-web-app`
- ✅ `autamedica-doctors`
- ✅ `autamedica-patients`
- ✅ `autamedica-companies`

**Variables que se configurarán:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ewpsepaieakqbywxnidu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Xmou75UAl7DG0gfL5Omgew_m0fptr37
```

---

## 📊 Salida Esperada

Si todo va bien, verás:

```
╔══════════════════════════════════════════════════════════════╗
║  Actualización de Variables - Cloudflare Pages              ║
╚══════════════════════════════════════════════════════════════╝

✅ Token encontrado
📦 Actualizando 5 proyectos...

→ autamedica-auth
  ✅ Actualizado

→ autamedica-web-app
  ✅ Actualizado

→ autamedica-doctors
  ✅ Actualizado

→ autamedica-patients
  ✅ Actualizado

→ autamedica-companies
  ✅ Actualizado

╔══════════════════════════════════════════════════════════════╗
║  Resumen                                                     ║
╚══════════════════════════════════════════════════════════════╝
✅ Exitosos: 5/5
❌ Fallidos:  0/5

🎉 ¡Todos los proyectos actualizados!

📋 Siguiente paso: Triggear redeploys
   Para aplicar los cambios, ejecuta:
   ./trigger-redeploys.sh
```

---

## 🔧 Troubleshooting

### Error: "CLOUDFLARE_API_TOKEN no está configurado"

Significa que no exportaste el token. Asegúrate de hacer:

```bash
export CLOUDFLARE_API_TOKEN="tu_token_aqui"
```

### Error: "401 Unauthorized"

El token no tiene los permisos correctos. Crea uno nuevo con:
- Account → Cloudflare Pages → Edit

### Error: "404 Not Found" para algún proyecto

El proyecto no existe en Cloudflare. Verifica los nombres en:
https://dash.cloudflare.com/

---

## 📝 Notas Importantes

1. **El token solo se muestra UNA VEZ** - guárdalo en un lugar seguro
2. **El token NO expira** si lo configuras sin fecha de expiración
3. **Puedes revocar el token** en cualquier momento desde el dashboard
4. **El export es temporal** - solo dura en esa sesión de terminal

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Ver el script
cat /home/edu/Autamedica/update-cf-vars-simple.sh

# Ejecutar con debugging
bash -x /home/edu/Autamedica/update-cf-vars-simple.sh

# Ver proyectos en Cloudflare (requiere wrangler)
wrangler pages project list
```

---

**¿Necesitas ayuda?** Revisa que:
1. El token esté bien copiado (sin espacios extra)
2. El token tenga los permisos correctos
3. Los nombres de proyectos coincidan con los que tienes en Cloudflare
