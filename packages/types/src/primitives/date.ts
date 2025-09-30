/**
 * Tipos relacionados con fechas y tiempo
 * Siempre usar ISODateString para APIs en lugar de Date objects
 */

/**
 * String en formato ISO 8601 para fechas
 * Ejemplo: "2024-12-15T10:30:00.000Z"
 *
 * @branded true
 * @example
 * ```typescript
 * const created: ISODateString = "2024-12-15T10:30:00.000Z";
 * const invalid: ISODateString = "not-a-date"; // ❌ Error de tipo
 * ```
 */
export type ISODateString = string & { readonly __brand: "ISODateString" };

/**
 * String en formato ISO 8601 con tiempo (timestamptz compatible)
 * Ejemplo: "2025-09-29T20:00:00Z"
 *
 * @branded true
 * @example
 * ```typescript
 * const timestamp: ISODateTime = "2025-09-29T20:00:00Z";
 * ```
 */
export type ISODateTime = string & { readonly __brand: "ISODateTime" };

/**
 * Helper para crear ISODateString desde Date
 */
export function toISODateString(date: Date): ISODateString {
  return date.toISOString() as ISODateString;
}

/**
 * Helper para crear Date desde ISODateString
 */
export function fromISODateString(isoString: ISODateString): Date {
  return new Date(isoString);
}

/**
 * Helper para crear ISODateString del momento actual
 */
export function nowAsISODateString(): ISODateString {
  return toISODateString(new Date());
}
