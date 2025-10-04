import { z } from 'zod';
import type { CamelCased } from '@autamedica/shared';
import { camelToSnake } from '../mappers/camelToSnake';
import { snakeToCamel } from '../mappers/snakeToCamel';

const GenderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
const BloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

const EmergencyContactSchema = z
  .object({
    name: z.string().trim().min(1).optional().nullable(),
    relationship: z.string().trim().min(1).optional().nullable(),
    phone: z.string().trim().min(6).optional().nullable(),
    email: z.string().trim().email().optional().nullable(),
  })
  .partial()
  .nullable();

export const PatientSnakeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  dni: z.string().nullable(),
  birth_date: z.string().nullable(),
  gender: GenderEnum.nullable(),
  blood_type: BloodTypeEnum.nullable().optional(),
  height_cm: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  emergency_contact: EmergencyContactSchema,
  medical_history: z.unknown().nullable().optional(),
  allergies: z.unknown().nullable().optional(),
  medications: z.unknown().nullable().optional(),
  insurance_info: z.unknown().nullable().optional(),
  company_id: z.string().uuid().nullable().optional(),
  active: z.boolean().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
});

export type PatientSnake = z.infer<typeof PatientSnakeSchema>;
export type Patient = CamelCased<PatientSnake>;

export function parsePatient(raw: unknown): Patient {
  const result = PatientSnakeSchema.parse(raw);
  return snakeToCamel<Patient>(result);
}

export function safeParsePatient(raw: unknown): Patient | null {
  const result = PatientSnakeSchema.safeParse(raw);
  if (!result.success) {
    return null;
  }

  return snakeToCamel<Patient>(result.data);
}

export const PatientProfileUpdateSchema = z.object({
  birthDate: z
    .string()
    .regex(/^(\d{4})-(\d{2})-(\d{2})$/, 'Formato esperado YYYY-MM-DD')
    .nullable()
    .optional(),
  gender: GenderEnum.nullable().optional(),
  bloodType: BloodTypeEnum.nullable().optional(),
  heightCm: z
    .number()
    .int()
    .positive('La altura debe ser positiva')
    .nullable()
    .optional(),
  weightKg: z
    .number()
    .positive('El peso debe ser positivo')
    .nullable()
    .optional(),
  emergencyContact: EmergencyContactSchema.optional(),
});

export type PatientProfileUpdateInput = z.infer<typeof PatientProfileUpdateSchema>;

export function buildPatientUpdatePayload(input: PatientProfileUpdateInput) {
  const validated = PatientProfileUpdateSchema.parse(input);
  const payload = Object.fromEntries(
    Object.entries(validated).filter(([, value]) => value !== undefined),
  );

  return camelToSnake<Partial<PatientSnake>>(payload);
}
