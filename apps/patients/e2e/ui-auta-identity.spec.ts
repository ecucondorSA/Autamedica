import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const USER = {
  email: 'e2e.patient+ui@autamedica.test',
  password: 'PatientUiTest2025!',
}

test.describe('Auta Chat - identidad del paciente', () => {
  test.beforeAll(async () => {
    // Asegurar usuario de prueba y profile.full_name para respuesta determinística
    const admin = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Crear usuario si falta
    let userId: string | undefined
    const created = await admin.auth.admin.createUser({ email: USER.email, password: USER.password, email_confirm: true, user_metadata: { role: 'patient', portal: 'patients' } }).catch(() => null)
    userId = created?.data?.user?.id

    if (!userId) {
      const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: signed, error } = await pub.auth.signInWithPassword({ email: USER.email, password: USER.password })
      if (error || !signed.user) throw new Error(`No se pudo obtener userId: ${error?.message}`)
      userId = signed.user.id
    }

    // Upsert minimal rows
    try { await admin.from('profiles').upsert({ id: userId, email: USER.email, full_name: 'E2E Paciente' }) } catch {}
    try { await admin.from('patients').upsert({ user_id: userId }, { onConflict: 'user_id' }) } catch {}
  })

  test('responde con el nombre (o email) cuando se pregunta "mi nombre"', async ({ page }) => {
    // Login via Auth Hub
    await page.goto('http://localhost:3005/auth/login?role=patient&returnTo=http://localhost:3002/')
    await page.fill('#email', USER.email)
    await page.fill('#password', USER.password)
    await page.click('button[type="submit"]')

    // Esperar pacientes
    await page.waitForURL(/http:\/\/localhost:3002.*/, { timeout: 30000 })

    // Abrir Auta
    await page.getByRole('button', { name: 'Abrir asistente Auta' }).click()

    // Escribir "mi nombre"
    const input = page.getByPlaceholder('Pregúntale a Auta sobre tu salud...')
    await input.fill('mi nombre')
    await input.press('Enter')

    // Esperar respuesta con nombre o email
    const expects = [
      page.locator('text=Te llamás'),
      page.locator(`text=${USER.email}`),
    ]

    const anyVisible = await Promise.race(expects.map(loc => loc.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false)))
    expect(anyVisible).toBeTruthy()
  })
})

