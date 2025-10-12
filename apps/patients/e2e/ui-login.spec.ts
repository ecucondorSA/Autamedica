import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const USER = {
  email: 'e2e.patient+ui@autamedica.test',
  password: 'PatientUiTest2025!',
}

test.describe('UI Login end-to-end via Auth app', () => {
  test.beforeAll(async () => {
    // Asegurar usuario de prueba con rol paciente
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Crear si no existe
    const { data: created, error } = await admin.auth.admin.createUser({
      email: USER.email,
      password: USER.password,
      email_confirm: true,
      user_metadata: { role: 'patient' },
    })

    let userId = created?.user?.id
    if (error) {
      // Si ya existe, iniciar sesión para obtener el id
      const pub = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: signed, error: signErr } = await pub.auth.signInWithPassword({
        email: USER.email,
        password: USER.password,
      })
      if (signErr || !signed.user) throw new Error(`No se pudo preparar usuario: ${signErr?.message}`)
      userId = signed.user.id
    }

    // Vincular paciente mínimo
    try {
      await admin.from('patients').insert({ user_id: userId! }).single()
    } catch (_) { void 0 }
  })

  test('login de paciente desde Auth → redirige a Patients', async ({ page }) => {
    // Ir a la pantalla de login de Auth (paciente)
    const authLogin = 'http://localhost:3005/auth/login?role=patient'
    await page.goto(authLogin)

    await page.fill('#email', USER.email)
    await page.fill('#password', USER.password)
    await page.click('button[type="submit"]')

    // Esperar redirección al portal de pacientes en :3002 con callback/session-sync
    await page.waitForURL(/http:\/\/localhost:3002.*/, { timeout: 30000, waitUntil: 'domcontentloaded' })

    // Validar que la sesión quedó activa llamando una API protegida
    const res = await page.request.get('http://localhost:3002/api/appointments/00000000-0000-0000-0000-000000000000')
    expect(res.status()).not.toBe(401)
  })
})
