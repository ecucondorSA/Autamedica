/**
 * Boundary Transformation Utilities
 *
 * Sistema híbrido de naming convention para AutaMedica:
 * - BD/Contratos/DAL: snake_case (fiel al esquema Supabase)
 * - UI/Componentes/Forms: camelCase (ergonómico en React/TS)
 * - Transformación solo en boundaries (entrada/salida de UI)
 *
 * REGLA ORO: Todo lo que toque BD/RLS/SQL = snake_case
 *            Todo lo que pinte en pantalla = camelCase
 *
 * @example
 * ```ts
 * // Desde BD → UI
 * const dbData = { patient_id: '123', start_time: '2025-01-01' };
 * const uiData = toCamel(dbData); // { patientId: '123', startTime: '2025-01-01' }
 *
 * // Desde UI → BD
 * const formData = { patientId: '123', startTime: '2025-01-01' };
 * const dbPayload = toSnake(formData); // { patient_id: '123', start_time: '2025-01-01' }
 * ```
 */

type Primitive = string | number | boolean | null | undefined | Date;
type AnyRecord = Record<string, unknown>;

/**
 * Convierte camelCase → snake_case
 * Ejemplo: "patientId" → "patient_id"
 */
const snake = (str: string): string =>
  str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

/**
 * Convierte snake_case → camelCase
 * Ejemplo: "patient_id" → "patientId"
 */
const camel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());

/**
 * Transforma recursivamente un objeto/array de snake_case a camelCase
 *
 * USAR: Cuando datos vienen de BD/Supabase hacia UI
 *
 * @template T - Tipo esperado después de transformación (UI type)
 * @param input - Datos en snake_case (DB type)
 * @returns Datos transformados a camelCase
 *
 * @example
 * ```ts
 * interface UiAppointment {
 *   patientId: string;
 *   startTime: string;
 *   endTime: string | null;
 * }
 *
 * const dbData = { patient_id: '123', start_time: '2025-01-01', end_time: null };
 * const uiData = toCamel<UiAppointment>(dbData);
 * // uiData: { patientId: '123', startTime: '2025-01-01', endTime: null }
 * ```
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

/**
 * Transforma recursivamente un objeto/array de camelCase a snake_case
 *
 * USAR: Cuando datos van desde UI hacia BD/Supabase
 *
 * @template T - Tipo esperado después de transformación (DB type)
 * @param input - Datos en camelCase (UI type)
 * @returns Datos transformados a snake_case
 *
 * @example
 * ```ts
 * interface DbAppointment {
 *   patient_id: string;
 *   start_time: string;
 *   end_time: string | null;
 * }
 *
 * const formData = { patientId: '123', startTime: '2025-01-01', endTime: null };
 * const dbPayload = toSnake<DbAppointment>(formData);
 * // dbPayload: { patient_id: '123', start_time: '2025-01-01', end_time: null }
 * ```
 */
export function toSnake<T = unknown>(input: unknown): T {
  // Arrays: transformar cada elemento
  if (Array.isArray(input)) {
    return input.map((value) => toSnake(value)) as unknown as T;
  }

  // Objetos planos: transformar llaves recursivamente
  // Excluir Date, null, primitivos
  if (input && typeof input === 'object' && !(input instanceof Date)) {
    const output: AnyRecord = {};

    for (const [key, value] of Object.entries(input as AnyRecord)) {
      output[snake(key)] = toSnake(value);
    }

    return output as T;
  }

  // Primitivos: retornar tal cual
  return input as T;
}

/**
 * Type helpers para inferir tipos transformados
 *
 * @example
 * ```ts
 * type DbUser = { user_id: string; first_name: string };
 * type UiUser = CamelCased<DbUser>; // { userId: string; firstName: string }
 * ```
 */
export type CamelCased<T> = T extends Array<infer U>
  ? Array<CamelCased<U>>
  : T extends Record<string, unknown>
  ? {
      [K in keyof T as K extends string
        ? CamelCase<K>
        : K]: CamelCased<T[K]>;
    }
  : T;

export type SnakeCased<T> = T extends Array<infer U>
  ? Array<SnakeCased<U>>
  : T extends Record<string, unknown>
  ? {
      [K in keyof T as K extends string
        ? SnakeCase<K>
        : K]: SnakeCased<T[K]>;
    }
  : T;

// String transformation types (compile-time only)
type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Tail extends Uncapitalize<Tail>
    ? `${Uncapitalize<Head>}${SnakeCase<Tail>}`
    : `${Uncapitalize<Head>}_${SnakeCase<Tail>}`
  : S;
