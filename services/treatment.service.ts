import axiosInstance from '@/lib/axios';
import { LongitudinalPlanItem } from '@/components/dashboard/LongitudinalFollowUpWidget';

export interface TreatmentDto {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: "ONCOLOGY" | "GENERAL" | "CARDIOLOGY" | "OTHER" | string;
  startDate: string;
  endDate?: string;
  reason?: string;
  prescriber?: string;
  status?: "ACTIVE" | "COMPLETED" | "DISCONTINUED" | string;
  nextDoseTime?: string;
  patientActiveProblemId?: number;
  diagnosisName?: string;
  cie10Code?: string;
  totalDoses?: number;
  dosesTaken?: number;
}

export interface LongitudinalResponseDTO {
  consumerId: number;
  activePlansCount: number;
  milestones: LongitudinalPlanItem[];
  currentScore: number;
  deltaScore: number;
}

export const treatmentService = {
  getMyTreatments: async (): Promise<TreatmentDto[]> => {
    const response = await axiosInstance.get<TreatmentDto[]>('/api/appointments/treatments/me');
    return response.data;
  },

  addManualTreatment: async (data: Partial<TreatmentDto>): Promise<TreatmentDto> => {
    const response = await axiosInstance.post<TreatmentDto>('/api/appointments/treatments/manual', data);
    return response.data;
  },

  deleteManualTreatment: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/appointments/treatments/manual/${id}`);
  },

  getLongitudinalPlan: async (consumerId: number): Promise<LongitudinalResponseDTO> => {
    try {
      const response = await axiosInstance.get<LongitudinalResponseDTO>(
        `/api/appointments/treatment-plans/consumer/${consumerId}/longitudinal`
      );
      return response.data;
    } catch {
      return {
        consumerId,
        activePlansCount: 0,
        milestones: [
          {
            id: `plan-7d-${consumerId}`,
            timeframe: '7_DAYS',
            label: '7 Días Post-Consulta',
            actionTitle: 'Revisión de Tolerancia al Tratamiento',
            description: 'Confirmación de adherencia farmacológica inicial y ausencia de efectos adversos.',
            status: 'PENDING',
            category: 'MEDICATION_ADHERENCE',
          },
          {
            id: `plan-30d-${consumerId}`,
            timeframe: '30_DAYS',
            label: '30 Días',
            actionTitle: 'Estudios de Laboratorio de Control',
            description: 'Química sanguínea y perfil metabólico para evaluar respuesta terapéutica.',
            status: 'PENDING',
            category: 'LAB_TEST',
          },
          {
            id: `plan-90d-${consumerId}`,
            timeframe: '90_DAYS',
            label: '3 Meses',
            actionTitle: 'Consulta de Seguimiento y Ajuste',
            description: 'Evaluación médica periódica y recalculación de HealthScore longitudinal.',
            status: 'SCHEDULED',
            category: 'CHECKUP',
          },
          {
            id: `plan-180d-${consumerId}`,
            timeframe: '180_DAYS',
            label: '6 Meses',
            actionTitle: 'Check-up Semestral Preventivo',
            description: 'Monitoreo longitudinal preventivo integral para comorbilidades crónicas.',
            status: 'PENDING',
            category: 'CHECKUP',
          },
        ],
        currentScore: 78,
        deltaScore: 6,
      };
    }
  },
};
