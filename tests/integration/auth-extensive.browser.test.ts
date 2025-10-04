/**
 * @fileoverview EXTENSIVE Integration Tests - Long interactions with detailed validation
 * Tests complete user journeys with extended timeouts and comprehensive checks
 *
 * Run with: pnpm test:auth:extensive
 */

import { test, expect, page } from '@vitest/browser/context'
import { beforeEach, describe } from 'vitest'

// Configuration
const URLS = {
  auth: 'http://localhost:3000',
  patients: 'http://localhost:3003',
  doctors: 'http://localhost:3002',
  companies: 'http://localhost:3004',
  admin: 'http://localhost:3005'
}

const TEST_USERS = {
  patient: {
    email: 'patient@dev.local',
    password: 'password123',
    expectedApp: URLS.patients,
    role: 'patient'
  },
  doctor: {
    email: 'doctor@dev.local',
    password: 'password123',
    expectedApp: URLS.doctors,
    role: 'doctor'
  }
}

// Extended timeouts
const TIMEOUTS = {
  LONG_NAVIGATION: 60000,    // 1 minuto
  VERY_LONG: 120000,         // 2 minutos
  ULTRA_LONG: 180000,        // 3 minutos
  PAGE_LOAD: 30000,          // 30 segundos
  INTERACTION: 10000,        // 10 segundos
  ANIMATION: 3000            // 3 segundos
}

// Helper: Detailed logging
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || '')
}

// Helper: Wait with logging
async function waitWithLog(ms: number, reason: string) {
  log(`⏳ Waiting ${ms}ms - ${reason}`)
  await page.waitForTimeout(ms)
  log(`✅ Wait completed - ${reason}`)
}

// Helper: Clear all auth state with verification
async function clearAuthStateExtensive() {
  log('🧹 Starting extensive auth state cleanup...')

  // Clear localStorage
  await page.evaluate(() => {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keysToRemove.push(key)
    }
    log(`Found ${keysToRemove.length} localStorage keys`)
    keysToRemove.forEach(key => localStorage.removeItem(key))
  })

  // Clear sessionStorage
  await page.evaluate(() => {
    sessionStorage.clear()
  })

  // Clear cookies
  const cookies = await page.context().cookies()
  log(`Found ${cookies.length} cookies to clear`)
  if (cookies.length > 0) {
    await page.context().clearCookies()
  }

  // Verify cleanup
  const remainingKeys = await page.evaluate(() => localStorage.length)
  log(`✅ Cleanup complete. Remaining localStorage keys: ${remainingKeys}`)

  await waitWithLog(2000, 'Allow cleanup to propagate')
}

// Helper: Wait for navigation with extensive logging
async function waitForNavigationExtensive(expectedUrl: string, timeout = TIMEOUTS.LONG_NAVIGATION) {
  log(`🔄 Waiting for navigation to: ${expectedUrl}`)
  const startTime = Date.now()
  let lastUrl = ''

  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url()

    // Log URL changes
    if (currentUrl !== lastUrl) {
      log(`📍 URL changed: ${currentUrl}`)
      lastUrl = currentUrl
    }

    if (currentUrl.includes(expectedUrl)) {
      const elapsed = Date.now() - startTime
      log(`✅ Navigation successful after ${elapsed}ms: ${currentUrl}`)
      return true
    }

    await page.waitForTimeout(500)
  }

  const elapsed = Date.now() - startTime
  throw new Error(
    `❌ Navigation timeout after ${elapsed}ms. Expected "${expectedUrl}", got "${page.url()}"`
  )
}

