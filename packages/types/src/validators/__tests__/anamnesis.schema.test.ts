/**
 * @file Anamnesis Validators Tests
 * @description Unit tests for anamnesis Zod schemas and business validators
 */

import { describe, it, expect } from 'vitest';
import {
  AnamnesisSnakeSchema,
  AnamnesisInsertSnakeSchema,
  AnamnesisUpdateSnakeSchema,
  AnamnesisSectionDataSchema,
  PersonalDataSectionSchema,
  EmergencyContactSectionSchema,
  MedicalHistoryItemSchema,
  LifestyleSectionSchema,
  parseAnamnesisForUI,
  safeParseAnamnesisForUI,
  parseAnamnesesForUI,
  isAnamnesisComplete,
  canPatientEditAnamnesis,
  requiresDoctorReview,
  isApprovedByDoctor,
  hasAcceptedTerms,
  getNextPendingSection,
  getSectionWeight,
  validateSectionData,
} from '../anamnesis.schema';
import type { Anamnesis, AnamnesisSection } from '../../patient/anamnesis.types';

// ================================================================
// MOCK DATA
// ================================================================

const mockAnamnesisDB = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  patient_id: '223e4567-e89b-12d3-a456-426614174000',
  status: 'in_progress' as const,
  completion_percentage: 50,
  last_updated_section: 'personal_data' as AnamnesisSection,
  sections_status: {
    personal_data: 'completed' as const,
    emergency_contacts: 'in_progress' as const,
  },
  approved_by_doctor_id: null,
  approved_at: null,
  locked: false,
  privacy_accepted: true,
  terms_accepted: true,
  data_export_requested: false,
  created_at: '2025-10-08T10:00:00Z',
  updated_at: '2025-10-08T11:00:00Z',
  deleted_at: null,
};

const mockCompletedAnamnesis: Anamnesis = {
  ...mockAnamnesisDB,
  status: 'completed',
  completion_percentage: 100,
};

const mockApprovedAnamnesis: Anamnesis = {
  ...mockAnamnesisDB,
  status: 'approved',
  completion_percentage: 100,
  approved_by_doctor_id: '323e4567-e89b-12d3-a456-426614174000',
  approved_at: '2025-10-08T12:00:00Z',
  locked: true,
};

const mockPersonalDataSection = {
  full_name: 'Juan Pérez',
  date_of_birth: '1985-05-15T00:00:00Z',
  gender: 'male' as const,
  blood_type: 'O+',
  dni: '12345678',
  phone: '+5491112345678',
  email: 'juan.perez@example.com',
  address: {
    street: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    province: 'CABA',
    zip_code: '1043',
    country: 'Argentina',
  },
  occupation: 'Ingeniero',
  marital_status: 'married',
};

const mockEmergencyContact = {
  name: 'María Pérez',
  relationship: 'Esposa',
  phone: '+5491198765432',
  alternative_phone: '+541145678901',
  email: 'maria.perez@example.com',
};

const mockLifestyleSection = {
  smoking_status: 'never' as const,
  alcohol_consumption: 'occasional' as const,
  recreational_drugs: false,
  exercise_frequency: 'moderate' as const,
  sleep_quality: 'good' as const,
  stress_level: 3 as const,
};

// ================================================================
// SCHEMA VALIDATION TESTS
// ================================================================

describe('AnamnesisSnakeSchema', () => {
  it('should validate a complete anamnesis object', () => {
    const result = AnamnesisSnakeSchema.safeParse(mockAnamnesisDB);
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const invalid = { ...mockAnamnesisDB, status: 'invalid_status' };
    const result = AnamnesisSnakeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject completion_percentage > 100', () => {
    const invalid = { ...mockAnamnesisDB, completion_percentage: 150 };
    const result = AnamnesisSnakeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject completion_percentage < 0', () => {
    const invalid = { ...mockAnamnesisDB, completion_percentage: -10 };
    const result = AnamnesisSnakeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept null for nullable fields', () => {
    const withNulls = {
      ...mockAnamnesisDB,
      approved_by_doctor_id: null,
      approved_at: null,
      last_updated_section: null,
      deleted_at: null,
    };
    const result = AnamnesisSnakeSchema.safeParse(withNulls);
    expect(result.success).toBe(true);
  });
});

