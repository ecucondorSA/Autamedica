import { getAppEnv, getLoginUrlBuilder } from '@autamedica/config';

export const patientsEnv = getAppEnv('patients');
export const patientsLoginUrlBuilder = getLoginUrlBuilder('patients');