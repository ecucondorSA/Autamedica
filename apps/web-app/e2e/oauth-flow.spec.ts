import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should load landing page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot of landing page
    await page.screenshot({ path: 'screenshots/landing-page.png', fullPage: true });
    
    // Check if main elements are visible
    await expect(page).toHaveTitle(/AutaMedica/i);
    
    // Check for main navigation elements
    const loginLink = page.locator('text=Iniciar Sesión').first();
    const registerLink = page.locator('text=Registrarse').first();
    
    // Check if auth links are visible
    const hasLoginLink = await loginLink.isVisible().catch(() => false);
    const hasRegisterLink = await registerLink.isVisible().catch(() => false);
    
    console.log('Login link visible:', hasLoginLink);
    console.log('Register link visible:', hasRegisterLink);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
    
    // Check login page elements
    await expect(page.locator('h1, h2').first()).toContainText(/Iniciar Sesión|Login/i);
    
    // Check for OAuth buttons
    const googleButton = page.locator('button:has-text("Google")');
    const githubButton = page.locator('button:has-text("GitHub")');
    
    const hasGoogleButton = await googleButton.isVisible().catch(() => false);
    const hasGithubButton = await githubButton.isVisible().catch(() => false);
    
    console.log('Google OAuth button visible:', hasGoogleButton);
    console.log('GitHub OAuth button visible:', hasGithubButton);
    
    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Take screenshot of register page
    await page.screenshot({ path: 'screenshots/register-page.png', fullPage: true });
    
    // Check register page elements
    await expect(page.locator('h1, h2').first()).toContainText(/Registr|Create|Cuenta/i);
    
    // Check for form fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();
  });

  test('should handle OAuth redirect interception', async ({ page }) => {
    // Navigate to root with mock OAuth tokens
    const mockTokenUrl = '/?error=invalid_request&error_code=400&error_description=OAuth+state+parameter+missing#access_token=mock_token&token_type=bearer&expires_in=3600&refresh_token=mock_refresh&provider_token=mock_provider&provider_refresh_token=mock_provider_refresh';
    
    await page.goto(mockTokenUrl);
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    // Take screenshot after redirect
    await page.screenshot({ path: 'screenshots/oauth-redirect.png', fullPage: true });
    
    // Check if we were redirected to callback
    const currentUrl = page.url();
    console.log('Current URL after OAuth redirect:', currentUrl);
    
    // We should be redirected to /auth/callback
    const wasRedirected = currentUrl.includes('/auth/callback');
    console.log('Was redirected to callback:', wasRedirected);
  });

  test('should check callback page processing', async ({ page }) => {
    // Navigate directly to callback with mock tokens
    await page.goto('/auth/callback#access_token=mock_token&token_type=bearer&expires_in=3600');
    
    // Take screenshot of callback page
    await page.screenshot({ path: 'screenshots/callback-page.png', fullPage: true });
    
    // Check for loading indicator
    const loadingText = page.locator('text=/Procesando|Processing|Loading/i');
    const hasLoadingText = await loadingText.isVisible().catch(() => false);
    console.log('Callback page shows loading:', hasLoadingText);
    
    // Wait for potential redirect
    await page.waitForTimeout(3000);
    
    // Check final URL after processing
    const finalUrl = page.url();
    console.log('Final URL after callback processing:', finalUrl);
  });

  test('should check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through main pages
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.goto('/auth/login');
    await page.waitForTimeout(1000);
    
    await page.goto('/auth/register');
    await page.waitForTimeout(1000);
    
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:');
      consoleErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('No console errors found');
    }
    
    // Take screenshot of final state
    await page.screenshot({ path: 'screenshots/final-state.png', fullPage: true });
  });

  test('should check Supabase configuration', async ({ page }) => {
    await page.goto('/');
    
    // Check if Supabase client is configured
    const hasSupabaseError = await page.evaluate(() => {
      // Check for Supabase-related errors in console
      return window.location.hostname;
    });
    
    console.log('Testing on domain:', hasSupabaseError);
    
    // Try to access login and check for Supabase warnings
    await page.goto('/auth/login');
    
    // Check network requests for Supabase
    const supabaseRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('supabase')) {
        supabaseRequests.push(request.url());
      }
    });
    
    // Trigger OAuth flow (will fail but we can see the attempt)
    const googleButton = page.locator('button:has-text("Google")').first();
    const hasGoogleOAuth = await googleButton.isVisible().catch(() => false);
    
    if (hasGoogleOAuth) {
      console.log('Google OAuth button found, attempting click...');
      await googleButton.click().catch((error) => {
        console.log('OAuth button click result:', error.message);
      });
    }
    
    await page.waitForTimeout(2000);
    
    // Report Supabase requests
    if (supabaseRequests.length > 0) {
      console.log('Supabase requests made:');
      supabaseRequests.forEach(req => console.log('  -', req));
    } else {
      console.log('No Supabase requests detected');
    }
  });
});