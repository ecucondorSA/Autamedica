import { test, expect } from '@playwright/test';

test.describe('Error Detection and Network Analysis', () => {
  test('comprehensive error and network monitoring', async ({ page }) => {
    const errors = {
      console: [] as string[],
      network: [] as string[],
      javascript: [] as string[],
      resourceLoadFails: [] as string[]
    };

    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        errors.console.push(`[CONSOLE ERROR] ${text}`);
      } else if (type === 'warning' && text.includes('Failed')) {
        errors.console.push(`[CONSOLE WARNING] ${text}`);
      }
      
      // Log all console messages for debugging
      console.log(`[${type.toUpperCase()}] ${text}`);
    });

    // Listen for page errors (uncaught exceptions)
    page.on('pageerror', error => {
      errors.javascript.push(`[JS ERROR] ${error.message}`);
      console.error('JavaScript Error:', error.message);
    });

    // Listen for request failures
    page.on('requestfailed', request => {
      const failure = request.failure();
      errors.network.push(`[REQUEST FAILED] ${request.url()} - ${failure?.errorText}`);
      console.error('Request Failed:', request.url(), failure?.errorText);
    });

    // Listen for response errors
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.network.push(`[HTTP ${response.status()}] ${response.url()}`);
        console.warn(`HTTP Error ${response.status()}: ${response.url()}`);
      }
    });

    // Test landing page
    console.log('\n=== Testing Landing Page ===');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/landing-errors.png', fullPage: true });
    
    // Check for specific Supabase elements
    const supabaseUrl = await page.evaluate(() => {
      const env = (window as any).NEXT_PUBLIC_SUPABASE_URL;
      return env;
    });
    console.log('Supabase URL from window:', supabaseUrl);

    // Test login page
    console.log('\n=== Testing Login Page ===');
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/login-errors.png', fullPage: true });
    
    // Try to click OAuth button and capture network
    const googleButton = page.locator('button:has-text("Google")').first();
    if (await googleButton.isVisible()) {
      console.log('Attempting Google OAuth click...');
      
      // Start monitoring network
      const networkPromises: Promise<any>[] = [];
      
      page.on('request', request => {
        if (request.url().includes('supabase') || request.url().includes('google')) {
          console.log(`[OAUTH REQUEST] ${request.method()} ${request.url()}`);
        }
      });
      
      try {
        await Promise.race([
          googleButton.click(),
          page.waitForTimeout(3000)
        ]);
      } catch (e: any) {
        console.log('OAuth click result:', e.message);
      }
    }

    // Test OAuth callback simulation
    console.log('\n=== Testing OAuth Callback Simulation ===');
    const oauthUrl = '/#access_token=test&token_type=bearer&expires_in=3600&state=test';
    await page.goto(oauthUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    console.log('Final URL after OAuth simulation:', finalUrl);
    
    // Check if redirect happened
    const wasRedirected = finalUrl.includes('/auth/callback');
    console.log('OAuth interception worked:', wasRedirected);
    
    // Get all loaded resources
    const resources = await page.evaluate(() => {
      const perf = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return perf.map(r => ({
        name: r.name,
        type: r.initiatorType,
        duration: r.duration,
        size: r.transferSize || 0,
        status: r.responseStart > 0 ? 'loaded' : 'failed'
      }));
    });
    
    const failedResources = resources.filter(r => r.status === 'failed');
    if (failedResources.length > 0) {
      console.log('\n=== Failed Resources ===');
      failedResources.forEach(r => {
        errors.resourceLoadFails.push(`${r.type}: ${r.name}`);
        console.log(`- ${r.type}: ${r.name}`);
      });
    }

    // Summary
    console.log('\n=== ERROR SUMMARY ===');
    console.log('Console Errors:', errors.console.length);
    errors.console.forEach(e => console.log('  ', e));
    
    console.log('\nJavaScript Errors:', errors.javascript.length);
    errors.javascript.forEach(e => console.log('  ', e));
    
    console.log('\nNetwork Errors:', errors.network.length);
    errors.network.forEach(e => console.log('  ', e));
    
    console.log('\nFailed Resources:', errors.resourceLoadFails.length);
    errors.resourceLoadFails.forEach(e => console.log('  ', e));
    
    // Check OAuth functionality
    console.log('\n=== OAuth Status ===');
    console.log('OAuth redirect interception:', wasRedirected ? '✓ Working' : '✗ Not working - tokens landing on root');
    console.log('Supabase configured:', supabaseUrl ? '✓ Yes' : '✗ No');
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshots/final-error-state.png', fullPage: true });
    
    // Assertions
    expect(errors.javascript.length).toBe(0);
    expect(errors.resourceLoadFails.length).toBe(0);
  });
});