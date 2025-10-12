import { test, expect } from '@playwright/test'

test.describe('UI Login – errores', () => {
  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('http://localhost:3005/auth/login?role=patient')

    await page.fill('#email', 'usuario.inexistente+e2e@autamedica.test')
    await page.fill('#password', 'ClaveIncorrecta123!')
    await page.click('button[type="submit"]')

    // Debe mostrar el alert de error en el formulario de login
    const errorLocator = page.locator('text=Email o contraseña incorrectos')
    await expect(errorLocator).toBeVisible({ timeout: 10000 })
  })
})

