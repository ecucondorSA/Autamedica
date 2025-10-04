# Glosario Core - Contratos Base

## 🎯 Propósito

Tipos fundamentales y utilidades base usadas en toda la plataforma Autamedica.

---

## Identificadores Únicos

```typescript
export type UUID = string & { readonly brand: "UUID" };
export type PatientId = UUID & { readonly brand: "PatientId" };
export type DoctorId = UUID & { readonly brand: "DoctorId" };
export type AppointmentId = UUID & { readonly brand: "AppointmentId" };
export type FacilityId = UUID & { readonly brand: "FacilityId" };
export type SpecialtyId = UUID & { readonly brand: "SpecialtyId" };
```

---

## Escalares

```typescript
export type ISODateString = string & { readonly brand: "ISODateString" };
```

---

## Utilidades de Fechas ISO

```typescript
// Validators de fechas ISO
export const isISODateString: (value: string) => value is ISODateString;
export const toISODateString: (date: Date) => ISODateString;
export const nowAsISODateString: () => ISODateString;
```

---

## Sistema de Generación de IDs

```typescript
// Factory para crear IDs únicos
export const createId: () => UUID;
export const generateUUID: () => UUID;

// Configuración de validación
export interface ID_VALIDATION_CONFIG {
  readonly minLength: number;
  readonly maxLength: number;
  readonly allowedPrefixes: readonly string[];
}

// Validadores y factories con contexto
export const validateIdForScope: (id: string, scope: string) => boolean;
export const createValidatedId: (scope: string) => UUID;

// Generadores con prefijo
export const generatePrefixedId: (prefix: string) => UUID;
export const generatePatientId: () => PatientId;
export const generateDoctorId: () => DoctorId;
export const generateAppointmentId: () => AppointmentId;
```

---

## Estado de Entidades

```typescript
// Utilidades para manejo de estado soft-delete
export const isEntityDeleted: (entity: { deletedAt?: ISODateString | null }) => boolean;
export const isEntityActive: (entity: { deletedAt?: ISODateString | null }) => boolean;
export const markEntityAsDeleted: <T extends { deletedAt?: ISODateString | null }>(entity: T) => T & { deletedAt: ISODateString };
```

---

## Sistema de Geografía y Direcciones

```typescript
// Validators geográficos
export const isCountryCode: (value: string) => boolean;
export const isArgentinaStateCode: (value: string) => boolean;
export const isValidCoordinates: (lat: number, lng: number) => boolean;
export const isArgentinaZipCode: (value: string) => boolean;

// Constructores de direcciones
export const createBasicAddress: (street: string, city: string, state: string, country: string) => Address;
export const createMedicalAddress: (address: Address, facilityType: string) => MedicalAddress;

// Converters geográficos
export const toCountryCode: (countryName: string) => string;
export const toArgentinaStateCode: (stateName: string) => string;
export const toArgentinaZipCode: (zipCode: string) => string;

// Utilidades de direcciones
export const migrateToAddress: (oldAddress: LegacyAddress) => Address;
export const isCompleteAddress: (address: Partial<Address>) => address is Address;
export const formatAddressString: (address: Address) => string;
```

---

## Sistema de Teléfonos

```typescript
// Configuración de validación telefónica
export interface PHONE_VALIDATION_CONFIG {
  readonly countryCode: string;
  readonly minLength: number;
  readonly maxLength: number;
  readonly patterns: readonly RegExp[];
}

// Validators telefónicos
export const isPhoneE164: (phone: string) => boolean;
export const isValidPhoneForCountry: (phone: string, countryCode: string) => boolean;
export const isArgentinaPhone: (phone: string) => boolean;
export const isArgentinaMobile: (phone: string) => boolean;

// Formatters telefónicos
export const normalizePhoneNumber: (phone: string) => string;
export const toE164Format: (phone: string, countryCode: string) => string;
export const toNationalFormat: (phoneE164: string) => string;
export const formatPhoneForDisplay: (phone: string) => string;

// Utilidades telefónicas
export const extractCountryCode: (phoneE164: string) => string;
export const getPhoneExamples: (countryCode: string) => string[];
export const validatePhoneList: (phones: string[]) => ValidationResult[];
```

---

## Type Guards y Utilidades de Validación

```typescript
// Type guards básicos
export const isNonEmptyString: (value: string) => value is NonEmptyString;
export const isNonEmptyArray: <T>(arr: T[]) => arr is NonEmptyArray<T>;
export const isNonNullable: <T>(value: T | null | undefined) => value is T;
export const isNonEmptyObject: (obj: object) => obj is NonEmptyObject;
export const isPositiveNumber: (num: number) => num is PositiveNumber;
export const isPercentage: (num: number) => num is Percentage;
```

---

## Sistema de Estados Async/Loadable

```typescript
// Constructores de estados
export const idle: <T>() => Loadable<T>;
export const loading: <T>() => Loadable<T>;
export const success: <T>(data: T) => Loadable<T>;
export const failure: <T>(error: Error) => Loadable<T>;
export const unauthenticated: <T>() => AuthenticatedLoadable<T>;

// Pattern matching para estados
export const matchDataLoadingState: <T, R>(
  state: DataLoadingState<T>,
  patterns: DataLoadingStatePatterns<T, R>
) => R;

export const matchLoadable: <T, R>(
  loadable: Loadable<T>,
  patterns: LoadablePatterns<T, R>
) => R;

export const matchAsyncState: <T, R>(
  state: AsyncState<T>,
  patterns: AsyncStatePatterns<T, R>
) => R;

export const matchAuthenticatedLoadable: <T, R>(
  loadable: AuthenticatedLoadable<T>,
  patterns: AuthenticatedLoadablePatterns<T, R>
) => R;

// Type guards para estados
export const isIdle: <T>(loadable: Loadable<T>) => boolean;
export const isLoading: <T>(loadable: Loadable<T>) => boolean;
export const isSuccess: <T>(loadable: Loadable<T>) => boolean;
export const isFailure: <T>(loadable: Loadable<T>) => boolean;
```

---

**Última actualización**: 2025-10-04
**Mantenido por**: Sistema de validación automática
