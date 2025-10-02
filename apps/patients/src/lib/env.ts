import { getClientEnvOrDefault } from '@autamedica/shared';

// Next.js replaces process.env.NODE_ENV at build time
const NODE_ENV = process.env.NODE_ENV || 'development';

const AUTH_HUB_ORIGIN = NODE_ENV === 'development'
  ? getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_DEV_URL', 'http://localhost:3005')
  : getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_URL', 'https://auth.autamedica.com');

const PATIENTS_APP_ORIGIN = NODE_ENV === 'development'
  ? getClientEnvOrDefault('NEXT_PUBLIC_PATIENTS_DEV_URL', 'http://localhost:3002')
  : getClientEnvOrDefault('NEXT_PUBLIC_PATIENTS_URL', 'https://patients.autamedica.com');

const SUPABASE_URL = getClientEnvOrDefault(
  'NEXT_PUBLIC_SUPABASE_URL',
  'https://gtyvdircfhmdjiaelqkg.supabase.co',
);

const SUPABASE_ANON_KEY = getClientEnvOrDefault(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4',
);

const SIGNALING_URL = getClientEnvOrDefault(
  'NEXT_PUBLIC_SIGNALING_URL',
  'ws://localhost:3005/signal',
);

const AUTH_DEV_BYPASS = getClientEnvOrDefault('NEXT_PUBLIC_AUTH_DEV_BYPASS', 'false');

export const patientsEnv = {
  nodeEnv: NODE_ENV,
  authHubOrigin: AUTH_HUB_ORIGIN,
  appOrigin: PATIENTS_APP_ORIGIN,
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },
  signalingUrl: SIGNALING_URL,
  authDevBypassEnabled: AUTH_DEV_BYPASS === 'true',
};

export const patientsLoginUrlBuilder = {
  build(returnTo?: string): string {
    const params = new URLSearchParams();
    if (returnTo) {
      params.set('returnTo', returnTo);
    }
    const query = params.toString();
    return query ? `${AUTH_HUB_ORIGIN}/login?${query}` : `${AUTH_HUB_ORIGIN}/login`;
  },
};