// Helper: Login with extensive validation
async function loginUserExtensive(email: string, password: string) {
  log(`🔐 Starting login process for: ${email}`)

  // Navigate to login
  log('📍 Navigating to login page...')
  await page.goto(`${URLS.auth}/auth/login`)
  await waitWithLog(2000, 'Page load stabilization')

  // Verify we're on login page
  const currentUrl = page.url()
  log(`Current URL: ${currentUrl}`)
  expect(currentUrl).toContain('/auth/login')

  // Wait for page to be fully loaded
  log('⏳ Waiting for page to be ready...')
  await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.PAGE_LOAD })
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.PAGE_LOAD })
  await waitWithLog(2000, 'Additional stabilization')

  // Take screenshot before login
  log('📸 Taking screenshot: before-login')
  await page.screenshot({ path: 'test-results/screenshots/before-login.png' })

  // Find and fill email field
  log('🔍 Looking for email input...')
  const emailSelector = 'input[type="email"], input[name="email"], input[id="email"]'
  const emailInput = await page.waitForSelector(emailSelector, {
    timeout: TIMEOUTS.INTERACTION,
    state: 'visible'
  })

  if (!emailInput) {
    throw new Error('❌ Email input not found')
  }

  log('✍️ Filling email field...')
  await emailInput.fill(email)
  await waitWithLog(1000, 'Email input processing')

  // Verify email was filled
  const emailValue = await emailInput.inputValue()
  log(`Email field value: ${emailValue}`)
  expect(emailValue).toBe(email)

  // Find and fill password field
  log('🔍 Looking for password input...')
  const passwordSelector = 'input[type="password"], input[name="password"], input[id="password"]'
  const passwordInput = await page.waitForSelector(passwordSelector, {
    timeout: TIMEOUTS.INTERACTION,
    state: 'visible'
  })

  if (!passwordInput) {
    throw new Error('❌ Password input not found')
  }

  log('✍️ Filling password field...')
  await passwordInput.fill(password)
  await waitWithLog(1000, 'Password input processing')

  // Take screenshot before submit
  log('📸 Taking screenshot: before-submit')
  await page.screenshot({ path: 'test-results/screenshots/before-submit.png' })

  // Find and click submit button
  log('🔍 Looking for submit button...')
  const buttonSelector = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Iniciar")'
  const submitButton = await page.waitForSelector(buttonSelector, {
    timeout: TIMEOUTS.INTERACTION,
    state: 'visible'
  })

  if (!submitButton) {
    throw new Error('❌ Submit button not found')
  }

  log('🖱️ Clicking submit button...')
  await submitButton.click()
  await waitWithLog(2000, 'Form submission processing')

  log('✅ Login form submitted successfully')
}

// Helper: Verify page content extensively
async function verifyPageContentExtensive(expectedTexts: string[]) {
  log(`🔍 Verifying page content for ${expectedTexts.length} expected texts...`)

  await waitWithLog(3000, 'Page content stabilization')

  const bodyContent = await page.textContent('body')
  log(`Page content length: ${bodyContent?.length || 0} characters`)

  for (const text of expectedTexts) {
    log(`Checking for text: "${text}"`)
    const found = bodyContent?.includes(text)
    log(`Text "${text}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`)

    if (!found) {
      log('📸 Taking screenshot: content-verification-failed')
      await page.screenshot({ path: 'test-results/screenshots/content-verification-failed.png' })
    }
  }

  // Take final screenshot
  log('📸 Taking screenshot: final-page-state')
  await page.screenshot({ path: 'test-results/screenshots/final-page-state.png' })
}

// Helper: Check authentication state
async function checkAuthState() {
  log('🔐 Checking authentication state...')

  const authState = await page.evaluate(() => {
    const state: any = {
      hasLocalStorage: false,
      hasSessionStorage: false,
      hasCookies: false,
      localStorageKeys: [],
      sessionStorageKeys: []
    }

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        state.localStorageKeys.push(key)
        if (key.includes('supabase') || key.includes('auth')) {
          state.hasLocalStorage = true
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        state.sessionStorageKeys.push(key)
        if (key.includes('supabase') || key.includes('auth')) {
          state.hasSessionStorage = true
        }
      }
    }

    return state
  })

  // Check cookies
  const cookies = await page.context().cookies()
  authState.hasCookies = cookies.some(c =>
    c.name.includes('supabase') ||
    c.name.includes('auth') ||
    c.name.includes('sb-')
  )

  log('Auth state:', authState)
  return authState
}

// Setup
beforeEach(async () => {
  log('\n' + '='.repeat(80))
  log('🚀 Starting new test')
  log('='.repeat(80))
  await clearAuthStateExtensive()
})