describe('AnamnesisInsertSnakeSchema', () => {
  it('should validate minimal insert data', () => {
    const minimal = {
      patient_id: '223e4567-e89b-12d3-a456-426614174000',
    };
    const result = AnamnesisInsertSnakeSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('should apply default values', () => {
    const minimal = {
      patient_id: '223e4567-e89b-12d3-a456-426614174000',
    };
    const result = AnamnesisInsertSnakeSchema.parse(minimal);
    expect(result.status).toBe('not_started');
    expect(result.completion_percentage).toBe(0);
    expect(result.privacy_accepted).toBe(false);
    expect(result.terms_accepted).toBe(false);
  });

  it('should allow override of defaults', () => {
    const custom = {
      patient_id: '223e4567-e89b-12d3-a456-426614174000',
      status: 'in_progress' as const,
      completion_percentage: 25,
      privacy_accepted: true,
    };
    const result = AnamnesisInsertSnakeSchema.parse(custom);
    expect(result.status).toBe('in_progress');
    expect(result.completion_percentage).toBe(25);
    expect(result.privacy_accepted).toBe(true);
  });
});

describe('AnamnesisUpdateSnakeSchema', () => {
  it('should validate partial update', () => {
    const update = {
      completion_percentage: 75,
      status: 'completed' as const,
    };
    const result = AnamnesisUpdateSnakeSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it('should allow all fields to be optional', () => {
    const emptyUpdate = {};
    const result = AnamnesisUpdateSnakeSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid values', () => {
    const invalidUpdate = {
      completion_percentage: 200, // Invalid
    };
    const result = AnamnesisUpdateSnakeSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

// ================================================================
// SECTION SCHEMA TESTS
// ================================================================

describe('PersonalDataSectionSchema', () => {
  it('should validate complete personal data', () => {
    const result = PersonalDataSectionSchema.safeParse(mockPersonalDataSection);
    expect(result.success).toBe(true);
  });

  it('should require mandatory fields', () => {
    const incomplete = {
      full_name: 'Juan Pérez',
      // Missing required fields
    };
    const result = PersonalDataSectionSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('should validate email format', () => {
    const invalidEmail = {
      ...mockPersonalDataSection,
      email: 'not-an-email',
    };
    const result = PersonalDataSectionSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });

  it('should validate gender enum', () => {
    const invalidGender = {
      ...mockPersonalDataSection,
      gender: 'invalid_gender',
    };
    const result = PersonalDataSectionSchema.safeParse(invalidGender);
    expect(result.success).toBe(false);
  });
});

describe('EmergencyContactSectionSchema', () => {
  it('should validate emergency contact', () => {
    const result = EmergencyContactSectionSchema.safeParse(mockEmergencyContact);
    expect(result.success).toBe(true);
  });

  it('should allow optional email', () => {
    const withoutEmail = {
      name: 'María Pérez',
      relationship: 'Esposa',
      phone: '+5491198765432',
    };
    const result = EmergencyContactSectionSchema.safeParse(withoutEmail);
    expect(result.success).toBe(true);
  });

  it('should validate email format when provided', () => {
    const invalidEmail = {
      ...mockEmergencyContact,
      email: 'invalid-email',
    };
    const result = EmergencyContactSectionSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });
});

describe('LifestyleSectionSchema', () => {
  it('should validate lifestyle data', () => {
    const result = LifestyleSectionSchema.safeParse(mockLifestyleSection);
    expect(result.success).toBe(true);
  });

  it('should validate stress_level range 1-5', () => {
    const invalidStress = {
      ...mockLifestyleSection,
      stress_level: 6,
    };
    const result = LifestyleSectionSchema.safeParse(invalidStress);
    expect(result.success).toBe(false);
  });

  it('should validate enum values', () => {
    const invalidSmoking = {
      ...mockLifestyleSection,
      smoking_status: 'invalid',
    };
    const result = LifestyleSectionSchema.safeParse(invalidSmoking);
    expect(result.success).toBe(false);
  });

  it('should allow optional sleep hours', () => {
    const withSleep = {
      ...mockLifestyleSection,
      sleep_hours_per_night: 7.5,
    };
    const result = LifestyleSectionSchema.safeParse(withSleep);
    expect(result.success).toBe(true);
  });
});

// ================================================================
// PARSER FUNCTION TESTS
// ================================================================

describe('parseAnamnesisForUI', () => {
  it('should parse valid anamnesis data', () => {
    const result = parseAnamnesisForUI(mockAnamnesisDB as any);
    expect(result).toBeDefined();
    expect(result.id).toBe(mockAnamnesisDB.id);
    expect(result.patient_id).toBe(mockAnamnesisDB.patient_id);
  });

  it('should throw on invalid data', () => {
    const invalid = { ...mockAnamnesisDB, status: 'invalid' };
    expect(() => parseAnamnesisForUI(invalid as any)).toThrow();
  });
});

describe('safeParseAnamnesisForUI', () => {
  it('should return success for valid data', () => {
    const result = safeParseAnamnesisForUI(mockAnamnesisDB);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(mockAnamnesisDB.id);
    }
  });

  it('should return error for invalid data', () => {
    const invalid = { ...mockAnamnesisDB, completion_percentage: 200 };
    const result = safeParseAnamnesisForUI(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('parseAnamnesesForUI', () => {
  it('should parse array of anamnesis records', () => {
    const array = [mockAnamnesisDB, mockAnamnesisDB] as any[];
    const result = parseAnamnesesForUI(array);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(mockAnamnesisDB.id);
  });

  it('should handle empty array', () => {
    const result = parseAnamnesesForUI([]);
    expect(result).toEqual([]);
  });
});

// ================================================================
// BUSINESS LOGIC VALIDATORS
// ================================================================

describe('isAnamnesisComplete', () => {
  it('should return true for completed anamnesis', () => {
    expect(isAnamnesisComplete(mockCompletedAnamnesis)).toBe(true);
  });

  it('should return false for in-progress anamnesis', () => {
    const inProgress = { ...mockAnamnesisDB } as Anamnesis;
    expect(isAnamnesisComplete(inProgress)).toBe(false);
  });

  it('should return false if 100% but status not completed', () => {
    const almostComplete = {
      ...mockAnamnesisDB,
      completion_percentage: 100,
      status: 'in_progress',
    } as Anamnesis;
    expect(isAnamnesisComplete(almostComplete)).toBe(false);
  });
});

describe('canPatientEditAnamnesis', () => {
  it('should allow editing in-progress anamnesis', () => {
    const inProgress = { ...mockAnamnesisDB } as Anamnesis;
    expect(canPatientEditAnamnesis(inProgress)).toBe(true);
  });

  it('should not allow editing locked anamnesis', () => {
    const locked = { ...mockAnamnesisDB, locked: true } as Anamnesis;
    expect(canPatientEditAnamnesis(locked)).toBe(false);
  });

  it('should not allow editing approved anamnesis', () => {
    expect(canPatientEditAnamnesis(mockApprovedAnamnesis)).toBe(false);
  });
});

describe('requiresDoctorReview', () => {
  it('should require review when completed but not approved', () => {
    const needsReview = {
      ...mockCompletedAnamnesis,
      approved_by_doctor_id: null,
    } as Anamnesis;
    expect(requiresDoctorReview(needsReview)).toBe(true);
  });

  it('should not require review when not completed', () => {
    const inProgress = { ...mockAnamnesisDB } as Anamnesis;
    expect(requiresDoctorReview(inProgress)).toBe(false);
  });

  it('should not require review when already approved', () => {
    expect(requiresDoctorReview(mockApprovedAnamnesis)).toBe(false);
  });
});

describe('isApprovedByDoctor', () => {
  it('should return true for approved anamnesis', () => {
    expect(isApprovedByDoctor(mockApprovedAnamnesis)).toBe(true);
  });

  it('should return false for unapproved anamnesis', () => {
    const unapproved = { ...mockAnamnesisDB } as Anamnesis;
    expect(isApprovedByDoctor(unapproved)).toBe(false);
  });

  it('should return false if approved_by_doctor_id is null', () => {
    const noDoctor = {
      ...mockAnamnesisDB,
      status: 'approved',
      approved_by_doctor_id: null,
    } as Anamnesis;
    expect(isApprovedByDoctor(noDoctor)).toBe(false);
  });
});

describe('hasAcceptedTerms', () => {
  it('should return true when both terms accepted', () => {
    const accepted = {
      ...mockAnamnesisDB,
      privacy_accepted: true,
      terms_accepted: true,
    } as Anamnesis;
    expect(hasAcceptedTerms(accepted)).toBe(true);
  });

  it('should return false if privacy not accepted', () => {
    const noPrivacy = {
      ...mockAnamnesisDB,
      privacy_accepted: false,
      terms_accepted: true,
    } as Anamnesis;
    expect(hasAcceptedTerms(noPrivacy)).toBe(false);
  });

  it('should return false if terms not accepted', () => {
    const noTerms = {
      ...mockAnamnesisDB,
      privacy_accepted: true,
      terms_accepted: false,
    } as Anamnesis;
    expect(hasAcceptedTerms(noTerms)).toBe(false);
  });
});

describe('getNextPendingSection', () => {
  it('should return first incomplete section', () => {
    const anamnesis = {
      ...mockAnamnesisDB,
      sections_status: {
        personal_data: 'completed',
        emergency_contacts: 'pending',
      },
    } as any;
    const next = getNextPendingSection(anamnesis);
    expect(next).toBe('emergency_contacts');
  });

  it('should return null if all sections completed', () => {
    const allCompleted = {
      ...mockAnamnesisDB,
      sections_status: {
        personal_data: 'completed',
        emergency_contacts: 'completed',
        medical_history: 'completed',
        family_history: 'completed',
        allergies: 'completed',
        current_medications: 'completed',
        chronic_conditions: 'completed',
        surgical_history: 'completed',
        hospitalizations: 'completed',
        gynecological_history: 'completed',
        lifestyle: 'completed',
        mental_health: 'completed',
        consent: 'completed',
      },
    } as any;
    const next = getNextPendingSection(allCompleted);
    expect(next).toBeNull();
  });
});

describe('getSectionWeight', () => {
  it('should return correct weights for sections', () => {
    expect(getSectionWeight('personal_data')).toBe(15);
    expect(getSectionWeight('emergency_contacts')).toBe(10);
    expect(getSectionWeight('medical_history')).toBe(12);
    expect(getSectionWeight('consent')).toBe(5);
  });

  it('should return default weight for unknown sections', () => {
    expect(getSectionWeight('unknown_section' as any)).toBe(5);
  });
});

describe('validateSectionData', () => {
  it('should validate personal_data section', () => {
    const result = validateSectionData('personal_data', mockPersonalDataSection);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should validate emergency_contacts as array', () => {
    const result = validateSectionData('emergency_contacts', [mockEmergencyContact]);
    expect(result.valid).toBe(true);
  });

  it('should return errors for invalid data', () => {
    const invalidPersonalData = {
      full_name: 'Juan',
      email: 'not-an-email', // Invalid
    };
    const result = validateSectionData('personal_data', invalidPersonalData);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should validate lifestyle section', () => {
    const result = validateSectionData('lifestyle', mockLifestyleSection);
    expect(result.valid).toBe(true);
  });
});
