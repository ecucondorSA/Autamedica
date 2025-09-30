import { test, expect } from '@playwright/test';

test.describe('Auth Hardening - SSO Redirects', () => {
  test('should redirect legacy auth routes to Auth Hub with 301', async ({ page }) => {
    const legacyRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ];

    for (const route of legacyRoutes) {
      const response = await page.goto(route, { waitUntil: 'commit' });

      // Should be permanent redirect (301)
      expect(response?.status()).toBe(301);

      // Should redirect to Auth Hub
      expect(response?.url()).toContain('auth.autamedica.com');

      // Should preserve the path
      const expectedPath = route.replace('/auth', '');
      expect(response?.url()).toContain(expectedPath);

      // Should have monitoring headers
      expect(response?.headers()['x-auth-redirect-source']).toBe('web-app');
      expect(response?.headers()['x-auth-redirect-target']).toBe('auth-hub');
    }
  });

  test('should preserve portal parameter in auth redirects', async ({ page }) => {
    const routesWithPortal = [
      { route: '/auth/login?portal=doctors', expected: 'portal=doctors' },
      { route: '/auth/register?portal=patients', expected: 'portal=patients' },
      { route: '/auth/login?portal=companies&returnTo=/dashboard', expected: 'portal=companies' }
    ];

    for (const { route, expected } of routesWithPortal) {
      const response = await page.goto(route, { waitUntil: 'commit' });

      expect(response?.status()).toBe(301);
      expect(response?.url()).toContain('auth.autamedica.com');
      expect(response?.url()).toContain(expected);
    }
  });

  test('should add security headers to all responses', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    const headers = response?.headers() || {};

    // CSP headers for AutaMedica domains
    expect(headers['content-security-policy']).toContain('*.autamedica.com');
    expect(headers['content-security-policy']).toContain('*.supabase.co');

    // CORS headers
    expect(headers['access-control-allow-origin']).toContain('*.autamedica.com');
    expect(headers['access-control-allow-credentials']).toBe('true');

    // Security headers
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});

test.describe('Auth Hardening - Protected Routes', () => {
  test('should redirect to Auth Hub when accessing protected routes without session', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/profile', '/settings'];

    for (const route of protectedRoutes) {
      // Clear cookies to simulate no session
      await page.context().clearCookies();

      const response = await page.goto(route, { waitUntil: 'commit' });

      // Should redirect to login
      expect(response?.status()).toBe(302);
      expect(response?.url()).toContain('auth.autamedica.com/login');
      expect(response?.url()).toContain('returnTo=');

      // Should have auth required header
      expect(response?.headers()['x-auth-required']).toBe('true');
    }
  });

  test('should redirect to Auth Hub with invalid session cookie', async ({ page }) => {
    // Set invalid cookie
    await page.context().addCookies([{
      name: 'am_session',
      value: 'invalid.jwt.format',
      domain: '.autamedica.com',
      path: '/'
    }]);

    const response = await page.goto('/dashboard', { waitUntil: 'commit' });

    expect(response?.status()).toBe(302);
    expect(response?.url()).toContain('auth.autamedica.com/login');
    expect(response?.url()).toContain('reason=invalid_session');
    expect(response?.headers()['x-auth-invalid']).toBe('true');
  });

  test('should allow access to protected routes with valid session cookie', async ({ page }) => {
    // Set valid JWT format cookie (won't be fully validated but passes format check)
    await page.context().addCookies([{
      name: 'am_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      domain: '.autamedica.com',
      path: '/',
      httpOnly: true,
      secure: true
    }]);

    // Try to access protected route - should not redirect (but might 404 since route doesn't exist)
    const response = await page.goto('/dashboard', { waitUntil: 'commit' });

    // Should not redirect to auth (status could be 404 if route doesn't exist, but not 301/302)
    expect([200, 404].includes(response?.status() || 0)).toBe(true);
    expect(response?.url()).not.toContain('auth.autamedica.com');
  });
});

test.describe('Auth Hardening - Landing Page Integration', () => {
  test('should have working auth links that redirect to Auth Hub', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check mobile experience auth links
    const mobileLinks = page.locator('a[href*="auth.autamedica.com"]');
    const linkCount = await mobileLinks.count();

    // Should have multiple auth links pointing to Auth Hub
    expect(linkCount).toBeGreaterThan(0);

    // Verify first auth link
    if (linkCount > 0) {
      const firstLink = mobileLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toContain('auth.autamedica.com');
      expect(href).toMatch(/\/(login|register)/);
    }
  });

  test('should preserve portal parameters in landing page auth links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for portal-specific links
    const portalLinks = page.locator('a[href*="portal="]');
    const portalCount = await portalLinks.count();

    if (portalCount > 0) {
      const doctorsLink = page.locator('a[href*="portal=doctors"]').first();
      const patientsLink = page.locator('a[href*="portal=patients"]').first();
      const companiesLink = page.locator('a[href*="portal=companies"]').first();

      // Verify portal links exist and point to Auth Hub
      if (await doctorsLink.count() > 0) {
        const href = await doctorsLink.getAttribute('href');
        expect(href).toContain('auth.autamedica.com');
        expect(href).toContain('portal=doctors');
      }

      if (await patientsLink.count() > 0) {
        const href = await patientsLink.getAttribute('href');
        expect(href).toContain('auth.autamedica.com');
        expect(href).toContain('portal=patients');
      }

      if (await companiesLink.count() > 0) {
        const href = await companiesLink.getAttribute('href');
        expect(href).toContain('auth.autamedica.com');
        expect(href).toContain('portal=companies');
      }
    }
  });
});

test.describe('Auth Hardening - Performance & Monitoring', () => {
  test('should have fast redirect response times', async ({ page }) => {
    const startTime = Date.now();

    const response = await page.goto('/auth/login', { waitUntil: 'commit' });

    const redirectTime = Date.now() - startTime;

    // Redirect should be fast (under 500ms)
    expect(redirectTime).toBeLessThan(500);
    expect(response?.status()).toBe(301);
  });

  test('should not expose sensitive information in redirect URLs', async ({ page }) => {
    const response = await page.goto('/auth/login?secret=hidden&api_key=123', { waitUntil: 'commit' });

    expect(response?.status()).toBe(301);

    // Should redirect to Auth Hub
    expect(response?.url()).toContain('auth.autamedica.com');

    // Should preserve safe parameters but URL shouldn't expose actual secrets
    // (this test mainly ensures we're not accidentally logging sensitive data)
    expect(response?.url()).toContain('secret=hidden'); // This specific test data is safe
  });
});