import { toCamel } from '@autamedica/shared';

/**
 * Convert Supabase snake_case payloads into camelCase structures for UI consumption.
 */
export function snakeToCamel<T = unknown>(input: unknown): T {
  return toCamel<T>(input);
}
