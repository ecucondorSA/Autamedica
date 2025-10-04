/**
 * @fileoverview Test setup and utilities
 */

import { page } from '@vitest/browser/context'

export const URLS = {
  auth: process.env.AUTH_URL || 'http://localhost:3000',
  patients: process.env.PATIENTS_URL || 'http://localhost:3003',
  doctors: process.env.DOCTORS_URL || 'http://localhost:3002',
  companies: process.env.COMPANIES_URL || 'http://localhost:3004',
  admin: process.env.ADMIN_URL || 'http://localhost:3005'
} as const

export const TEST_USERS = {
  patient: {
    email: process.env.TEST_PATIENT_EMAIL || 'patient@dev.local',
    password: process.env.TEST_PATIENT_PASSWORD || 'password123',
    expectedApp: URLS.patients,
    role: 'patient' as const
  },
  doctor: {
    email: process.env.TEST_DOCTOR_EMAIL || 'doctor@dev.local',
    password: process.env.TEST_DOCTOR_PASSWORD || 'password123',
    expectedApp: URLS.doctors,
    role: 'doctor' as const
  },
  company: {
    email: process.env.TEST_COMPANY_EMAIL || 'company@dev.local',
    password: process.env.TEST_COMPANY_PASSWORD || 'password123',
    expectedApp: URLS.companies,
    role: 'company' as const
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@dev.local',
    password: process.env.TEST_ADMIN_PASSWORD || 'password123',
    expectedApp: URLS.admin,
    role: 'admin' as const
  }
} as const

export type TestUser = typeof TEST_USERS[keyof typeof TEST_USERS]

/**
 * Clear all authentication state
 */
export async function clearAuthState() {
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Clear cookies
    const cookies = await page.context().cookies()
    if (cookies.length > 0) {
      await page.context().clearCookies()
    }
  } catch (error) {
    console.warn('Error clearing auth state:', error)
  }
}

/**
 * Wait for navigation to a specific URL
 */
export async function waitForNavigation(expectedUrl: string, timeout = 10000): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url()
    if (currentUrl.includes(expectedUrl)) {
      return true
    }
    await page.waitForTimeout(500)
  }

  throw new Error(
    `Navigation timeout after ${timeout}ms: Expected URL to contain "${expectedUrl}", got "${page.url()}"`
  )
}

/**
 * Login a user with email and password
 */
export async function loginUser(email: string, password: string) {
  // Wait for email input
  await page.waitForSelector('input[type="email"], input[name="email"]', {
    timeout: 5000
  })

  // Fill credentials
  const emailInput = await page.$('input[type="email"], input[name="email"]')
  if (emailInput) {
    await emailInput.fill(email)
  }

  const passwordInput = await page.$('input[type="password"], input[name="password"]')
  if (passwordInput) {
    await passwordInput.fill(password)
  }

  // Find and click submit button
  const submitButton = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Iniciar")')
  if (submitButton) {
    await submitButton.click()
  } else {
    throw new Error('Submit button not found')
  }

  // Wait for form submission
  await page.waitForTimeout(1000)
}

/**
 * Verify user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const hasSession = await page.evaluate(() => {
      // Check for Supabase session in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase.auth.token')) {
          return true
        }
      }
      return false
    })

    return hasSession
  } catch {
    return false
  }
}

/**
 * Get current user role from session
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase.auth.token')) {
          const value = localStorage.getItem(key)
          if (value) {
            const session = JSON.parse(value)
            return session.user?.user_metadata?.role || null
          }
        }
      }
      return null
    })
  } catch {
    return null
  }
}

/**
 * Logout current user
 */
export async function logout() {
  // Clear auth state
  await clearAuthState()

  // Navigate to logout endpoint if it exists
  try {
    await page.goto(`${URLS.auth}/auth/logout`)
  } catch {
    // Logout endpoint might not exist, that's ok
  }
}

/**
 * Setup test environment
 */
export async function setupTest() {
  await clearAuthState()
}

/**
 * Teardown test environment
 */
export async function teardownTest() {
  await clearAuthState()
}
