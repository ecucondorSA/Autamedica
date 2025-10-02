import { ensureEnv, getClientEnvOrDefault } from '@autamedica/shared';

const NODE_ENV = ensureEnv('NODE_ENV');

const AUTH_HUB_ORIGIN = NODE_ENV === 'development'
  ? getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_DEV_URL', 'http://localhost:3005')
  : getClientEnvOrDefault('NEXT_PUBLIC_AUTH_HUB_URL', 'https://auth.autamedica.com');

const DOCTORS_APP_ORIGIN = NODE_ENV === 'development'
  ? getClientEnvOrDefault('NEXT_PUBLIC_DOCTORS_DEV_URL', 'http://localhost:3001')
  : getClientEnvOrDefault('NEXT_PUBLIC_DOCTORS_URL', 'https://doctors.autamedica.com');

export const doctorsEnv = {
  nodeEnv: NODE_ENV,
  authHubOrigin: AUTH_HUB_ORIGIN,
  appOrigin: DOCTORS_APP_ORIGIN,
};

export const loginUrlBuilder = {
  build(returnTo?: string): string {
    const params = new URLSearchParams();
    if (returnTo) {
      params.set('returnTo', returnTo);
    }
    const query = params.toString();
    return query ? `${AUTH_HUB_ORIGIN}/login?${query}` : `${AUTH_HUB_ORIGIN}/login`;
  },
};
