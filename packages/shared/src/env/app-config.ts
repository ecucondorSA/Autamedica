/**
 * Application configuration helpers
 * Migrated from @autamedica/config for consolidation
 *
 * IMPORTANT: Uses environment utilities from shared/env
 * No direct process.env access per monorepo rules
 */

import { getClientEnvOrDefault, isDevelopment } from '../env';

export type AppName = 'patients' | 'doctors';

export interface AppEnvironmentConfig {
  nodeEnv: string;
  authHubOrigin: string;
  appOrigin: string;
  supabase: {
    url: string;
    anonKey: string;
  };
  signalingUrl: string;
  authDevBypassEnabled: boolean;
}

export interface LoginUrlBuilder {
  build(returnTo?: string): string;
}

/**
 * Gets the auth hub origin based on environment
 */
function getAuthHubOrigin(): string {
  return isDevelopment()
    ? getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_DEV_URL', 'http://localhost:3005')
    : getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_URL', 'https://auth.autamedica.com');
}

/**
 * Gets app origins configuration
 */
function getAppOrigins(): Record<AppName, string> {
  const devMode = isDevelopment();

  return {
    patients: devMode
      ? getClientEnvOrDefault('NEXT_PUBLIC_PATIENTS_DEV_URL', 'http://localhost:3002')
      : getClientEnvOrDefault('NEXT_PUBLIC_PATIENTS_URL', 'https://patients.autamedica.com'),
    doctors: devMode
      ? getClientEnvOrDefault('NEXT_PUBLIC_DOCTORS_DEV_URL', 'http://localhost:3001')
      : getClientEnvOrDefault('NEXT_PUBLIC_DOCTORS_URL', 'https://doctors.autamedica.com'),
  };
}

/**
 * Gets environment configuration for a specific app
 *
 * @param appName - The application name ('patients' | 'doctors')
 * @returns Complete environment configuration for the app
 */
export function getAppEnv(appName: AppName): AppEnvironmentConfig {
  const appOrigins = getAppOrigins();
  const authHubOrigin = getAuthHubOrigin();

  return {
    nodeEnv: isDevelopment() ? 'development' : 'production',
    authHubOrigin,
    appOrigin: appOrigins[appName],
    supabase: {
      url: getClientEnvOrDefault(
        'NEXT_PUBLIC_SUPABASE_URL',
        'https://gtyvdircfhmdjiaelqkg.supabase.co',
      ),
      anonKey: getClientEnvOrDefault(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4',
      ),
    },
    signalingUrl: getClientEnvOrDefault(
      'NEXT_PUBLIC_SIGNALING_URL',
      'ws://localhost:3005/signal',
    ),
    authDevBypassEnabled: getClientEnvOrDefault('NEXT_PUBLIC_AUTH_DEV_BYPASS', 'false') === 'true',
  };
}

/**
 * Creates a login URL builder for a specific app
 *
 * @param appName - The application name
 * @returns Login URL builder with build() method
 */
export function getLoginUrlBuilder(appName: AppName): LoginUrlBuilder {
  const authHubOrigin = getAuthHubOrigin();

  return {
    build(returnTo?: string): string {
      const params = new URLSearchParams();
      if (returnTo) {
        params.set('returnTo', returnTo);
      }
      const query = params.toString();
      return query ? `${authHubOrigin}/auth/login/?${query}` : `${authHubOrigin}/auth/login/`;
    },
  };
}
