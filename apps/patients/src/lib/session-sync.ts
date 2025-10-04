import {
  fetchSessionData as fetchSessionDataShared,
  getLoginUrl as getLoginUrlShared,
  logout as logoutShared,
  SessionData,
} from '@autamedica/session';

export { SessionData };

export async function fetchSessionData(): Promise<SessionData | null> {
  return fetchSessionDataShared('patients', 'patient');
}

export function getLoginUrl(returnTo?: string): string {
  return getLoginUrlShared('patients', returnTo);
}

export async function logout() {
  return logoutShared('patients');
}