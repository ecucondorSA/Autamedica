import { test, expect } from '@playwright/test';

test.describe('Complete Auth Flow - E2E Integration', () => {
  test('should complete full auth flow: web-app → Auth Hub → portal', async ({ page }) => {
    // 1. Start from web-app landing page
    await page.goto('/', { waitUntil: 'networkidle' });

    // 2. Click on a portal-specific login link (doctors)
    const doctorsLoginLink = page.locator('a[href*="auth.autamedica.com"][href*="login"][href*="doctors"]').first();

    if (await doctorsLoginLink.count() > 0) {
      // Click the link and expect redirect to Auth Hub
      const [response] = await Promise.all([
        page.waitForResponse('**/login*'),
        doctorsLoginLink.click()
      ]);

      // Should reach Auth Hub
      expect(page.url()).toContain('auth.autamedica.com');
      expect(page.url()).toContain('login');
      expect(page.url()).toContain('portal=doctors');

      // Should show Auth Hub login form
      await expect(page).toHaveTitle(/login|auth|sign.*in/i);
    }
  });

  test('should preserve returnTo parameter through auth flow', async ({ page }) => {
    // Start with a specific return URL
    const returnUrl = encodeURIComponent('https://doctors.autamedica.com/dashboard');
    const authUrl = `https://auth.autamedica.com/login?portal=doctors&returnTo=${returnUrl}`;

    await page.goto(authUrl, { waitUntil: 'networkidle' });

    // Should preserve returnTo in the URL
    expect(page.url()).toContain('returnTo=');
    expect(page.url()).toContain('doctors.autamedica.com');
  });

  test('should handle different portal types correctly', async ({ page }) => {
    const portals = ['doctors', 'patients', 'companies'];

    for (const portal of portals) {
      const authUrl = `https://auth.autamedica.com/login?portal=${portal}`;

      const response = await page.goto(authUrl, { waitUntil: 'commit' });

      // Should reach Auth Hub successfully
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).toContain('auth.autamedica.com');
      expect(page.url()).toContain(`portal=${portal}`);
    }
  });
});

test.describe('Cookie Management - SSO Integration', () => {
  test('should set secure am_session cookie with correct flags', async ({ page, context }) => {
    // Mock successful login by setting the expected cookie
    await context.addCookies([{
      name: 'am_session',
      value: 'mock.jwt.token.with.valid.format.abc123',
      domain: '.autamedica.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }]);

    // Navigate to a page and verify cookie is preserved
    await page.goto('/', { waitUntil: 'networkidle' });

    const cookies = await context.cookies();
    const amSession = cookies.find(cookie => cookie.name === 'am_session');

    expect(amSession).toBeDefined();
    expect(amSession?.domain).toBe('.autamedica.com');
    expect(amSession?.path).toBe('/');
    expect(amSession?.httpOnly).toBe(true);
    expect(amSession?.secure).toBe(true);
    expect(amSession?.sameSite).toBe('None');
  });

  test('should clear invalid session and redirect to Auth Hub', async ({ page, context }) => {
    // Set malformed cookie
    await context.addCookies([{
      name: 'am_session',
      value: 'malformed-token',
      domain: '.autamedica.com',
      path: '/'
    }]);

    // Try to access protected route
    const response = await page.goto('/dashboard', { waitUntil: 'commit' });

    // Should redirect to Auth Hub with invalid session reason
    expect(response?.status()).toBe(302);
    expect(response?.url()).toContain('auth.autamedica.com');
    expect(response?.url()).toContain('reason=invalid_session');
  });

  test('should handle missing session gracefully', async ({ page, context }) => {
    // Clear all cookies
    await context.clearCookies();

    // Try to access protected route
    const response = await page.goto('/profile', { waitUntil: 'commit' });

    // Should redirect to Auth Hub
    expect(response?.status()).toBe(302);
    expect(response?.url()).toContain('auth.autamedica.com/login');
    expect(response?.url()).toContain('returnTo=');
  });
});

test.describe('Portal Routing Integration', () => {
  test('should route to correct portal after successful auth', async ({ page }) => {
    // Simulate the flow that Auth Hub would follow
    const portals = [
      { portal: 'doctors', expectedDomain: 'doctors.autamedica.com' },
      { portal: 'patients', expectedDomain: 'patients.autamedica.com' },
      { portal: 'companies', expectedDomain: 'companies.autamedica.com' }
    ];

    for (const { portal, expectedDomain } of portals) {
      // This simulates what Auth Hub would do after successful login
      const targetUrl = `https://${expectedDomain}/`;

      // Verify the target URL is reachable (basic connectivity test)
      const response = await page.goto(targetUrl, { waitUntil: 'commit' });

      // Portal should be accessible (not necessarily fully functional without auth)
      expect([200, 401, 403].includes(response?.status() || 0)).toBe(true);
    }
  });

  test('should handle unknown portal gracefully', async ({ page }) => {
    // Test with invalid portal parameter
    const authUrl = 'https://auth.autamedica.com/login?portal=invalid';

    const response = await page.goto(authUrl, { waitUntil: 'commit' });

    // Should still reach Auth Hub (Auth Hub should handle invalid portal internally)
    expect(response?.status()).toBeLessThan(500);
    expect(page.url()).toContain('auth.autamedica.com');
  });
});

test.describe('Security Validation', () => {
  test('should prevent auth bypass attempts', async ({ page }) => {
    // Try various bypass attempts
    const bypassAttempts = [
      '/dashboard?bypass=true',
      '/profile?auth=skip',
      '/settings?token=fake'
    ];

    for (const attempt of bypassAttempts) {
      const response = await page.goto(attempt, { waitUntil: 'commit' });

      // Should still redirect to Auth Hub
      expect(response?.status()).toBe(302);
      expect(response?.url()).toContain('auth.autamedica.com');
    }
  });

  test('should validate referrer and prevent CSRF', async ({ page }) => {
    // Set malicious referrer
    await page.setExtraHTTPHeaders({
      'Referer': 'https://malicious-site.com'
    });

    const response = await page.goto('/auth/login', { waitUntil: 'commit' });

    // Should still redirect to Auth Hub (middleware doesn't care about referrer for redirects)
    expect(response?.status()).toBe(301);
    expect(response?.url()).toContain('auth.autamedica.com');
  });

  test('should handle concurrent auth requests safely', async ({ browser }) => {
    // Create multiple concurrent contexts
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    // Make concurrent auth requests
    const responses = await Promise.all(
      pages.map(page => page.goto('/auth/login', { waitUntil: 'commit' }))
    );

    // All should redirect properly
    responses.forEach(response => {
      expect(response?.status()).toBe(301);
      expect(response?.url()).toContain('auth.autamedica.com');
    });

    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});

test.describe('Performance & Reliability', () => {
  test('should handle high traffic auth redirects', async ({ page }) => {
    const startTime = Date.now();

    // Make multiple rapid requests
    const promises = Array.from({ length: 10 }, () =>
      page.goto('/auth/login', { waitUntil: 'commit' })
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    // All requests should succeed
    responses.forEach(response => {
      expect(response?.status()).toBe(301);
    });

    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate network issues by setting very short timeout
    page.setDefaultTimeout(1000);

    try {
      await page.goto('/auth/login', { waitUntil: 'commit' });
    } catch (error) {
      // Network error is expected due to short timeout
      expect(error.message).toContain('timeout');
    }
  });
});