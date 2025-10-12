import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js'

// Prueba rápida: validar que el endpoint protegido no devuelve 401 cuando el usuario está autenticado
// Nota: usa un appointment inexistente para forzar 404 (pero autenticado)

const TEST_USER = {
  email: 'e2e.patient+api@autamedica.test',
  password: 'PatientApiTest2025!',
}

test.describe('API /api/appointments/[id] protegido (autenticado)', () => {
  test.beforeAll(async () => {
    // Crea usuario de prueba con Service Role (RLS bypass) y perfil mínimo
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Intentar borrar si existe
    try {
      // Buscar por auth.users
      const { data: list } = await supabaseAdmin.auth.admin.listUsers()
      const candidate = list.users.find(u => u.email === TEST_USER.email)
      if (candidate) {
        await supabaseAdmin.auth.admin.deleteUser(candidate.id)
      }
    } catch (_) { void 0 }

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { role: 'patient' },
    })
    let userId = newUser?.user?.id
    if (error) {
      // Si ya existe, autenticamos con cliente público para obtener user.id
      if (/already been registered/i.test(error.message)) {
        const supabasePublic = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: signInData, error: signInErr } = await supabasePublic.auth.signInWithPassword({
          email: TEST_USER.email,
          password: TEST_USER.password,
        })
        if (signInErr || !signInData.user) {
          throw new Error(`Usuario ya existe pero no se pudo autenticar: ${signInErr?.message}`)
        }
        userId = signInData.user.id
      } else {
        throw new Error(`No se pudo crear usuario de prueba: ${error.message}`)
      }
    }

    // Crear registro de paciente mínimo vinculado
    try {
      await supabaseAdmin.from('patients').insert({ user_id: userId! }).single()
    } catch (_) { void 0 }
  })

  test('devuelve 404 (no 401) al estar autenticado', async ({ page, request, baseURL }) => {
    // 1) Autenticarse vía Supabase (cliente público) para obtener tokens
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: signInData, error: signInError } = await supabasePublic.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })
    if (signInError || !signInData.session) {
      throw new Error(`No se pudo iniciar sesión: ${signInError?.message}`)
    }

    const { access_token, refresh_token } = signInData.session

    // 2) Establecer cookies de sesión del lado servidor usando el callback
    await page.goto(`/auth/callback?access_token=${access_token}&refresh_token=${refresh_token}`)
    await page.waitForURL('/')

    // 3) Llamar API con sesión de navegador (cookies) y validar que no es 401
    const res = await page.request.get('/api/appointments/00000000-0000-0000-0000-000000000000')
    expect(res.status()).not.toBe(401)
  })
})
