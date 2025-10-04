/**
 * @fileoverview Integration tests for authentication and redirection
 * Tests the complete flow from login to role-based app redirection
 *
 * Run with: pnpm test:auth:browser
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
  },
  company: {
    email: 'company@dev.local',
    password: 'password123',
    expectedApp: URLS.companies,
    role: 'company'
  },
  admin: {
    email: 'admin@dev.local',
    password: 'password123',
    expectedApp: URLS.admin,
    role: 'admin'
  }
}

// Helper functions
async function clearAuthState() {
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Clear cookies
  const cookies = await page.context().cookies()
  await page.context().clearCookies()
}

async function waitForNavigation(expectedUrl: string, timeout = 10000) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url()
    if (currentUrl.includes(expectedUrl)) {
      return true
    }
    await page.waitForTimeout(500)
  }

  throw new Error(`Navigation timeout: Expected ${expectedUrl}, got ${page.url()}`)
}

async function loginUser(email: string, password: string) {
  await page.goto(`${URLS.auth}/auth/login`)

  // Wait for page to load
  await page.waitForSelector('input[type="email"]', { timeout: 5000 })

  // Fill login form
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)

  // Submit
  await page.getByRole('button', { name: /sign in|login|iniciar/i }).click()
}

// Setup
beforeEach(async () => {
  await clearAuthState()
})

// ============================================
// TEST SUITE: Role-Based Redirects
// ============================================

describe('Authentication Flow - Role-Based Redirects', () => {

  test('patient logs in and redirects to patients app', async () => {
    const user = TEST_USERS.patient

    // Navigate to login
    await page.goto(`${URLS.auth}/auth/login`)
    expect(page.url()).toContain('/auth/login')

    // Login
    await loginUser(user.email, user.password)

    // Wait for redirect
    await waitForNavigation(user.expectedApp)

    // Verify final URL
    expect(page.url()).toContain(user.expectedApp)

    // Verify we're on the correct page
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
  }, 30000)

  test('doctor logs in and redirects to doctors app', async () => {
    const user = TEST_USERS.doctor

    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)

    await waitForNavigation(user.expectedApp)
    expect(page.url()).toContain(user.expectedApp)
  }, 30000)

  test('company user logs in and redirects to companies app', async () => {
    const user = TEST_USERS.company

    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)

    await waitForNavigation(user.expectedApp)
    expect(page.url()).toContain(user.expectedApp)
  }, 30000)

  test('admin logs in and redirects to admin app', async () => {
    const user = TEST_USERS.admin

    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)

    await waitForNavigation(user.expectedApp)
    expect(page.url()).toContain(user.expectedApp)
  }, 30000)
})

// ============================================
// TEST SUITE: Middleware Protection
// ============================================

describe('Middleware Protection', () => {

  test('patient cannot access doctors app (redirects back to patients)', async () => {
    const user = TEST_USERS.patient

    // Login as patient
    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)
    await waitForNavigation(URLS.patients)

    // Try to access doctors app
    await page.goto(`${URLS.doctors}/dashboard`)

    // Should be redirected back to patients
    await page.waitForTimeout(2000) // Give middleware time to redirect
    expect(page.url()).toContain(URLS.patients)
  }, 30000)

  test('doctor cannot access patients app (redirects back to doctors)', async () => {
    const user = TEST_USERS.doctor

    // Login as doctor
    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)
    await waitForNavigation(URLS.doctors)

    // Try to access patients app
    await page.goto(`${URLS.patients}/dashboard`)

    // Should be redirected back to doctors
    await page.waitForTimeout(2000)
    expect(page.url()).toContain(URLS.doctors)
  }, 30000)
})

// ============================================
// TEST SUITE: ReturnUrl Preservation
// ============================================

describe('ReturnUrl Preservation', () => {

  test('user is redirected to returnUrl after login', async () => {
    const user = TEST_USERS.patient
    const targetPath = '/profile'
    const returnUrl = encodeURIComponent(`${user.expectedApp}${targetPath}`)

    // Navigate to login with returnUrl
    await page.goto(`${URLS.auth}/auth/login?returnUrl=${returnUrl}`)

    // Login
    await loginUser(user.email, user.password)

    // Wait for redirect
    await page.waitForTimeout(3000)

    // Should be redirected to the specific path, not just the app root
    const finalUrl = page.url()
    expect(finalUrl).toContain(targetPath)
  }, 30000)

  test('invalid returnUrl is ignored and uses default redirect', async () => {
    const user = TEST_USERS.patient
    const maliciousUrl = 'https://evil.com/steal-data'

    // Try to use external returnUrl
    await page.goto(`${URLS.auth}/auth/login?returnUrl=${encodeURIComponent(maliciousUrl)}`)

    // Login
    await loginUser(user.email, user.password)

    // Wait for redirect
    await waitForNavigation(user.expectedApp)

    // Should use default redirect, NOT the malicious URL
    expect(page.url()).toContain(user.expectedApp)
    expect(page.url()).not.toContain('evil.com')
  }, 30000)
})

// ============================================
// TEST SUITE: Role Selection
// ============================================

describe('Role Selection for New Users', () => {

  test.skip('new user without role sees select-role page', async () => {
    // This test requires creating a new user
    // Skip for now since it requires database cleanup

    // Future implementation:
    // 1. Register new user
    // 2. Verify redirect to /auth/select-role
    // 3. Select a role
    // 4. Verify redirect to correct app
  })

  test.skip('user can select patient role and redirect to patients app', async () => {
    // Future implementation
  })
})

// ============================================
// TEST SUITE: Session Management
// ============================================

describe('Session Management', () => {

  test('logged out user is redirected to login when accessing protected route', async () => {
    // Ensure no session
    await clearAuthState()

    // Try to access protected route
    await page.goto(`${URLS.patients}/dashboard`)

    // Should redirect to login
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/auth/login')
  }, 15000)

  test('user session persists across page reloads', async () => {
    const user = TEST_USERS.patient

    // Login
    await page.goto(`${URLS.auth}/auth/login`)
    await loginUser(user.email, user.password)
    await waitForNavigation(user.expectedApp)

    // Reload page
    await page.reload()

    // Should still be on patients app (not redirected to login)
    await page.waitForTimeout(2000)
    expect(page.url()).toContain(user.expectedApp)
  }, 30000)
})

// ============================================
// TEST SUITE: Error Handling
// ============================================

describe('Error Handling', () => {

  test('invalid credentials show error message', async () => {
    await page.goto(`${URLS.auth}/auth/login`)

    await loginUser('invalid@example.com', 'wrongpassword')

    // Wait for error message
    await page.waitForTimeout(2000)

    // Should show error and stay on login page
    expect(page.url()).toContain('/auth/login')

    // Check for error message (this depends on your UI)
    const pageContent = await page.textContent('body')
    expect(pageContent?.toLowerCase()).toMatch(/error|invalid|incorrecto/i)
  }, 15000)

  test('missing email shows validation error', async () => {
    await page.goto(`${URLS.auth}/auth/login`)

    // Try to submit without email
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in|login|iniciar/i }).click()

    // Should show validation error
    await page.waitForTimeout(1000)

    // Verify still on login page
    expect(page.url()).toContain('/auth/login')
  }, 15000)
})
