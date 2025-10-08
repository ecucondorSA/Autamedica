/**
 * Tests para transformaciones de naming convention
 *
 * Valida que toCamel() y toSnake() funcionen correctamente
 * con objetos, arrays, nested structures y preserven primitivos
 */

import { describe, it, expect } from 'vitest';
import { toCamel, toSnake } from '../src/casing';

describe('Boundary Transformation - toCamel()', () => {
  it('should convert snake_case keys to camelCase', () => {
    const input = {
      patient_id: '123',
      start_time: '2025-01-01T10:00:00Z',
      end_time: null
    };

    const result = toCamel<{
      patientId: string;
      startTime: string;
      endTime: null;
    }>(input);

    expect(result).toEqual({
      patientId: '123',
      startTime: '2025-01-01T10:00:00Z',
      endTime: null
    });
  });

  it('should handle nested objects recursively', () => {
    const input = {
      patient_id: '123',
      emergency_contact: {
        contact_name: 'Jane Doe',
        contact_phone: '+54911123456'
      }
    };

    const result = toCamel(input);

    expect(result).toEqual({
      patientId: '123',
      emergencyContact: {
        contactName: 'Jane Doe',
        contactPhone: '+54911123456'
      }
    });
  });

  it('should handle arrays of objects', () => {
    const input = [
      { patient_id: '1', start_time: '10:00' },
      { patient_id: '2', start_time: '11:00' }
    ];

    const result = toCamel(input);

    expect(result).toEqual([
      { patientId: '1', startTime: '10:00' },
      { patientId: '2', startTime: '11:00' }
    ]);
  });

  it('should preserve Date objects', () => {
    const date = new Date('2025-01-01');
    const input = {
      created_at: date
    };

    const result = toCamel(input);

    expect(result).toEqual({
      createdAt: date
    });
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should preserve primitives', () => {
    expect(toCamel('hello')).toBe('hello');
    expect(toCamel(123)).toBe(123);
    expect(toCamel(true)).toBe(true);
    expect(toCamel(null)).toBe(null);
    expect(toCamel(undefined)).toBe(undefined);
  });

  it('should handle deeply nested structures', () => {
    const input = {
      patient_id: '123',
      medical_records: [
        {
          record_id: 'r1',
          doctor_info: {
            doctor_name: 'Dr. Smith',
            specialty_name: 'Cardiology'
          }
        }
      ]
    };

    const result = toCamel(input);

    expect(result).toEqual({
      patientId: '123',
      medicalRecords: [
        {
          recordId: 'r1',
          doctorInfo: {
            doctorName: 'Dr. Smith',
            specialtyName: 'Cardiology'
          }
        }
      ]
    });
  });
});

describe('Boundary Transformation - toSnake()', () => {
  it('should convert camelCase keys to snake_case', () => {
    const input = {
      patientId: '123',
      startTime: '2025-01-01T10:00:00Z',
      endTime: null
    };

    const result = toSnake<{
      patient_id: string;
      start_time: string;
      end_time: null;
    }>(input);

    expect(result).toEqual({
      patient_id: '123',
      start_time: '2025-01-01T10:00:00Z',
      end_time: null
    });
  });

  it('should handle nested objects recursively', () => {
    const input = {
      patientId: '123',
      emergencyContact: {
        contactName: 'Jane Doe',
        contactPhone: '+54911123456'
      }
    };

    const result = toSnake(input);

    expect(result).toEqual({
      patient_id: '123',
      emergency_contact: {
        contact_name: 'Jane Doe',
        contact_phone: '+54911123456'
      }
    });
  });

  it('should handle arrays of objects', () => {
    const input = [
      { patientId: '1', startTime: '10:00' },
      { patientId: '2', startTime: '11:00' }
    ];

    const result = toSnake(input);

    expect(result).toEqual([
      { patient_id: '1', start_time: '10:00' },
      { patient_id: '2', start_time: '11:00' }
    ]);
  });

  it('should preserve Date objects', () => {
    const date = new Date('2025-01-01');
    const input = {
      createdAt: date
    };

    const result = toSnake(input);

    expect(result).toEqual({
      created_at: date
    });
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should preserve primitives', () => {
    expect(toSnake('hello')).toBe('hello');
    expect(toSnake(123)).toBe(123);
    expect(toSnake(true)).toBe(true);
    expect(toSnake(null)).toBe(null);
    expect(toSnake(undefined)).toBe(undefined);
  });
});

describe('Boundary Transformation - Round-trip', () => {
  it('should preserve structure in snake → camel → snake round-trip', () => {
    const original = {
      patient_id: '123',
      start_time: '2025-01-01T10:00:00Z',
      emergency_contact: {
        contact_name: 'Jane',
        contact_phone: '+549111234567'
      },
      medical_records: [
        { record_id: 'r1', record_type: 'lab_result' }
      ]
    };

    const camelized = toCamel(original);
    const backToSnake = toSnake(camelized);

    // Verificar que las llaves originales se preserven
    expect(backToSnake).toEqual(original);
    expect(Object.keys(backToSnake)).toEqual(Object.keys(original));
  });

  it('should preserve structure in camel → snake → camel round-trip', () => {
    const original = {
      patientId: '123',
      startTime: '2025-01-01T10:00:00Z',
      emergencyContact: {
        contactName: 'Jane',
        contactPhone: '+549111234567'
      },
      medicalRecords: [
        { recordId: 'r1', recordType: 'labResult' }
      ]
    };

    const snakified = toSnake(original);
    const backToCamel = toCamel(snakified);

    // Verificar que las llaves originales se preserven
    expect(backToCamel).toEqual(original);
    expect(Object.keys(backToCamel)).toEqual(Object.keys(original));
  });

  it('should handle empty objects and arrays', () => {
    expect(toCamel({})).toEqual({});
    expect(toSnake({})).toEqual({});
    expect(toCamel([])).toEqual([]);
    expect(toSnake([])).toEqual([]);
  });

  it('should handle objects with null/undefined values', () => {
    const input = {
      patient_id: '123',
      end_time: null,
      notes: undefined
    };

    const result = toCamel(input);

    expect(result).toEqual({
      patientId: '123',
      endTime: null,
      notes: undefined
    });
  });
});
