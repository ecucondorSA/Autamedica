import { toSnake } from '@autamedica/shared';

/**
 * Convert camelCase form values into snake_case payloads for Supabase writes.
 */
export function camelToSnake<T = unknown>(input: unknown): T {
  return toSnake<T>(input);
}
