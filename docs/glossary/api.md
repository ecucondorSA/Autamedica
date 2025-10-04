# Glosario API - Contratos de Respuestas

## 🎯 Propósito

Tipos y utilidades para respuestas de API, manejo de errores y estados asíncronos.

---

## Respuestas API

### Tipos Base

```typescript
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    timestamp: ISODateString;
    requestId?: string;
    version?: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: APIError;
  meta?: {
    timestamp: ISODateString;
    requestId?: string;
    version?: string;
  };
}

export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;
```

### Factory Functions

```typescript
// Factory functions para construir respuestas API
export const ok: <T>(data: T) => APISuccess<T>;
export const fail: (error: APIError) => APIFailure;
export const failWithCode: (code: string, message: string) => APIFailure;

// Type guards para respuestas API
export const isApiSuccess: <T>(response: APIResponse<T>) => response is APISuccess<T>;
export const isApiError: <T>(response: APIResponse<T>) => response is APIFailure;

// Utilidades para manejo de respuestas
export const unwrapApiResponse: <T>(response: APIResponse<T>) => T;
export const mapApiResponse: <T, U>(response: APIResponse<T>, mapper: (data: T) => U) => APIResponse<U>;

// Factories específicos para contexto médico
export const medicalOk: <T>(data: T, metadata?: MedicalMetadata) => MedicalAPISuccess<T>;
export const medicalFail: (error: MedicalAPIError) => MedicalAPIFailure;
```

---

**Última actualización**: 2025-10-04
**Mantenido por**: Sistema de validación automática