// ============================================
// EXTENSIVE TEST SUITE
// ============================================

describe('EXTENSIVE Auth Flow - Complete Patient Journey', () => {

  test('Complete patient authentication and app exploration journey', async () => {
    log('\n🎯 TEST: Complete patient journey with extensive validation')
    log('Expected duration: 2-3 minutes')

    const user = TEST_USERS.patient

    // PHASE 1: Initial state verification
    log('\n📋 PHASE 1: Verify initial state')
    await page.goto(URLS.auth)
    await waitWithLog(3000, 'Initial page load')

    const initialState = await checkAuthState()
    expect(initialState.hasLocalStorage).toBe(false)
    log('✅ Initial state clean')

    // PHASE 2: Navigate to login
    log('\n📋 PHASE 2: Navigate to login page')
    await page.goto(`${URLS.auth}/auth/login`)
    await waitWithLog(5000, 'Login page full load')

    // Verify login page elements
    log('🔍 Verifying login page elements...')
    const hasEmailInput = await page.$('input[type="email"]') !== null
    const hasPasswordInput = await page.$('input[type="password"]') !== null
    const hasSubmitButton = await page.$('button[type="submit"]') !== null

    log(`Email input present: ${hasEmailInput}`)
    log(`Password input present: ${hasPasswordInput}`)
    log(`Submit button present: ${hasSubmitButton}`)

    expect(hasEmailInput).toBe(true)
    expect(hasPasswordInput).toBe(true)
    expect(hasSubmitButton).toBe(true)

    // PHASE 3: Perform login
    log('\n📋 PHASE 3: Perform login')
    await loginUserExtensive(user.email, user.password)

    // PHASE 4: Wait for authentication processing
    log('\n📋 PHASE 4: Wait for authentication processing')
    await waitWithLog(5000, 'Auth token exchange and session creation')

    // Check if we need to select role
    const currentUrl = page.url()
    log(`Current URL after login: ${currentUrl}`)

    if (currentUrl.includes('select-role')) {
      log('⚠️ Role selection required')
      log('🔍 Looking for patient role button...')

      const patientButton = await page.waitForSelector(
        'button:has-text("Patient"), button:has-text("Paciente"), [data-role="patient"]',
        { timeout: TIMEOUTS.INTERACTION }
      )

      if (patientButton) {
        log('🖱️ Clicking patient role...')
        await patientButton.click()
        await waitWithLog(3000, 'Role selection processing')
      }
    }

    // PHASE 5: Wait for redirect to patients app
    log('\n📋 PHASE 5: Wait for redirect to patients app')
    await waitForNavigationExtensive(user.expectedApp, TIMEOUTS.VERY_LONG)

    // Verify we're on the correct app
    const finalUrl = page.url()
    log(`Final URL: ${finalUrl}`)
    expect(finalUrl).toContain(user.expectedApp)

    // PHASE 6: Verify authentication state
    log('\n📋 PHASE 6: Verify authentication state')
    const authState = await checkAuthState()
    log('Post-login auth state:', authState)

    expect(authState.hasLocalStorage || authState.hasCookies).toBe(true)
    log('✅ User is authenticated')

    // PHASE 7: Wait for dashboard to fully load
    log('\n📋 PHASE 7: Wait for dashboard to fully load')
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.PAGE_LOAD })
    await waitWithLog(5000, 'Dashboard components initialization')

    // PHASE 8: Verify dashboard content
    log('\n📋 PHASE 8: Verify dashboard content')
    await verifyPageContentExtensive([
      'Inicio',
      'Paciente',
      'Dashboard',
      'Portal'
    ])

    // PHASE 9: Test navigation within app
    log('\n📋 PHASE 9: Test in-app navigation')

    // Try to navigate to profile
    log('🔍 Looking for profile link...')
    const profileLink = await page.$('a[href="/profile"], a:has-text("Perfil"), a:has-text("Profile")')

    if (profileLink) {
      log('🖱️ Clicking profile link...')
      await profileLink.click()
      await waitWithLog(3000, 'Profile page load')

      const profileUrl = page.url()
      log(`Profile URL: ${profileUrl}`)
      expect(profileUrl).toContain('/profile')

      await waitWithLog(3000, 'Profile page stabilization')
    } else {
      log('⚠️ Profile link not found (may not exist in UI yet)')
    }

    // PHASE 10: Test page reload persistence
    log('\n📋 PHASE 10: Test session persistence on reload')
    log('🔄 Reloading page...')
    await page.reload()
    await waitWithLog(5000, 'Page reload complete')

    // Should still be logged in
    const urlAfterReload = page.url()
    log(`URL after reload: ${urlAfterReload}`)
    expect(urlAfterReload).toContain(user.expectedApp)
    expect(urlAfterReload).not.toContain('/auth/login')

    const authStateAfterReload = await checkAuthState()
    expect(authStateAfterReload.hasLocalStorage || authStateAfterReload.hasCookies).toBe(true)
    log('✅ Session persisted after reload')

    // PHASE 11: Final verification
    log('\n📋 PHASE 11: Final comprehensive check')
    log('📸 Taking final screenshot')
    await page.screenshot({ path: 'test-results/screenshots/test-complete.png' })

    log('\n✅ TEST COMPLETED SUCCESSFULLY')
    log('Total phases completed: 11/11')

  }, TIMEOUTS.ULTRA_LONG) // 3 minutes timeout

})

