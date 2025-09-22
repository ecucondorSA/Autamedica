import { test, expect, Page, Route } from '@playwright/test';

type UserRole =
  | 'patient'
  | 'doctor'
  | 'company'
  | 'company_admin'
  | 'admin'
  | 'platform_admin';

const DEFAULT_USER_ID = 'user_123';
const REDIRECT_TIMEOUT = { timeout: 15_000 };

function escapeRegex(value: string) {
  return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\$&');
}

function buildImplicitHash(extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams({
    access_token: 'fake_access_token',
    token_type: 'Bearer',
    expires_in: '3599',
    scope: 'email profile openid',
    ...Object.fromEntries(
      Object.entries(extra).map(([key, val]) => [key, String(val)])
    ),
  });

  return `#${params.toString()}`;
}

async function stubPortalTargets(page: Page, base: string) {
  const respond = async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 200 });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/plain' },
      body: 'ok',
    });
  };

  const patterns = [
    'https://autamedica-patients.pages.dev/**',
    'https://autamedica-doctors.pages.dev/**',
    'https://autamedica-companies.pages.dev/**',
    'https://patients.autamedica.com/**',
    'https://doctors.autamedica.com/**',
    'https://companies.autamedica.com/**',
  ];

  for (const pattern of patterns) {
    await page.route(pattern, respond);
  }

  const host = new URL(base).hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    const localPorts = [3001, 3002, 3003, 3004, 3005];
    for (const port of localPorts) {
      await page.route(`http://localhost:${port}/**`, respond);
      await page.route(`http://127.0.0.1:${port}/**`, respond);
    }
  }
}

async function mockSupabase(page: Page, options: { profileRole?: UserRole; userId?: string } = {}) {
  const { profileRole = 'patient', userId = DEFAULT_USER_ID } = options;

  const fulfillJson = async (route: Route, body: Record<string, unknown>) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  await page.route('**://*.supabase.co/auth/v1/**', async route => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 200 });
      return;
    }

    if (url.includes('/auth/v1/user') && method === 'GET') {
      await fulfillJson(route, {
        id: userId,
        email: 'test@autamedica.com',
        user_metadata: { role: profileRole },
      });
      return;
    }

    if (url.includes('/auth/v1/token') && method === 'POST') {
      await fulfillJson(route, {
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: userId,
          email: 'test@autamedica.com',
          user_metadata: { role: profileRole },
        },
        session: {
          access_token: 'fake_access_token',
          refresh_token: 'fake_refresh_token',
          token_type: 'bearer',
          user: {
            id: userId,
            email: 'test@autamedica.com',
            user_metadata: { role: profileRole },
          },
        },
      });
      return;
    }

    await fulfillJson(route, {});
  });

  await page.route('**://*.supabase.co/rest/v1/profiles*', async route => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 200 });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/json',
        'content-range': '0-0/1',
      },
      body: JSON.stringify({ role: profileRole }),
    });
  });
}

test.describe('Auth redirect rules', () => {
  test('middleware preserva returnTo', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    const target = '/companies/dashboard';

    const response = await page.goto(`${targetBase}${target}`);
    await expect(page).toHaveURL(new RegExp(`/auth/login\\?(.*&)?returnTo=${encodeURIComponent(target)}`));
    expect(response?.status() ?? 0).toBeLessThan(400);
  });

  test('callback elimina hash y respeta returnTo seguro', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'doctor' });

    const returnTo = '/doctors/agenda';
    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('returnTo', returnTo);

    const authRequest = page.waitForRequest('**://*.supabase.co/auth/**');
    const profileRequest = page.waitForRequest('**://*.supabase.co/rest/v1/profiles**');

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await Promise.all([authRequest, profileRequest]);

    await page.waitForURL(new RegExp(`${escapeRegex(returnTo)}$`), REDIRECT_TIMEOUT);
    expect(page.url()).not.toContain('#');
  });

  test('compatibilidad con ?from=', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'doctor' });

    const from = '/doctors/agenda';
    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('from', from);

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await page.waitForURL(new RegExp(`${escapeRegex(from)}$`), REDIRECT_TIMEOUT);
  });

  test('portal permitido por rol → redirección correcta', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'company' });

    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('portal', 'companies');

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await page.waitForURL(
      /(autamedica-companies\.pages\.dev|\/companies\/dashboard|localhost:3004)/,
      REDIRECT_TIMEOUT
    );
  });

  test('portal bloqueado por rol → usa fallback', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'patient' });

    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('portal', 'admin');

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await page.waitForURL(
      /(autamedica-patients\.pages\.dev|\/patients\/dashboard|localhost:3003)/,
      REDIRECT_TIMEOUT
    );
  });

  test('sanitización: returnTo externo se bloquea', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'doctor' });

    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('returnTo', 'https://evil.com/x');

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await page.waitForURL(
      /(autamedica-doctors\.pages\.dev|\/doctors\/dashboard|localhost:3002)/,
      REDIRECT_TIMEOUT
    );
  });

  test('error "state missing" sin token redirige a login', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('error', 'invalid_request');
    callbackUrl.searchParams.set('error_description', 'OAuth state parameter missing');

    await page.goto(callbackUrl.toString());
    await page.waitForURL(/\/auth\/login\?/, REDIRECT_TIMEOUT);
  });

  test('con token en hash ignora error "state missing"', async ({ page, baseURL }) => {
    const targetBase = baseURL ?? 'http://localhost:3000';
    await stubPortalTargets(page, targetBase);
    await mockSupabase(page, { profileRole: 'patient' });

    const callbackUrl = new URL('/auth/callback', targetBase);
    callbackUrl.searchParams.set('error', 'invalid_request');
    callbackUrl.searchParams.set('error_description', 'OAuth state parameter missing');

    await page.goto(`${callbackUrl.toString()}${buildImplicitHash()}`);
    await page.waitForURL(
      /(autamedica-patients\.pages\.dev|\/patients\/dashboard|localhost:3003)/,
      REDIRECT_TIMEOUT
    );
  });
});
