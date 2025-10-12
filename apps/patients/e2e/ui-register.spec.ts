import { test, expect } from '@playwright/test'

const unique = Date.now()
const NEW_USER = {
  email: `e2e.patient+reg${unique}@autamedica.test`,
  password: 'PatientReg2025!'
}

test.describe('UI Registro – paciente', () => {
  test('valida errores cliente y muestra éxito', async ({ page }) => {
    // Ir a registro con rol paciente
    await page.goto('http://localhost:3005/auth/register?role=patient')

    // Contraseñas no coinciden
    await page.fill('#email', NEW_USER.email)
    await page.fill('#password', 'short')
    await page.fill('#confirmPassword', 'different')
    // Mensajes cliente
    await expect(page.locator('text=Necesitas al menos 6 caracteres')).toBeVisible()
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible()

    // Corregir y enviar
    await page.fill('#password', NEW_USER.password)
    await page.fill('#confirmPassword', NEW_USER.password)
    await page.click('button[type="submit"]')

    // Debe mostrar mensaje de confirmación enviada
    const ok = page.locator('text=Te hemos enviado un enlace de confirmación')
    await expect(ok).toBeVisible({ timeout: 15000 })
  })
})