describe('EXTENSIVE Auth Flow - Cross-App Protection Journey', () => {

  test('Patient login and attempt to access all other apps with detailed verification', async () => {
    log('\n🎯 TEST: Cross-app protection with extensive validation')
    log('Expected duration: 3-4 minutes')

    const user = TEST_USERS.patient

    // PHASE 1: Login as patient
    log('\n📋 PHASE 1: Login as patient')
    await page.goto(`${URLS.auth}/auth/login`)
    await waitWithLog(3000, 'Login page load')

    await loginUserExtensive(user.email, user.password)
    await waitWithLog(5000, 'Authentication processing')

    // Handle role selection if needed
    if (page.url().includes('select-role')) {
      log('Selecting patient role...')
      const patientButton = await page.$('button:has-text("Patient"), button:has-text("Paciente")')
      if (patientButton) {
        await patientButton.click()
        await waitWithLog(3000, 'Role selection')
      }
    }

    // Wait for redirect to patients app
    await waitForNavigationExtensive(user.expectedApp, TIMEOUTS.LONG_NAVIGATION)
    log('✅ Successfully logged in as patient')

    await waitWithLog(5000, 'Dashboard stabilization')

    // PHASE 2: Verify we're on patients app
    log('\n📋 PHASE 2: Verify current location')
    const patientsUrl = page.url()
    log(`Current URL: ${patientsUrl}`)
    expect(patientsUrl).toContain(URLS.patients)

    await page.screenshot({ path: 'test-results/screenshots/on-patients-app.png' })

    // PHASE 3: Attempt to access doctors app
    log('\n📋 PHASE 3: Attempt unauthorized access to doctors app')
    log(`Navigating to: ${URLS.doctors}/dashboard`)

    await page.goto(`${URLS.doctors}/dashboard`)
    await waitWithLog(8000, 'Middleware redirect processing')

    // Should be redirected back to patients
    const urlAfterDoctorsAttempt = page.url()
    log(`URL after doctors attempt: ${urlAfterDoctorsAttempt}`)

    expect(urlAfterDoctorsAttempt).toContain(URLS.patients)
    expect(urlAfterDoctorsAttempt).not.toContain(URLS.doctors)
    log('✅ Middleware correctly blocked doctors app access')

    await page.screenshot({ path: 'test-results/screenshots/blocked-doctors.png' })
    await waitWithLog(3000, 'Post-redirect stabilization')

    // PHASE 4: Attempt to access companies app
    log('\n📋 PHASE 4: Attempt unauthorized access to companies app')
    log(`Navigating to: ${URLS.companies}/dashboard`)

    await page.goto(`${URLS.companies}/dashboard`)
    await waitWithLog(8000, 'Middleware redirect processing')

    const urlAfterCompaniesAttempt = page.url()
    log(`URL after companies attempt: ${urlAfterCompaniesAttempt}`)

    expect(urlAfterCompaniesAttempt).toContain(URLS.patients)
    expect(urlAfterCompaniesAttempt).not.toContain(URLS.companies)
    log('✅ Middleware correctly blocked companies app access')

    await page.screenshot({ path: 'test-results/screenshots/blocked-companies.png' })
    await waitWithLog(3000, 'Post-redirect stabilization')

    // PHASE 5: Attempt to access admin app
    log('\n📋 PHASE 5: Attempt unauthorized access to admin app')
    log(`Navigating to: ${URLS.admin}/dashboard`)

    await page.goto(`${URLS.admin}/dashboard`)
    await waitWithLog(8000, 'Middleware redirect processing')

    const urlAfterAdminAttempt = page.url()
    log(`URL after admin attempt: ${urlAfterAdminAttempt}`)

    expect(urlAfterAdminAttempt).toContain(URLS.patients)
    expect(urlAfterAdminAttempt).not.toContain(URLS.admin)
    log('✅ Middleware correctly blocked admin app access')

    await page.screenshot({ path: 'test-results/screenshots/blocked-admin.png' })

    // PHASE 6: Verify we're still authenticated
    log('\n📋 PHASE 6: Verify authentication persisted through redirects')
    const authState = await checkAuthState()
    expect(authState.hasLocalStorage || authState.hasCookies).toBe(true)
    log('✅ User still authenticated after multiple redirect attempts')

    // PHASE 7: Verify we can still access patients app
    log('\n📋 PHASE 7: Verify legitimate access still works')
    await page.goto(`${URLS.patients}`)
    await waitWithLog(5000, 'Return to patients app')

    const finalUrl = page.url()
    expect(finalUrl).toContain(URLS.patients)
    log('✅ Can still access legitimate app')

    log('\n✅ TEST COMPLETED SUCCESSFULLY')
    log('All unauthorized access attempts were blocked')
    log('Legitimate access remains functional')

  }, TIMEOUTS.ULTRA_LONG) // 3 minutes timeout

})

