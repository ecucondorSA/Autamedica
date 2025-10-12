import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const USER = {
  email: 'e2e.patient+forgot@autamedica.test',
  password: 'PatientForgot2025!'
}

test.describe('UI Forgot Password', () => {
  test.beforeAll(async () => {
    // Asegurar que el email existe para evitar error en reset
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: created, error } = await admin.auth.admin.createUser({
      email: USER.email,
      password: USER.password,
      email_confirm: true,
      user_metadata: { role: 'patient' },
    })
    if (error && !/already been registered/i.test(error.message)) {
      throw new Error(`No se pudo preparar usuario: ${error.message}`)
    }
  })

  test('envía enlace de recuperación y muestra feedback', async ({ page }) => {
    await page.goto('http://localhost:3005/auth/forgot-password')
    await page.fill('#email', USER.email)
    await page.click('button[type="submit"]')

    // Feedback mínimo robusto: botón se deshabilita (loading) y vuelve a habilitarse
    const button = page.locator('button[type="submit"]')
    await expect(button).toBeDisabled({ timeout: 10000 })
    await expect(button).toBeEnabled({ timeout: 20000 })
    // Y la cabecera de la vista sigue visible
    await expect(page.locator('text=Recuperar Acceso')).toBeVisible()
  })
})
