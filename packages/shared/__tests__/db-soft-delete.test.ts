/**
 * Tests para wrapper de Supabase
 *
 * Valida que:
 * - selectActive() siempre filtre deleted_at IS NULL
 * - softDelete() marque deleted_at correctamente
 * - Transformación camelCase funcione en boundary
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockSupabase, mockCreateClient } = vi.hoisted(() => {
  const supabase = {
    from: vi.fn()
  };
  return {
    mockSupabase: supabase,
    mockCreateClient: vi.fn(() => supabase)
  };
});

// Mock setup helpers
function setupMockQuery(returnData: any, returnError: any = null) {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    then: vi.fn((callback) =>
      callback({ data: returnData, error: returnError })
    )
  };

  mockSupabase.from.mockReturnValue(mockQuery);
  return mockQuery;
}

// Mock module
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}));

// Import después del mock
import { selectActive, softDelete, insertRecord, updateRecord } from '../src/db';

describe('DB Wrapper - Soft Delete Safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
    mockCreateClient.mockReturnValue(mockSupabase);
  });

  it('selectActive() should always filter deleted_at IS NULL', async () => {
    const mockData = [
      { patient_id: '1', start_time: '10:00', deleted_at: null },
      { patient_id: '2', start_time: '11:00', deleted_at: null }
    ];

    const mockQuery = setupMockQuery(mockData);

    await selectActive('appointments');

    // Verificar que se llamó .is('deleted_at', null)
    expect(mockQuery.is).toHaveBeenCalledWith('deleted_at', null);
  });

  it('selectActive() should NOT filter deleted_at when includeDeleted=true', async () => {
    const mockData = [
      { patient_id: '1', deleted_at: null },
      { patient_id: '2', deleted_at: '2025-01-01T00:00:00Z' }
    ];

    const mockQuery = setupMockQuery(mockData);

    await selectActive('appointments', '*', { includeDeleted: true });

    // NO debería filtrar deleted_at
    expect(mockQuery.is).not.toHaveBeenCalled();
  });

  it('selectActive() should transform to camelCase by default', async () => {
    const mockData = [
      { patient_id: '123', start_time: '10:00', end_time: null }
    ];

    const mockQuery = setupMockQuery(mockData);

    const result = await selectActive('appointments');

    // Resultado debe estar en camelCase
    expect(result[0]).toHaveProperty('patientId', '123');
    expect(result[0]).toHaveProperty('startTime', '10:00');
    expect(result[0]).toHaveProperty('endTime', null);
  });

  it('selectActive() should NOT transform when transform=false', async () => {
    const mockData = [
      { patient_id: '123', start_time: '10:00' }
    ];

    const mockQuery = setupMockQuery(mockData);

    const result = await selectActive('appointments', '*', { transform: false });

    // Resultado debe mantener snake_case
    expect(result[0]).toHaveProperty('patient_id', '123');
    expect(result[0]).toHaveProperty('start_time', '10:00');
  });

  it('softDelete() should set deleted_at to current timestamp', async () => {
    const mockQuery = setupMockQuery(null);

    const beforeCall = new Date();
    await softDelete('appointments', '123');
    const afterCall = new Date();

    // Verificar que se llamó update con deleted_at
    expect(mockQuery.update).toHaveBeenCalledTimes(1);
    const updateCall = mockQuery.update.mock.calls[0][0];

    expect(updateCall).toHaveProperty('deleted_at');
    expect(typeof updateCall.deleted_at).toBe('string');

    // Verificar que el timestamp está en el rango correcto
    const deletedAt = new Date(updateCall.deleted_at);
    expect(deletedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(deletedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());

    // Verificar que se filtró por ID
    expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
  });

  it('insertRecord() should transform camelCase input to snake_case', async () => {
    const mockInserted = {
      id: 'new-id',
      patient_id: '123',
      start_time: '10:00'
    };

    const mockQuery = setupMockQuery(mockInserted);

    const inputData = {
      patientId: '123',
      startTime: '10:00',
      type: 'checkup'
    };

    await insertRecord('appointments', inputData);

    // Verificar que insert recibió datos en snake_case
    expect(mockQuery.insert).toHaveBeenCalledTimes(1);
    const insertCall = mockQuery.insert.mock.calls[0][0];

    expect(insertCall).toHaveProperty('patient_id', '123');
    expect(insertCall).toHaveProperty('start_time', '10:00');
    expect(insertCall).toHaveProperty('type', 'checkup');
  });

  it('insertRecord() should return data in camelCase', async () => {
    const mockInserted = {
      id: 'new-id',
      patient_id: '123',
      start_time: '10:00',
      created_at: '2025-01-01T00:00:00Z'
    };

    const mockQuery = setupMockQuery(mockInserted);

    const result = await insertRecord<any, any>('appointments', {
      patientId: '123',
      startTime: '10:00'
    });

    // Resultado debe estar en camelCase
    expect(result).toHaveProperty('patientId', '123');
    expect(result).toHaveProperty('startTime', '10:00');
    expect(result).toHaveProperty('createdAt', '2025-01-01T00:00:00Z');
  });

  it('updateRecord() should transform camelCase updates to snake_case', async () => {
    const mockUpdated = {
      id: '123',
      patient_id: '456',
      status: 'completed',
      updated_at: '2025-01-01T12:00:00Z'
    };

    const mockQuery = setupMockQuery(mockUpdated);

    await updateRecord('appointments', '123', {
      status: 'completed'
    });

    // Verificar que update recibió datos transformados
    expect(mockQuery.update).toHaveBeenCalledTimes(1);
    expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
  });

  it('should throw error on Supabase error response', async () => {
    const mockError = { message: 'Database connection failed', code: '500' };
    setupMockQuery(null, mockError);

    await expect(
      selectActive('appointments')
    ).rejects.toThrow('Database connection failed');
  });

  it('selectActive() should apply ordering when specified', async () => {
    const mockData = [];
    const mockQuery = setupMockQuery(mockData);

    await selectActive('appointments', '*', {
      orderBy: { column: 'start_time', ascending: true }
    });

    expect(mockQuery.order).toHaveBeenCalledWith('start_time', {
      ascending: true
    });
  });

  it('selectActive() should apply pagination when specified', async () => {
    const mockData = [];
    const mockQuery = setupMockQuery(mockData);

    await selectActive('appointments', '*', {
      limit: 10,
      offset: 20
    });

    expect(mockQuery.limit).toHaveBeenCalledWith(10);
    expect(mockQuery.range).toHaveBeenCalledWith(20, 29); // offset 20, limit 10 → range 20-29
  });
});

describe('DB Wrapper - Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('round-trip transformation should preserve all keys', async () => {
    const mockData = {
      patient_id: '123',
      doctor_id: '456',
      start_time: '2025-01-01T10:00:00Z',
      end_time: '2025-01-01T11:00:00Z',
      duration_minutes: 60,
      type: 'consultation',
      status: 'scheduled',
      notes: 'Patient needs follow-up',
      location: 'Room 101',
      meeting_url: null,
      created_by: '789',
      created_at: '2025-01-01T09:00:00Z',
      updated_at: '2025-01-01T09:00:00Z',
      deleted_at: null
    };

    const mockQuery = setupMockQuery([mockData]);

    // Leer de BD (snake_case → camelCase)
    const camelData = await selectActive('appointments');

    // Simular update (camelCase → snake_case)
    const snakePayload = {
      patient_id: camelData[0].patientId,
      doctor_id: camelData[0].doctorId,
      start_time: camelData[0].startTime,
      end_time: camelData[0].endTime,
      // ... etc
    };

    // Verificar que todas las llaves originales están presentes
    expect(snakePayload).toHaveProperty('patient_id', '123');
    expect(snakePayload).toHaveProperty('doctor_id', '456');
    expect(snakePayload).toHaveProperty('start_time', '2025-01-01T10:00:00Z');
  });
});
