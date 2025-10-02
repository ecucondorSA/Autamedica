/**
 * Case conversion utilities for types package
 * (Duplicated from @autamedica/shared to avoid circular dependency)
 */

type AnyRecord = Record<string, unknown>;

/**
 * Convierte snake_case → camelCase
 * Ejemplo: "patient_id" → "patientId"
 */
const camel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

/**
 * Transforma recursivamente un objeto/array de snake_case a camelCase
 *
 * @template T - Tipo esperado después de transformación (UI type)
 * @param input - Datos en snake_case (DB type)
 * @returns Datos transformados a camelCase
 */
export function toCamel<T = unknown>(input: unknown): T {
  // Arrays: transformar cada elemento
  if (Array.isArray(input)) {
    return input.map((value) => toCamel(value)) as unknown as T;
  }

  // Objetos planos: transformar llaves recursivamente
  // Excluir Date, null, primitivos
  if (input && typeof input === 'object' && !(input instanceof Date)) {
    const output: AnyRecord = {};

    for (const [key, value] of Object.entries(input as AnyRecord)) {
      output[camel(key)] = toCamel(value);
    }

    return output as T;
  }

  // Primitivos: retornar tal cual
  return input as T;
}
