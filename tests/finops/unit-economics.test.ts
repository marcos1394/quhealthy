import { describe, it, expect } from 'vitest';
import {
  calculateConsultationUnitEconomics,
  calculateSaasUnitEconomics,
} from '@/lib/finops/unit-economics-calculator';

describe('OPS-FINOPS-02 / FIN-SEED-02: Unit Economics Calculator', () => {
  describe('calculateConsultationUnitEconomics', () => {
    it('calculates accurate take rate, direct COGS, and positive contribution margin for an $800 MXN consultation', () => {
      const result = calculateConsultationUnitEconomics({
        consultationPrice: 800,
        quhealthyTakePercent: 0.15, // 15% take rate = $120 MXN
        durationMinutes: 30,
      });

      expect(result.consultationPrice).toBe(800);
      expect(result.quhealthyGrossTake).toBe(120);
      expect(result.providerPayout).toBe(680);

      // Stripe Fee: 800 * 3.6% + $3 = 28.8 + 3 = 31.8
      expect(result.stripeFee).toBe(31.8);

      // Cloud Run & AI costs should be small fractions
      expect(result.cloudRunCost).toBeGreaterThan(0);
      expect(result.vertexAiCost).toBe(0.18);
      expect(result.liveKitCost).toBeGreaterThan(0);
      expect(result.satCfdiCost).toBe(0.85);

      // Total COGS: ~ 31.8 + 0.042 + 0.18 + 0.36 + 0.85 = ~33.23
      expect(result.totalDirectCogs).toBeGreaterThan(30);
      expect(result.totalDirectCogs).toBeLessThan(40);

      // Contribution Margin: 120 - ~33.23 = ~86.77 (Healthy ~72% margin on take)
      expect(result.contributionMargin).toBeGreaterThan(80);
      expect(result.contributionMarginPercent).toBeGreaterThan(65);
    });

    it('handles zero or free consultations gracefully', () => {
      const result = calculateConsultationUnitEconomics({
        consultationPrice: 0,
      });

      expect(result.consultationPrice).toBe(0);
      expect(result.quhealthyGrossTake).toBe(0);
      expect(result.contributionMarginPercent).toBe(0);
    });
  });

  describe('calculateSaasUnitEconomics', () => {
    it('calculates ARPU and gross margin accurately for SaaS subscriptions', () => {
      const result = calculateSaasUnitEconomics({
        mrr: 45000,
        activeSubscribers: 30,
        monthlyGcpCloudCosts: 1800,
        monthlyVertexAiCosts: 950,
        monthlyStripeCosts: 1620,
      });

      expect(result.mrr).toBe(45000);
      expect(result.activeSubscribers).toBe(30);
      expect(result.arpu).toBe(1500); // 45000 / 30 = 1500
      expect(result.totalMonthlyCogs).toBe(4370); // 1800 + 950 + 1620
      expect(result.grossProfit).toBe(40630); // 45000 - 4370
      expect(result.grossMarginPercent).toBeCloseTo(90.3, 1);
    });
  });
});
