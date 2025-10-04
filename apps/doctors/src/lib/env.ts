import { getAppEnv, getLoginUrlBuilder } from '@autamedica/config';

export const doctorsEnv = getAppEnv('doctors');
export const loginUrlBuilder = getLoginUrlBuilder('doctors');