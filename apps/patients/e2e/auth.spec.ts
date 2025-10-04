import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Patients App Authentication', () => {
  const user = {
    email: 'test-patient@autamedica.com',
    password: 'password123',
  };

  test.beforeAll(async () => {
    // Create a test user before running the tests
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existingUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: 'patient' },
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    await supabaseAdmin.from('profiles').insert({
      user_id: newUser.user.id,
      role: 'patient',
      email: user.email,
    });
  });

  test('should log in and log out a patient', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/auth/login?role=patient');

    // 2. Fill in the email and password
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);

    // 3. Click the login button
    await page.click('button[type="submit"]');

    // 4. Check that the user is redirected to the dashboard
    await page.waitForURL('/');
    expect(page.url()).not.toContain('login');

    // 5. Click the logout button
    // Assuming there is a button with text "Cerrar sesión"
    await page.click('text=Cerrar sesión');

    // 6. Check that the user is redirected to the login page
    await page.waitForURL('/auth/login');
    expect(page.url()).toContain('login');
  });
});
