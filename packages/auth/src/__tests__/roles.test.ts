import { describe, it, expect } from 'vitest';
import {
  ROLES,
  PORTALS,
  ROLE_TO_PORTAL,
  PORTAL_TO_ROLE,
  ALL_ROLES,
  type UserRole,
  type Portal,
} from '../roles';

describe('Role System', () => {
  describe('ROLES constants', () => {
    it('should have correct role values', () => {
      expect(ROLES.PATIENT).toBe('patient');
      expect(ROLES.DOCTOR).toBe('doctor');
      expect(ROLES.COMPANY).toBe('company');
      expect(ROLES.COMPANY_ADMIN).toBe('company_admin');
      expect(ROLES.ORGANIZATION_ADMIN).toBe('organization_admin');
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.PLATFORM_ADMIN).toBe('platform_admin');
    });
  });

  describe('PORTALS constants', () => {
    it('should have correct portal values', () => {
      expect(PORTALS.PATIENTS).toBe('patients');
      expect(PORTALS.DOCTORS).toBe('doctors');
      expect(PORTALS.COMPANIES).toBe('companies');
      expect(PORTALS.ADMIN).toBe('admin');
    });
  });

  describe('ROLE_TO_PORTAL mapping', () => {
    it('should map patient role to patients portal', () => {
      expect(ROLE_TO_PORTAL[ROLES.PATIENT]).toBe(PORTALS.PATIENTS);
    });

    it('should map doctor role to doctors portal', () => {
      expect(ROLE_TO_PORTAL[ROLES.DOCTOR]).toBe(PORTALS.DOCTORS);
    });

    it('should map company roles to companies portal', () => {
      expect(ROLE_TO_PORTAL[ROLES.COMPANY]).toBe(PORTALS.COMPANIES);
      expect(ROLE_TO_PORTAL[ROLES.COMPANY_ADMIN]).toBe(PORTALS.COMPANIES);
    });

    it('should map admin roles to admin portal', () => {
      expect(ROLE_TO_PORTAL[ROLES.ORGANIZATION_ADMIN]).toBe(PORTALS.ADMIN);
      expect(ROLE_TO_PORTAL[ROLES.ADMIN]).toBe(PORTALS.ADMIN);
      expect(ROLE_TO_PORTAL[ROLES.PLATFORM_ADMIN]).toBe(PORTALS.ADMIN);
    });
  });

  describe('PORTAL_TO_ROLE mapping', () => {
    it('should map portals to primary roles', () => {
      expect(PORTAL_TO_ROLE[PORTALS.PATIENTS]).toBe(ROLES.PATIENT);
      expect(PORTAL_TO_ROLE[PORTALS.DOCTORS]).toBe(ROLES.DOCTOR);
      expect(PORTAL_TO_ROLE[PORTALS.COMPANIES]).toBe(ROLES.ORGANIZATION_ADMIN);
      expect(PORTAL_TO_ROLE[PORTALS.ADMIN]).toBe(ROLES.PLATFORM_ADMIN);
    });
  });

  describe('ALL_ROLES array', () => {
    it('should contain all 7 roles', () => {
      expect(ALL_ROLES).toHaveLength(7);
    });

    it('should include all defined roles', () => {
      expect(ALL_ROLES).toContain('patient');
      expect(ALL_ROLES).toContain('doctor');
      expect(ALL_ROLES).toContain('company');
      expect(ALL_ROLES).toContain('company_admin');
      expect(ALL_ROLES).toContain('organization_admin');
      expect(ALL_ROLES).toContain('admin');
      expect(ALL_ROLES).toContain('platform_admin');
    });
  });

  describe('Type safety', () => {
    it('should enforce UserRole type', () => {
      const validRole: UserRole = 'patient';
      expect(validRole).toBe('patient');
    });

    it('should enforce Portal type', () => {
      const validPortal: Portal = 'patients';
      expect(validPortal).toBe('patients');
    });
  });
});
