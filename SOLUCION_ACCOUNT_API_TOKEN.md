# ✅ SOLUCIÓN: Usar Account API Tokens (NO User API Tokens)

**Fecha**: 2025-09-30 23:35
**Fuente**: Documentación oficial de Cloudflare

---

## 🎯 Descubrimiento Importante

Según la documentación oficial de Cloudflare:

> **Account API Tokens** are ideal for:
> - **CI/CD**
> - Integrations with external services
> - Scenarios where the token needs to work long-term

**GitHub Actions es CI/CD** → Debes usar **Account API Tokens**

**Fuente**: https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/

---

## ❌ Error que Cometimos

Te pedí que fueras a "User API Tokens" (`/profile/api-tokens`), pero **eso estaba INCORRECTO**.

**Para GitHub Actions debes usar**: "Account API Tokens" (`/[account-id]/api-tokens`)

---

## ✅ Configuración Correcta para Account API Token

### Ubicación:
```
Dashboard → Manage Account → Account API Tokens → Create Token
```

O URL directa:
```
https://dash.cloudflare.com/[tu-account-id]/api-tokens
```

(Donde estabas originalmente era CORRECTO)

---

### Configuración del Token:

#### 1. Nombre del Token
```
GitHub Actions Pages Deploy
```

#### 2. Permisos

**Solo necesitas UNA fila de permisos**:

```
Cuenta → Cloudflare Pages → Editar
```

**NO necesitas agregar permisos de "Usuario"** en Account API Tokens.

#### 3. Recursos de cuenta

Aquí está la parte crítica. Debes configurar:

```
Account Resources:
  Specific account → Ecucondor@gmail.com's Account
```

O si aparece como "Recursos de zona":

```
Zone Resources:
  Include → Todas las zonas de una cuenta
  └─ Selecciona: Ecucondor@gmail.com's Account
```

#### 4. Filtro de direcciones IP del cliente

**CRÍTICO**: Debe estar **vacío** o configurado como:
```
Operador: No está en
Valor: 0.0.0.0

O mejor: Eliminar completamente esta fila
```

#### 5. TTL
```
Fecha de inicio: 30 de sep. de 2025
Fecha de caducidad: 31 de ene. de 2026 (o más)
```

---

## 📋 Checklist Pre-Creación

Antes de hacer click en "Ir al resumen", verifica:

- [ ] **Nombre**: "GitHub Actions Pages Deploy" ✅
- [ ] **Permisos**: Solo UNA fila → Cuenta → Cloudflare Pages → Editar ✅
- [ ] **Recursos**: Specific account → Tu cuenta seleccionada ✅
- [ ] **IP Filtering**: Vacío o "No está en 0.0.0.0" ✅
- [ ] **TTL**: Configurado correctamente ✅

---

## 🎬 Pasos Exactos

1. Estás en la página correcta: `Administrar cuenta > Tokens de API de cuenta`

2. Click "Create Token" → "Create Custom Token"

3. **Nombre**: `cd` (o el que prefieras)

4. **Permisos**:
   ```
   Fila 1: Cuenta → Cloudflare Pages → Editar
   ```
   **NO agregues segunda fila de Usuario** (no está disponible en Account API Tokens)

5. **Recursos de zona** o **Recursos de cuenta**:

   Si dice "Recursos de zona":
   ```
   Incluir → Todas las zonas de una cuenta
   └─ Dropdown: Selecciona tu cuenta
   ```

   Si dice "Account Resources":
   ```
   Include → Specific account
   └─ Dropdown: Selecciona tu cuenta
   ```

6. **Filtro de direcciones IP**:
   - Cambia "Está en" a **"No está en"**
   - Valor: `0.0.0.0`
   - O elimina completamente la fila haciendo click en la X

7. **TTL**: Déjalo como está (30 sep 2025 - 31 ene 2026)

8. Click "Ir al resumen"

9. **Verifica el resumen** antes de crear

10. Click "Crear token"

11. **Copia el token completo** inmediatamente

12. **Envíamelo** para verificar

---

## 🧪 Diferencia Clave

| Account API Token | User API Token |
|-------------------|----------------|
| ✅ Para CI/CD | ❌ Para tareas ad-hoc |
| ✅ Independiente del usuario | ❌ Ligado a un usuario |
| ✅ Permisos de Cuenta y Zona | ✅ Permisos de Usuario, Cuenta y Zona |
| ✅ **Lo que necesitas** | ❌ Lo que NO necesitas |

---

## ⚠️ Nota Importante

Los **Account API Tokens** NO tienen permisos de "Usuario" (User). Esto es **normal** y **correcto** para CI/CD.

Solo necesitas:
```
Cuenta → Cloudflare Pages → Editar
```

Eso es suficiente para `wrangler pages deploy`.

---

## 🎯 Siguiente Paso

Dado que ya estás en la página correcta (`Administrar cuenta > Tokens de API de cuenta`):

1. Sigue los pasos exactos arriba
2. **IMPORTANTE**: En "Filtro de direcciones IP", cámbialo a **"No está en"** con valor `0.0.0.0` (o elimina la fila)
3. Crea el token
4. Envíamelo para verificar

---

**Resumen**: Estabas en el lugar correcto desde el inicio. El problema era la configuración, no la ubicación.
