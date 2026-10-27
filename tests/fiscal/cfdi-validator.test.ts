import { describe, it, expect } from 'vitest';
import {
  validateRfc,
  validateZipCode,
  validateRegime,
  validateCfdiUse,
  validateCfdiPayload,
} from '@/lib/fiscal/cfdi-validator';

describe('CFDI 4.0 Validator (SAT Compliance)', () => {
  describe('validateRfc', () => {
    it('validates a correct Persona Física RFC (13 characters)', () => {
      const res = validateRfc('GARM850101AB1');
      expect(res.isValid).toBe(true);
      expect(res.type).toBe('FISICA');
      expect(res.normalizedRfc).toBe('GARM850101AB1');
    });

    it('validates a correct Persona Moral RFC (12 characters)', () => {
      const res = validateRfc('IMS421231I45');
      expect(res.isValid).toBe(true);
      expect(res.type).toBe('MORAL');
      expect(res.normalizedRfc).toBe('IMS421231I45');
    });

    it('validates generic RFCs (XAXX010101000 and XEXX010101000)', () => {
      const resNacional = validateRfc('XAXX010101000');
      expect(resNacional.isValid).toBe(true);
      expect(resNacional.type).toBe('GENERICO');

      const resExtranjero = validateRfc('XEXX010101000');
      expect(resExtranjero.isValid).toBe(true);
      expect(resExtranjero.type).toBe('GENERICO');
    });

    it('rejects an RFC with incorrect length or malformed characters', () => {
      expect(validateRfc('GAR850101').isValid).toBe(false);
      expect(validateRfc('1234567890123').isValid).toBe(false);
      expect(validateRfc('').isValid).toBe(false);
    });
  });

  describe('validateZipCode', () => {
    it('accepts valid 5-digit Mexican postal codes', () => {
      expect(validateZipCode('06600').isValid).toBe(true);
      expect(validateZipCode('64000').isValid).toBe(true);
    });

    it('rejects postal codes that are not 5 digits', () => {
      expect(validateZipCode('6400').isValid).toBe(false);
      expect(validateZipCode('640001').isValid).toBe(false);
      expect(validateZipCode('ABCDE').isValid).toBe(false);
      expect(validateZipCode('').isValid).toBe(false);
    });
  });

  describe('validateRegime', () => {
    it('accepts valid SAT tax regimes', () => {
      expect(validateRegime('601').isValid).toBe(true); // General de Ley PM
      expect(validateRegime('605').isValid).toBe(true); // Sueldos y salarios
      expect(validateRegime('612').isValid).toBe(true); // Personas Físicas Actividades Empresariales y Profesionales
      expect(validateRegime('626').isValid).toBe(true); // RESICO
    });

    it('rejects unknown tax regimes', () => {
      expect(validateRegime('999').isValid).toBe(false);
      expect(validateRegime('').isValid).toBe(false);
    });
  });

  describe('validateCfdiUse', () => {
    it('accepts D01 (Honorarios médicos) for Persona Física', () => {
      const res = validateCfdiUse('D01', 'FISICA');
      expect(res.isValid).toBe(true);
    });

    it('rejects D01 (Honorarios médicos) for Persona Moral', () => {
      const res = validateCfdiUse('D01', 'MORAL');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Personas Morales');
    });

    it('accepts G03 (Gastos en general) for both Física and Moral', () => {
      expect(validateCfdiUse('G03', 'FISICA').isValid).toBe(true);
      expect(validateCfdiUse('G03', 'MORAL').isValid).toBe(true);
    });

    it('rejects invalid CFDI use code', () => {
      expect(validateCfdiUse('ZZZ').isValid).toBe(false);
    });
  });

  describe('validateCfdiPayload', () => {
    it('validates a complete valid payload for a patient requesting CFDI 4.0', () => {
      const result = validateCfdiPayload({
        rfc: 'GARM850101AB1',
        name: 'MARIO GARCIA RAMIREZ',
        zipCode: '06600',
        regime: '605',
        cfdiUse: 'D01',
        email: 'mario@example.com',
      });

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('returns structured errors for invalid inputs', () => {
      const result = validateCfdiPayload({
        rfc: 'INVALID',
        name: '',
        zipCode: '123',
        regime: '999',
        cfdiUse: 'ZZZ',
        email: 'invalid-email',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.rfc).toBeDefined();
      expect(result.errors.name).toBeDefined();
      expect(result.errors.zipCode).toBeDefined();
      expect(result.errors.regime).toBeDefined();
      expect(result.errors.cfdiUse).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });
  });
});
