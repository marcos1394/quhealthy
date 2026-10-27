/**
 * QuHealthy - Motor de Reactivación Preventiva de Pacientes y Check-ups (MKT-CRM-01)
 * Cumplimiento con LFPDPPP (Consentimiento explícito y Opt-Out mandatorio) y NOM-004.
 */

export interface ReactivationCandidate {
  patientId: string | number;
  lastAppointmentDate: string;
  specialty?: string;
  hasChronicCondition?: boolean;
  optOutMarketing?: boolean;
}

export type ReactivationStatus = 'ELIGIBLE' | 'RECENT_CONSULTATION' | 'OPTED_OUT' | 'INVALID_DATE';

export interface ReactivationEvaluationResult {
  patientId: string | number;
  status: ReactivationStatus;
  daysSinceLastConsultation: number;
  checkupType: 'SEMESTRAL_CHECKUP' | 'ANNUAL_CHECKUP' | 'CHRONIC_CARE_CONTROL' | 'NONE';
  recommendedMessage: string | null;
  optOutNotice: string;
}

const OPT_OUT_NOTICE_ES =
  'Si prefieres no recibir recordatorios preventivos de salud, puedes desactivarlos en cualquier momento desde tu perfil en https://quhealthy.org/patient/dashboard/settings o respondiendo CANCELAR.';

/**
 * Evalúa si un paciente es candidato a recordatorio preventivo de check-up o seguimiento crónico.
 */
export function evaluatePatientReactivation(
  candidate: ReactivationCandidate,
  referenceDate: Date = new Date()
): ReactivationEvaluationResult {
  if (candidate.optOutMarketing) {
    return {
      patientId: candidate.patientId,
      status: 'OPTED_OUT',
      daysSinceLastConsultation: 0,
      checkupType: 'NONE',
      recommendedMessage: null,
      optOutNotice: OPT_OUT_NOTICE_ES,
    };
  }

  const lastDate = new Date(candidate.lastAppointmentDate);
  if (isNaN(lastDate.getTime())) {
    return {
      patientId: candidate.patientId,
      status: 'INVALID_DATE',
      daysSinceLastConsultation: 0,
      checkupType: 'NONE',
      recommendedMessage: null,
      optOutNotice: OPT_OUT_NOTICE_ES,
    };
  }

  const diffMs = referenceDate.getTime() - lastDate.getTime();
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Pacientes crónicos requieren control a los 90 días
  if (candidate.hasChronicCondition && daysSince >= 90) {
    return {
      patientId: candidate.patientId,
      status: 'ELIGIBLE',
      daysSinceLastConsultation: daysSince,
      checkupType: 'CHRONIC_CARE_CONTROL',
      recommendedMessage: `Hola. Ha pasado ${daysSince} días desde tu última consulta de ${
        candidate.specialty || 'especialidad'
      }. Te sugerimos agendar tu revisión trimestral de control para mantener tus métricas de salud estables.`,
      optOutNotice: OPT_OUT_NOTICE_ES,
    };
  }

  // Pacientes generales con más de 180 días (semestral) o 365 días (anual)
  if (daysSince >= 365) {
    return {
      patientId: candidate.patientId,
      status: 'ELIGIBLE',
      daysSinceLastConsultation: daysSince,
      checkupType: 'ANNUAL_CHECKUP',
      recommendedMessage: `Hola. Ha pasado un año desde tu último chequeo en QuHealthy. Un check-up anual preventivo es clave para la detección oportuna. ¿Deseas agendar con tu médico?`,
      optOutNotice: OPT_OUT_NOTICE_ES,
    };
  }

  if (daysSince >= 180) {
    return {
      patientId: candidate.patientId,
      status: 'ELIGIBLE',
      daysSinceLastConsultation: daysSince,
      checkupType: 'SEMESTRAL_CHECKUP',
      recommendedMessage: `Hola. Han pasado 6 meses desde tu última consulta médica. Mantener tu seguimiento preventivo te ayuda a optimizar tu QuHealthScore.`,
      optOutNotice: OPT_OUT_NOTICE_ES,
    };
  }

  return {
    patientId: candidate.patientId,
    status: 'RECENT_CONSULTATION',
    daysSinceLastConsultation: daysSince,
    checkupType: 'NONE',
    recommendedMessage: null,
    optOutNotice: OPT_OUT_NOTICE_ES,
  };
}
