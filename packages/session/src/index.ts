import { UserRole } from '@autamedica/types';
import { getAppEnv, getLoginUrlBuilder, logger } from '@autamedica/shared';

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

  // Auth bypass is not supported in production builds
  // All apps must use proper authentication via Supabase
  if (appEnv.authDevBypassEnabled) {
    logger.error(
      `[${appName}] AUTH_DEV_BYPASS is enabled but not supported. ` +
      'Configure proper Supabase authentication in environment variables.'
    );
    return null;
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
    logger.error('Session sync error:', error);
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
    logger.error('Logout error:', error);
    window.location.href = loginUrl;
  }
}
