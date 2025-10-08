# 🔐 Guía: Obtener Credenciales de Cloudflare

## 📋 Necesitas 2 cosas:

1. **API Token** (con permisos de Pages)
2. **Account ID**

---

## 🎯 Paso 1: Obtener API Token

### **Opción A: Usar Token Existente de GitHub Secrets**

Si ya tienes un token configurado en GitHub Actions:

1. Ve a: https://github.com/ecucondorSA/Autamedica/settings/secrets/actions
2. Busca `CLOUDFLARE_API_TOKEN`
3. Si existe, cópialo (o crea uno nuevo igual)

### **Opción B: Crear Token Nuevo**

1. Ve a: https://dash.cloudflare.com/profile/api-tokens
2. Haz clic en **"Create Token"**
3. Selecciona la plantilla **"Edit Cloudflare Workers"** O crea uno custom con:
   - Account → Cloudflare Pages → Edit
   - Zone → Zone → Read
4. Haz clic en **"Continue to summary"** → **"Create Token"**
5. **¡COPIA EL TOKEN AHORA!** (Solo se muestra una vez)

---

## 🎯 Paso 2: Obtener Account ID

1. Ve a: https://dash.cloudflare.com
2. Selecciona tu cuenta (ecucondorSA o la que uses)
3. En la barra lateral derecha, verás **"Account ID"**
4. Haz clic en el icono de copiar

---

## ⚡ Paso 3: Ejecutar el Script

Una vez tengas ambas credenciales:

```bash
cd /home/edu/Autamedica
./update-cloudflare-vars.sh <TU_API_TOKEN> <TU_ACCOUNT_ID>
```

**Ejemplo:**
```bash
./update-cloudflare-vars.sh abcd1234efgh5678ijkl 9876543210abcdef
```

---

## 🔍 Ejemplo Visual

```
API Token:  abcd1234efgh5678ijkl9012mnop3456qrst7890
            ↑ Algo como esto (más largo)

Account ID: 1a2b3c4d5e6f7g8h9i0j
            ↑ 32 caracteres hexadecimales
```

---

## ✅ Verificación

El script actualizará automáticamente:

- ✅ autamedica-auth
- ✅ autamedica-web-app
- ✅ autamedica-doctors
- ✅ autamedica-patients
- ✅ autamedica-companies

Con las 3 variables en cada uno:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## ⚠️ Troubleshooting

**Error: "Project not found"**
- Verifica que el nombre del proyecto sea correcto
- Confirma que tienes acceso a esa cuenta

**Error: "Authentication failed"**
- Verifica que el token tenga permisos de Pages
- Regenera el token si es necesario

**Error: "Rate limit"**
- Espera 1 minuto y vuelve a intentar
