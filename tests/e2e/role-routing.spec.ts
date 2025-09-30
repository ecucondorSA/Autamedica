import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Role-Based Routing
 * Validates that users are redirected to correct portals based on their role
 */

const TEST_USERS = {
  organization_admin: {
    email: 'admin@clinica-demo.com',
    expectedPath: '/admin',
    expectedUrl: 'http://localhost:3004', // Admin portal
  },
  company: {
    email: 'company@clinica-demo.com', 
    expectedPath: '/companies',
    expectedUrl: 'http://localhost:3003', // Companies portal
  },
  doctor: {
    email: 'doctor@clinica-demo.com',
    expectedPath: '/doctors', 
    expectedUrl: 'http://localhost:3001', // Doctors portal
  },
  patient: {
    email: 'patient@clinica-demo.com',
    expectedPath: '/patients',
    expectedUrl: 'http://localhost:3002', // Patients portal
  },
} as const;

test.describe('Role-Based Routing E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the login page
    await page.goto('/auth/login');
  });

  Object.entries(TEST_USERS).forEach(([role, config]) => {
    test(`should redirect ${role} to correct portal`, async ({ page }) => {
      // Fill login form
      await page.fill('input[type="email"]', config.email);
      
      // Submit form (assuming magic link or dev login)
      await page.click('button[type="submit"]');
      
      // Wait for redirect (adjust timeout as needed)
      await page.waitForURL('**' + config.expectedPath + '**', { 
        timeout: 10000 
      });
      
      // Verify we're on the correct portal
      const currentUrl = page.url();
      expect(currentUrl).toContain(config.expectedPath);
      
      // Additional verification: check page title or specific elements
      await expect(page).toHaveTitle(new RegExp(role, 'i'));
    });
  });

  test('should handle invalid role gracefully', async ({ page }) => {
    // Test with non-existent user or invalid role
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.click('button[type="submit"]');
    
    // Should either stay on login or redirect to a default page
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toMatch(/(login|auth|patients)/); // Fallback to login or default portal
  });

  test('should preserve redirect parameter', async ({ page }) => {
    // Test redirect with ?redirect parameter
    await page.goto('/auth/login?redirect=/dashboard');
    
    await page.fill('input[type="email"]', TEST_USERS.organization_admin.email);
    await page.click('button[type="submit"]');
    
    // Should redirect to admin portal with dashboard path
    await page.waitForURL('**/admin**/dashboard**', { timeout: 10000 });
    expect(page.url()).toContain('/admin');
    expect(page.url()).toContain('/dashboard');
  });

  test('should display correct portal UI elements', async ({ page }) => {
    // Test that each portal loads with expected UI
    await page.fill('input[type="email"]', TEST_USERS.doctor.email);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/doctors**', { timeout: 10000 });
    
    // Check for doctor-specific UI elements
    await expect(page.locator('[data-testid="doctor-dashboard"]')).toBeVisible();
    await expect(page.locator('text=Video Calling')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should show role selection if multiple roles', async ({ page }) => {
    // Test user with multiple roles should see selection screen
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'multi-role@test.com');
    await page.click('button[type="submit"]');
    
    // Should show role selection page
    await expect(page.locator('[data-testid="role-selection"]')).toBeVisible();
  });

  test('should remember selected role', async ({ page }) => {
    // Test that role selection is persisted
    await page.goto('/auth/select-role');
    await page.click('[data-role="organization_admin"]');
    
    // Should redirect to admin portal
    await page.waitForURL('**/admin**', { timeout: 10000 });
    
    // Reload page - should stay in admin portal
    await page.reload();
    expect(page.url()).toContain('/admin');
  });
});
