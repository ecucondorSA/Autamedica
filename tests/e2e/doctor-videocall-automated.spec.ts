import { test, expect } from '@playwright/test'

/**
 * Test automatizado completo: Doctor inicia videollamada
 *
 * Flujo:
 * 1. Login como doctor
 * 2. Verificar dashboard carga correctamente
 * 3. Click en botón "Llamar a Paciente"
 * 4. Verificar navegación a sala de llamada
 * 5. Verificar stream de video se inicia
 */

test.describe('Sistema de Videollamadas - Doctor', () => {
  test.beforeEach(async ({ context }) => {
    // Otorgar permisos de cámara y micrófono antes de cada test
    await context.grantPermissions(['camera', 'microphone'])
  })

  test('Doctor inicia videollamada exitosamente', async ({ page }) => {
    // 1. Navegar al login
    await page.goto('http://localhost:3005/auth/login?role=doctor&returnTo=http://localhost:3001/')

    // 2. Completar formulario de login
    await page.fill('input[type="email"]', 'doctor.test@autamedica.test')
    await page.fill('input[type="password"]', 'test1234')
    await page.click('button[type="submit"]:has-text("Iniciar sesión")')

    // 3. Esperar redirección al dashboard (con SessionSync ahora funciona)
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 })

    // 4. Verificar que el dashboard cargó correctamente
    await expect(page).toHaveTitle(/AutaMedica Doctor Portal/i)

    // 5. Esperar que el botón de videollamada esté visible
    const callButton = page.locator('button:has-text("Llamar a")')
    await expect(callButton).toBeVisible({ timeout: 5000 })

    // 6. Capturar screenshot del dashboard antes de la llamada
    await page.screenshot({ path: 'test-reports-complete/dashboard-before-call.png' })

    // 7. Hacer clic en el botón de videollamada
    await callButton.click()

    // 8. Esperar navegación a la sala de llamada
    await page.waitForURL(/\/call\/.*/, { timeout: 15000 })

    // 9. Verificar que la sala de llamada cargó
    const videoElement = page.locator('video')
    await expect(videoElement).toBeVisible({ timeout: 10000 })

    // 10. Capturar screenshot de la sala de llamada
    await page.screenshot({ path: 'test-reports-complete/call-room.png' })

    // 11. Verificar URL contiene parámetros esperados
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/call\//)
    expect(currentUrl).toMatch(/callId=/)

    console.log('✅ Videollamada iniciada exitosamente')
    console.log('📍 URL de la sala:', currentUrl)
  })

  test('Botón de cámara directa activa stream inmediatamente', async ({ page }) => {
    // 1. Navegar al login
    await page.goto('http://localhost:3005/auth/login?role=doctor&returnTo=http://localhost:3001/')

    // 2. Completar formulario de login
    await page.fill('input[type="email"]', 'doctor.test@autamedica.test')
    await page.fill('input[type="password"]', 'test1234')
    await page.click('button[type="submit"]:has-text("Iniciar sesión")')

    // 3. Esperar redirección al dashboard
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 })

    // 4. Buscar botón de activación directa de cámara
    const directCameraButton = page.locator('button:has-text("activar cámara directamente")')
    await expect(directCameraButton).toBeVisible({ timeout: 5000 })

    // 5. Click en botón de cámara directa
    await directCameraButton.click()

    // 6. Esperar que aparezca el video en el dashboard (sin navegación)
    const videoElement = page.locator('video')
    await expect(videoElement).toBeVisible({ timeout: 5000 })

    // 7. Verificar que NO navegamos (permanecemos en dashboard)
    expect(page.url()).toBe('http://localhost:3001/')

    console.log('✅ Cámara directa activada exitosamente')
  })

  test('Verificar selectores CSS para botones', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3005/auth/login?role=doctor&returnTo=http://localhost:3001/')
    await page.fill('input[type="email"]', 'doctor.test@autamedica.test')
    await page.fill('input[type="password"]', 'test1234')
    await page.click('button[type="submit"]:has-text("Iniciar sesión")')
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 })

    // 2. Verificar múltiples selectores para StartCallButton
    const selectors = [
      'button:has-text("Llamar a")',
      'button.bg-green-600',
      'button:has(svg[stroke-linecap="round"])',
    ]

    for (const selector of selectors) {
      const element = page.locator(selector).first()
      const isVisible = await element.isVisible().catch(() => false)
      console.log(`Selector "${selector}": ${isVisible ? '✅ Encontrado' : '❌ No encontrado'}`)
    }
  })
})
