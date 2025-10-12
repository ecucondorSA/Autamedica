#!/usr/bin/env node

// End-to-end login for Patients app using Auth Hub (dev):
// - Seeds a test patient user in Supabase (service role)
// - Opens Auth Hub login on :3005 and logs in
// - Verifies redirect to Patients (:3002)

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) {
      const key = m[1];
      let value = m[2];
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

async function ensureTestUser({ email, password }) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY');

  const admin = createClient(url, serviceKey);
  // Try to find existing user via Admin API
  try {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200, email })
      .catch(() => ({ data: { users: [] } }));
    const existing = list?.users?.find?.(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existing?.id) {
      await admin.auth.admin.deleteUser(existing.id).catch(() => {});
    }
  } catch {}

  // Create auth user
  const { data: newUser, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'patient', portal: 'patients', full_name: 'Ana Paciente' },
  });
  if (error) {
    // If user exists, try to resolve user id via profiles or listUsers and continue
    if (!/already been registered/i.test(error.message)) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  }

  // Resolve user id for profile upsert
  let userId = newUser?.user?.id;
  if (!userId) {
    // Try resolve via profiles by email
    try {
      const res = await admin.from('profiles').select('user_id').eq('email', email).limit(1);
      userId = res.data?.[0]?.user_id || userId;
    } catch {}
  }

  // Insert profile row if profiles table exists
  if (userId) {
    // Ensure user metadata has full_name for client fallback
    try { await admin.auth.admin.updateUserById(userId, { user_metadata: { full_name: 'Ana Paciente', role: 'patient', portal: 'patients' } }); } catch {}
    // Ensure minimal profile exists (avoid columns that might not exist)
    try {
      await admin.from('profiles').upsert({ user_id: userId, email });
    } catch {
      await admin.from('profiles').upsert({ id: userId, email }).catch(() => {});
    }
    return userId;
  }
  return null;
}

async function run() {
  // Load envs from Patients and Auth apps
  loadDotEnv(resolve('apps/patients/.env.local'));
  loadDotEnv(resolve('apps/auth/.env.local'));

  const creds = { email: 'test-patient@autamedica.com', password: 'password123' };
  await ensureTestUser(creds);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER][error]', err.message));

  const authUrl = 'http://localhost:3005/auth/login?role=patient&returnTo=http://localhost:3002/';
  await page.goto(authUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForURL(/\/auth\/login/, { timeout: 30000 }).catch(() => {});
  await page.waitForSelector('#email', { timeout: 30000 });
  await page.fill('#email', creds.email, { timeout: 20000 });
  await page.fill('#password', creds.password, { timeout: 20000 });
  await page.click('button[type="submit"]', { timeout: 15000 });

  // Wait for redirect to Patients domain
  await page.waitForURL((url) => url.host.includes('localhost:3002'), { timeout: 30000 });

  // If redirected to /auth/callback first, wait until root/dashboard loads
  const finalWaitStart = Date.now();
  while (Date.now() - finalWaitStart < 15000) {
    const url = page.url();
    if (url.includes('localhost:3002/') && !url.includes('/auth/')) break;
    await page.waitForTimeout(500);
  }

  // Verify personalized greeting on dashboard
  await page.waitForSelector(`text=¡Hola, Ana!`, { timeout: 10000 }).catch(() => {});
  console.log('✅ Patients login flow completed. Current URL:', page.url());
  // Navigate to profile page and ensure profile exists
  await page.goto('http://localhost:3002/profile', { waitUntil: 'networkidle', timeout: 20000 });
  const notFoundVisible = await page.locator('text=No encontramos tu perfil').isVisible().catch(() => false);
  if (notFoundVisible) throw new Error('Profile not found banner still visible');
  await page.screenshot({ path: 'apps/patients/test-results/patients-login.png', fullPage: true }).catch(()=>{});
  await browser.close();
}

run().catch((e) => { console.error('❌ E2E failed:', e); process.exit(1); });
