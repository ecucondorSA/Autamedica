import { expect, test } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const DOCTOR_EMAIL = process.env.DOCTOR_DEMO_EMAIL ?? 'doctor.demo@autamedica.com';
const DOCTOR_PASSWORD = process.env.DOCTOR_DEMO_PASSWORD ?? 'Demo1234';
const SUPABASE_URL = process.env.SUPABASE_URL
  ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const REPORT_PATH = '/tmp/test_doctor_video_call.json';

test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-sandbox',
      '--disable-features=Translate,MediaSessionService',
    ],
  },
});

test.describe('Doctor Portal – Login + Video Call', () => {
  test('doctor can authenticate, validate profile and complete a patient video call', async ({ browser }, testInfo) => {
    test.skip(!SUPABASE_ANON_KEY, 'Supabase anon key required to validate doctor identity.');

    test.setTimeout(180_000);

    const doctorContext = await browser.newContext({
      permissions: ['camera', 'microphone'],
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    let patientContext: BrowserContext | null = null;

    try {
      await doctorContext.addInitScript(`
      (function() {
        const Original = window.RTCPeerConnection;
        if (!Original) {
          return;
        }
        const connections = [];
        Object.defineProperty(window, '__autamedicaPeerConnections', {
          configurable: true,
          get() {
            return connections;
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).RTCPeerConnection = function(...args) {
          const pc = new Original(...args);
          connections.push(pc);
          return pc;
        };
        (window as any).RTCPeerConnection.prototype = Original.prototype;
      })();
    `);

      const doctorPage = await doctorContext.newPage();
      const doctorConsole: string[] = [];
      doctorPage.on('console', (message) => doctorConsole.push(message.text()));

      await doctorPage.goto('https://auth.autamedica.com/auth/login?role=doctor', { waitUntil: 'networkidle' });

    await doctorPage.getByLabel('Correo electrónico').fill(DOCTOR_EMAIL);
    await doctorPage.getByLabel('Contraseña').fill(DOCTOR_PASSWORD);

    await Promise.all([
      doctorPage.waitForURL('**//doctors.autamedica.com/**', { timeout: 60_000 }),
      doctorPage.getByRole('button', { name: /Iniciar Sesión/i }).click(),
    ]);

    await doctorPage.waitForLoadState('networkidle');

    await expect(doctorPage).toHaveURL(/doctors\.autamedica\.com/);
    await expect(doctorPage.locator('header')).toContainText(/Conectado/i, { timeout: 30_000 });

    const headerSnapshot = await doctorPage.evaluate(() => {
      const header = document.querySelector('header');
      const name = header?.querySelector('p.text-xs, p.text-sm, span')?.textContent?.trim() ?? null;
      return { name };
    });

    const authDetails = await doctorPage.evaluate(async ({ supabaseUrl, supabaseAnonKey }) => {
      const tokenString = window.localStorage.getItem('supabase.auth.token');
      if (!tokenString) {
        return { hasToken: false };
      }

      let parsedToken: Record<string, unknown> | null = null;
      try {
        parsedToken = JSON.parse(tokenString);
      } catch (error) {
        return { hasToken: true, parseError: String(error) };
      }

      const session = (parsedToken as any)?.currentSession ?? (parsedToken as any)?.session ?? null;
      const user = session?.user ?? null;
      const accessToken = session?.access_token ?? null;
      const roleFromMetadata = user?.app_metadata?.role ?? user?.user_metadata?.role ?? null;

      let rpcRole: string | null = null;
      let profileRole: string | null = null;
      let fullName: string | null = null;
      let specialties: string[] = [];
      let fetchError: string | null = null;

      if (accessToken) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        };

        try {
          const roleResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_role`, {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
          });

          if (roleResponse.ok) {
            rpcRole = await roleResponse.json();
          }

          if (user?.id) {
            const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=full_name,role,specialties`, {
              method: 'GET',
              headers,
            });

            if (profileResponse.ok) {
              const data = await profileResponse.json();
              if (Array.isArray(data) && data.length > 0) {
                profileRole = data[0].role ?? null;
                fullName = data[0].full_name ?? null;
                specialties = Array.isArray(data[0].specialties) ? data[0].specialties : [];
              }
            }
          }
        } catch (error) {
          fetchError = String(error);
        }
      }

      return {
        hasToken: true,
        session,
        user,
        rpcRole,
        profileRole,
        roleFromMetadata,
        fullName,
        specialties,
        fetchError,
      };
    }, { supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });

    expect(authDetails.hasToken).toBeTruthy();
    expect(authDetails.session).toBeTruthy();

    const resolvedRole = authDetails.rpcRole ?? authDetails.roleFromMetadata ?? authDetails.profileRole ?? null;
    expect(resolvedRole).toBe('doctor');

    const doctorFullName = authDetails.fullName ?? headerSnapshot.name ?? authDetails.user?.email ?? 'Doctor';
    const doctorSpecialty = authDetails.specialties && authDetails.specialties.length > 0 ? authDetails.specialties[0] : null;

    if (doctorFullName) {
      await expect(doctorPage.locator('body')).toContainText(new RegExp(doctorFullName.split(' ')[0], 'i'));
    }

    if (doctorSpecialty) {
      await expect(doctorPage.locator('body')).toContainText(new RegExp(doctorSpecialty.split(' ')[0], 'i'));
    }

    const callButton = doctorPage.locator('button', { hasText: /Llamar a/i }).first();
    await callButton.scrollIntoViewIfNeeded();
    await expect(callButton).toBeVisible({ timeout: 60_000 });

    const patientButtonText = (await callButton.textContent()) ?? '';
    const patientName = patientButtonText.replace(/Llamar a/i, '').trim() || 'Paciente';

    await callButton.click();

    await doctorPage.waitForURL('**/call/**', { timeout: 60_000 });
    await doctorPage.waitForLoadState('networkidle');

    const doctorCallUrl = new URL(doctorPage.url());
    const roomId = doctorCallUrl.pathname.split('/').filter(Boolean).pop() ?? 'doctor_patient_001';
    const callId = doctorCallUrl.searchParams.get('callId');

    const doctorStartButton = doctorPage.locator('button[title="Iniciar videollamada"]');
    await expect(doctorStartButton).toBeVisible({ timeout: 60_000 });
    await doctorStartButton.click();

    const doctorStatusLocator = doctorPage.locator('text=/Estableciendo conexión|Videollamada activa/');
    await expect(doctorStatusLocator).toBeVisible({ timeout: 60_000 });

      patientContext = await browser.newContext({
        permissions: ['camera', 'microphone'],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      });

      await patientContext.addInitScript(`
      (function() {
        const Original = window.RTCPeerConnection;
        if (!Original) {
          return;
        }
        const connections = [];
        Object.defineProperty(window, '__autamedicaPeerConnections', {
          configurable: true,
          get() {
            return connections;
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).RTCPeerConnection = function(...args) {
          const pc = new Original(...args);
          connections.push(pc);
          return pc;
        };
        (window as any).RTCPeerConnection.prototype = Original.prototype;
      })();
    `);

      const patientPage = await patientContext.newPage();
      const patientConsole: string[] = [];
      patientPage.on('console', (message) => patientConsole.push(message.text()));

      await patientPage.goto('https://patients.autamedica.com/test-call', { waitUntil: 'networkidle' });
    await patientPage.getByLabel('Room ID (Código de Consulta)').fill(roomId);
    await patientPage.getByRole('button', { name: /Unirse a Consulta Médica/i }).click();

    const patientStartButton = patientPage.locator('button[title="Iniciar videollamada"]');
    await expect(patientStartButton).toBeVisible({ timeout: 60_000 });
    await patientStartButton.click();

    const callStartAt = Date.now();

    await expect(doctorPage.locator('text=/Videollamada activa/')).toBeVisible({ timeout: 60_000 });
    await expect(patientPage.locator('text=/Videollamada activa/')).toBeVisible({ timeout: 60_000 });

    const doctorPeerStates = await doctorPage.evaluate(() => {
      return (window as any).__autamedicaPeerConnections?.map((pc: RTCPeerConnection) => ({
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      })) ?? [];
    });

    const patientPeerStates = await patientPage.evaluate(() => {
      return (window as any).__autamedicaPeerConnections?.map((pc: RTCPeerConnection) => ({
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      })) ?? [];
    });

    const doctorConnectionOk = doctorPeerStates.some((state) => state.connectionState === 'connected');
    const patientConnectionOk = patientPeerStates.some((state) => state.connectionState === 'connected');

    expect(doctorConnectionOk).toBeTruthy();
    expect(patientConnectionOk).toBeTruthy();

    const doctorVideoState = await doctorPage.evaluate(() => {
      return Array.from(document.querySelectorAll('video')).map((video) => ({
        muted: video.muted,
        readyState: video.readyState,
        currentSrc: video.currentSrc,
        hasVideoTrack: Boolean(video.srcObject && video.srcObject.getVideoTracks().some((track) => track.readyState === 'live')),
        hasAudioTrack: Boolean(video.srcObject && video.srcObject.getAudioTracks().some((track) => track.readyState === 'live')),
      }));
    });

    const patientVideoState = await patientPage.evaluate(() => {
      return Array.from(document.querySelectorAll('video')).map((video) => ({
        muted: video.muted,
        readyState: video.readyState,
        currentSrc: video.currentSrc,
        hasVideoTrack: Boolean(video.srcObject && video.srcObject.getVideoTracks().some((track) => track.readyState === 'live')),
        hasAudioTrack: Boolean(video.srcObject && video.srcObject.getAudioTracks().some((track) => track.readyState === 'live')),
      }));
    });

    const doctorVideoOk = doctorVideoState.some((video) => video.readyState >= 2 && video.hasVideoTrack);
    const patientVideoOk = patientVideoState.some((video) => video.readyState >= 2 && video.hasVideoTrack);

    expect(doctorVideoOk).toBeTruthy();
    expect(patientVideoOk).toBeTruthy();

    const doctorHangup = doctorPage.locator('button[title="Terminar videollamada"]');
    const patientHangup = patientPage.locator('button[title="Terminar videollamada"]');

    await expect(doctorHangup).toBeVisible({ timeout: 15_000 });
    await expect(patientHangup).toBeVisible({ timeout: 15_000 });

    await doctorHangup.click();
    await patientHangup.click();

    await expect(doctorPage.locator('text=Presiona el botón para iniciar la videollamada')).toBeVisible({ timeout: 30_000 });
    await expect(patientPage.locator('text=Presiona el botón para iniciar la videollamada')).toBeVisible({ timeout: 30_000 });

    const callEndAt = Date.now();

    await doctorPage.evaluate(async ({ supabaseUrl, supabaseAnonKey }) => {
      const tokenString = window.localStorage.getItem('supabase.auth.token');
      if (!tokenString) {
        return false;
      }

      let parsedToken: Record<string, unknown> | null = null;
      try {
        parsedToken = JSON.parse(tokenString);
      } catch (error) {
        return false;
      }

      const session = (parsedToken as any)?.currentSession ?? (parsedToken as any)?.session ?? null;
      const accessToken = session?.access_token ?? null;

      if (!accessToken) {
        return false;
      }

      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      window.localStorage.removeItem('supabase.auth.token');
      return true;
    }, { supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });

    const callDurationSeconds = Math.max(1, Math.round((callEndAt - callStartAt) / 1000));

    const report = {
      login: authDetails.hasToken ? 'success' : 'failed',
      role: resolvedRole,
      patient: patientName,
      call_status: doctorConnectionOk && patientConnectionOk ? 'connected' : 'failed',
      duration_sec: callDurationSeconds,
      room_id: roomId,
      call_id: callId,
      doctor_video_state: doctorVideoState,
      patient_video_state: patientVideoState,
      doctor_console: doctorConsole.slice(-10),
      patient_console: patientConsole.slice(-10),
    };

      await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

      testInfo.attach('doctor-video-call-report', {
        path: REPORT_PATH,
        contentType: 'application/json',
      });
    } finally {
      await patientContext?.close();
      await doctorContext.close();
    }
  });
});