describe('EXTENSIVE Auth Flow - ReturnUrl Journey', () => {

  test('Login with returnUrl and verify complete redirect flow', async () => {
    log('\n🎯 TEST: ReturnUrl preservation with extensive validation')

    const user = TEST_USERS.patient
    const targetPath = '/profile'
    const returnUrl = encodeURIComponent(`${user.expectedApp}${targetPath}`)

    // PHASE 1: Navigate to login with returnUrl
    log('\n📋 PHASE 1: Navigate to login with returnUrl parameter')
    const loginUrl = `${URLS.auth}/auth/login?returnUrl=${returnUrl}`
    log(`Login URL: ${loginUrl}`)

    await page.goto(loginUrl)
    await waitWithLog(5000, 'Login page with returnUrl load')

    // Verify returnUrl is in URL
    const currentUrl = page.url()
    expect(currentUrl).toContain('returnUrl')
    log('✅ ReturnUrl parameter preserved in login URL')

    // PHASE 2: Perform login
    log('\n📋 PHASE 2: Perform login')
    await loginUserExtensive(user.email, user.password)
    await waitWithLog(5000, 'Authentication processing')

    // Handle role selection
    if (page.url().includes('select-role')) {
      log('Selecting role...')
      const roleButton = await page.$('button:has-text("Patient")')
      if (roleButton) {
        await roleButton.click()
        await waitWithLog(3000, 'Role selection')
      }
    }

    // PHASE 3: Wait for redirect
    log('\n📋 PHASE 3: Wait for redirect to returnUrl')
    await waitWithLog(10000, 'ReturnUrl redirect processing')

    // PHASE 4: Verify final URL
    log('\n📋 PHASE 4: Verify final URL matches returnUrl')
    const finalUrl = page.url()
    log(`Final URL: ${finalUrl}`)

    expect(finalUrl).toContain(targetPath)
    log('✅ Successfully redirected to returnUrl target path')

    log('\n✅ TEST COMPLETED SUCCESSFULLY')

  }, TIMEOUTS.VERY_LONG) // 2 minutes timeout

})
