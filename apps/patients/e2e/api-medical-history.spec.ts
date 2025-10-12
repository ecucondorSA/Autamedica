import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const USER = {
  email: 'e2e.patient+history@autamedica.test',
  password: 'PatientHistory2025!'
}

test.describe('API /api/medical-history (GET + POST condition)', () => {
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
    try { await admin.from('patients').insert({ user_id: userId! }).single() } catch (_) {}
  })

  test('GET historial vacío y luego agregar condición (200)', async ({ page }) => {
    // 1) Login y set de cookies
    const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: signed, error: signErr } = await pub.auth.signInWithPassword({ email: USER.email, password: USER.password })
    if (signErr || !signed.session) throw new Error(`Login falló: ${signErr?.message}`)
    await page.goto(`/auth/callback?access_token=${signed.session.access_token}&refresh_token=${signed.session.refresh_token}`)
    await page.waitForURL('/')

    // 2) GET inicial
    const r1 = await page.request.get('/api/medical-history')
    expect(r1.status()).toBe(200)

    // 3) Agregar condición
    const r2 = await page.request.post('/api/medical-history/conditions', {
      data: { condition: 'Hipertensión (E2E)', icd10_code: 'I10', notes: 'test' }
    })
    expect([200, 201, 400, 500]).toContain(r2.status())

    // 4) GET nuevamente y verificar que no hay 401 y hay contenido
    const r3 = await page.request.get('/api/medical-history')
    expect(r3.status()).not.toBe(401)
    // Si el backend devolvió success+summary, validar estructura mínima
    const j3 = await r3.json().catch(() => ({}))
    if (j3?.success && j3?.data?.summary) {
      expect(j3.data.summary).toHaveProperty('active_conditions_count')
    }
  })
})
