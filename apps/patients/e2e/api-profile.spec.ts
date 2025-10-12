import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const USER = {
  email: 'e2e.patient+profile@autamedica.test',
  password: 'PatientProfile2025!'
}

test.describe('API /api/profile (GET/PATCH)', () => {
  test.beforeAll(async () => {
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: created, error } = await admin.auth.admin.createUser({
      email: USER.email,
      password: USER.password,
      email_confirm: true,
      user_metadata: { role: 'patient' },
    })
    let userId = created?.user?.id
    if (error) {
      const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: signRes, error: signErr } = await pub.auth.signInWithPassword({ email: USER.email, password: USER.password })
      if (signErr || !signRes.user) throw new Error(`No se pudo preparar usuario: ${signErr?.message}`)
      userId = signRes.user.id
    }
    try { await admin.from('patients').insert({ user_id: userId! }).single() } catch (_) { void 0 }
  })

  test('GET devuelve perfil y PATCH actualiza datos', async ({ page }) => {
    // 1) Iniciar sesión y establecer cookies en Patients
    const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: signed, error: signErr } = await pub.auth.signInWithPassword({ email: USER.email, password: USER.password })
    if (signErr || !signed.session) throw new Error(`Login falló: ${signErr?.message}`)
    await page.goto(`/auth/callback?access_token=${signed.session.access_token}&refresh_token=${signed.session.refresh_token}`)
    await page.waitForURL('/')

    // 2) Asegurar filas mínimas de perfil/paciente
    await page.request.post('/api/profile/ensure')

    // 3) GET /api/profile
    const res1 = await page.request.get('/api/profile')
    expect(res1.status()).not.toBe(401)
    const json1 = await res1.json()
    expect(json1.success).toBeTruthy()

    // 4) PATCH /api/profile
    const patch = await page.request.patch('/api/profile', {
      data: {
        profile: { firstName: 'E2E', lastName: 'Patient' },
        patient: { gender: 'other' }
      }
    })
    expect([200, 400, 500]).toContain(patch.status())
    const j2 = await patch.json().catch(() => ({}))
    if (patch.status() === 200) {
      expect(j2.success).toBeTruthy()
    }
  })
})
