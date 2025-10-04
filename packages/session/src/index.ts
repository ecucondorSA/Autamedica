import { UserRole } from '@autamedica/types';
import { getAppEnv, getLoginUrlBuilder } from '@autamedica/config';

export interface SessionData {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    role: UserRole;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    last_path: string | null;
  };
  session: {
    expires_at: number;
    issued_at: number;
  };
}

export async function fetchSessionData(
  appName: 'patients' | 'doctors',
  expectedRole: UserRole
): Promise<SessionData | null> {
  const appEnv = getAppEnv(appName);

  if (appEnv.authDevBypassEnabled && appName === 'patients') {
    return {
      user: {
        id: 'dev-user-id',
        email: 'dev@patient.local',
      },
      profile: {
        id: 'dev-profile-id',
        role: 'patient' as UserRole,
        first_name: 'Dev',
        last_name: 'Patient',
        company_name: null,
        last_path: null,
      },
      session: {
        expires_at: Date.now() + 86400000, // 24h from now
        issued_at: Date.now(),
      },
    };
  }

  try {
    const response = await fetch(`${appEnv.authHubOrigin}/api/session-sync`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(`Session sync failed: ${response.status}`);
    }

    const sessionData: SessionData = await response.json();

    if (![expectedRole].includes(sessionData.profile.role)) {
      throw new Error(
        `Invalid role for ${appName} portal: ${sessionData.profile.role}`
      );
    }

    return sessionData;
  } catch (error) {
    console.error('Session sync error:', error);
    return null;
  }
}

export function getLoginUrl(
  appName: 'patients' | 'doctors',
  returnTo?: string
): string {
  const appEnv = getAppEnv(appName);
  const loginUrlBuilder = getLoginUrlBuilder(appName);
  const fallbackReturn =
    typeof window !== 'undefined' ? window.location.href : appEnv.appOrigin;
  return loginUrlBuilder.build(returnTo ?? fallbackReturn);
}

export async function logout(appName: 'patients' | 'doctors') {
  const appEnv = getAppEnv(appName);
  const loginUrl = getLoginUrl(appName);
  try {
    await fetch(`${appEnv.authHubOrigin}/api/session-sync`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnTo: loginUrl,
      }),
    });

    window.location.href = loginUrl;
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = loginUrl;
  }
}
