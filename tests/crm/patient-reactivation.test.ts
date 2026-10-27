import { describe, it, expect } from 'vitest';
import { evaluatePatientReactivation } from '@/lib/crm/preventive-reactivation';

describe('MKT-CRM-01: Reactivación Preventiva de Pacientes y Cumplimiento LFPDPPP', () => {
  const refDate = new Date('2026-10-26T12:00:00Z');

  it('respeta de inmediato a pacientes con opt-out activo de comunicaciones', () => {
    const result = evaluatePatientReactivation(
      {
        patientId: 101,
        lastAppointmentDate: '2025-01-10T00:00:00Z',
        optOutMarketing: true,
      },
      refDate
    );

    expect(result.status).toBe('OPTED_OUT');
    expect(result.recommendedMessage).toBeNull();
    expect(result.checkupType).toBe('NONE');
    expect(result.optOutNotice).toContain('CANCELAR');
  });

  it('declara elegible a un paciente crónico tras 90 días para control de tratamiento', () => {
    const result = evaluatePatientReactivation(
      {
        patientId: 202,
        lastAppointmentDate: '2026-07-01T00:00:00Z', // ~117 días
        specialty: 'Endocrinología',
        hasChronicCondition: true,
        optOutMarketing: false,
      },
      refDate
    );

    expect(result.status).toBe('ELIGIBLE');
    expect(result.checkupType).toBe('CHRONIC_CARE_CONTROL');
    expect(result.recommendedMessage).toContain('revisión trimestral de control');
    expect(result.recommendedMessage).toContain('Endocrinología');
  });

  it('declara elegible a un paciente general tras más de 180 días para chequeo semestral', () => {
    const result = evaluatePatientReactivation(
      {
        patientId: 303,
        lastAppointmentDate: '2026-03-01T00:00:00Z', // ~239 días
        optOutMarketing: false,
      },
      refDate
    );

    expect(result.status).toBe('ELIGIBLE');
    expect(result.checkupType).toBe('SEMESTRAL_CHECKUP');
    expect(result.recommendedMessage).toContain('Han pasado 6 meses');
  });

  it('no envía recordatorio a pacientes con consultas recientes (< 90 días)', () => {
    const result = evaluatePatientReactivation(
      {
        patientId: 404,
        lastAppointmentDate: '2026-10-01T00:00:00Z', // 25 días
        optOutMarketing: false,
      },
      refDate
    );

    expect(result.status).toBe('RECENT_CONSULTATION');
    expect(result.recommendedMessage).toBeNull();
  });
});
