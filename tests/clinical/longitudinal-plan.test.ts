import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios';
import { treatmentService } from '@/services/treatment.service';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AI-LONGITUDINAL-02: Longitudinal Follow-up Plan API & Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches longitudinal milestones successfully from backend', async () => {
    const mockData = {
      consumerId: 42,
      activePlansCount: 1,
      milestones: [
        {
          id: 'plan-7d-42',
          timeframe: '7_DAYS',
          label: '7 Días Post-Consulta',
          actionTitle: 'Revisión de Tolerancia al Tratamiento',
          description: 'Confirmación de adherencia farmacológica inicial y ausencia de efectos adversos.',
          status: 'COMPLETED',
          category: 'MEDICATION_ADHERENCE',
        },
        {
          id: 'plan-30d-42',
          timeframe: '30_DAYS',
          label: '30 Días',
          actionTitle: 'Estudios de Laboratorio de Control',
          description: 'Química sanguínea y perfil metabólico para evaluar respuesta terapéutica.',
          status: 'PENDING',
          category: 'LAB_TEST',
        },
        {
          id: 'plan-90d-42',
          timeframe: '90_DAYS',
          label: '3 Meses',
          actionTitle: 'Consulta de Seguimiento y Ajuste',
          description: 'Evaluación médica periódica y recalculación de HealthScore longitudinal.',
          status: 'SCHEDULED',
          category: 'CHECKUP',
        },
        {
          id: 'plan-180d-42',
          timeframe: '180_DAYS',
          label: '6 Meses',
          actionTitle: 'Check-up Semestral Preventivo',
          description: 'Monitoreo longitudinal preventivo integral para comorbilidades crónicas.',
          status: 'PENDING',
          category: 'CHECKUP',
        },
      ],
      currentScore: 82,
      deltaScore: 8,
    };

    (axiosInstance.get as any).mockResolvedValue({ data: mockData });

    const result = await treatmentService.getLongitudinalPlan(42);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/api/appointments/treatment-plans/consumer/42/longitudinal'
    );
    expect(result.consumerId).toBe(42);
    expect(result.milestones.length).toBe(4);
    expect(result.milestones[0].timeframe).toBe('7_DAYS');
    expect(result.milestones[0].status).toBe('COMPLETED');
    expect(result.currentScore).toBe(82);
  });

  it('provides safe fallback milestones when endpoint fails', async () => {
    (axiosInstance.get as any).mockRejectedValue(new Error('Network error'));

    const result = await treatmentService.getLongitudinalPlan(99);

    expect(result.consumerId).toBe(99);
    expect(result.milestones.length).toBe(4);
    expect(result.milestones[0].timeframe).toBe('7_DAYS');
    expect(result.milestones[1].timeframe).toBe('30_DAYS');
    expect(result.milestones[2].timeframe).toBe('90_DAYS');
    expect(result.milestones[3].timeframe).toBe('180_DAYS');
    expect(result.currentScore).toBe(78);
  });
});
