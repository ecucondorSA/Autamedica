# 🔐 Cómo obtener tu SUPABASE_JWT_SECRET

## Pasos:

1. **Ir a Supabase Dashboard**
   - URL: https://app.supabase.com/project/gtyvdircfhmdjiaelqkg

2. **Navegar a Settings → API**
   - Click en "Settings" (engranaje) en sidebar
   - Click en "API" en el menú

3. **Encontrar JWT Settings**
   - Buscar sección "JWT Settings"
   - Copiar el valor de "JWT Secret" (es largo, ~32+ caracteres)
   - **IMPORTANTE**: Este es diferente al "anon key"

4. **Rotar anon key (RECOMENDADO)**
   - En la misma página, sección "Project API keys"
   - Click en "Roll" o "Regenerate" junto a "anon public"
   - Confirmar la rotación
   - Copiar la nueva clave

## Valores que necesitas:

```env
# Públicos (pueden estar en código)
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NUEVA ANON KEY DESPUÉS DE ROTAR]

# Secreto (NUNCA en código, solo en env vars del servidor)
SUPABASE_JWT_SECRET=[JWT SECRET DEL DASHBOARD]
```

## ⚠️ IMPORTANTE:
- El JWT Secret es DIFERENTE al anon key
- El JWT Secret NUNCA debe estar en el código
- Después de rotar, actualiza TODAS las apps