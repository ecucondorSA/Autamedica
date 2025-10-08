import {
  fetchSessionData as fetchSessionDataShared,
  getLoginUrl as getLoginUrlShared,
  logout as logoutShared,
} from '@autamedica/session';

import type { SessionData } from '@autamedica/session';

export type { SessionData };

export async function fetchSessionData(): Promise<SessionData | null> {
  return fetchSessionDataShared('doctors', 'doctor');
}

export function getLoginUrl(returnTo?: string): string {
  return getLoginUrlShared('doctors', returnTo);
}

export async function logout() {
  return logoutShared('doctors');
}