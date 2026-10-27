/**
 * Calculadora Auditable de Unit Economics por Consulta Médica y Suscripción SaaS
 * QuHealthy Health OS — Análisis de Rentabilidad Granular (Cloud Run + Vertex AI + LiveKit + Stripe + Facturama)
 */

export interface ConsultationCostInputs {
  consultationPrice: number;
  quhealthyTakePercent?: number; // e.g. 15% (0.15)
  durationMinutes?: number; // e.g. 30 min
  cloudRunCostPerMinute?: number; // Default: $0.0014 MXN/min
  vertexAiCostPerConsultation?: number; // Default: $0.18 MXN (SOAP note generation)
  liveKitStreamingCostPerMinute?: number; // Default: $0.012 MXN/min
  stripePercentFee?: number; // Default: 3.6% (0.036)
  stripeFixedFee?: number; // Default: $3.00 MXN
  satCfdiCost?: number; // Default: $0.85 MXN (Timbre CFDI 4.0)
}

export interface ConsultationUnitEconomicsResult {
  consultationPrice: number;
  providerPayout: number;
  quhealthyGrossTake: number;
  stripeFee: number;
  cloudRunCost: number;
  vertexAiCost: number;
  liveKitCost: number;
  satCfdiCost: number;
  totalDirectCogs: number;
  contributionMargin: number;
  contributionMarginPercent: number;
}

export interface SaasUnitEconomicsInputs {
  mrr: number;
  activeSubscribers: number;
  monthlyGcpCloudCosts: number;
  monthlyVertexAiCosts: number;
  monthlyStripeCosts: number;
}

export interface SaasUnitEconomicsResult {
  mrr: number;
  activeSubscribers: number;
  arpu: number;
  totalMonthlyCogs: number;
  grossProfit: number;
  grossMarginPercent: number;
}

/**
 * Calcula los Unit Economics auditables por consulta de telemedicina
 */
export function calculateConsultationUnitEconomics(
  inputs: ConsultationCostInputs
): ConsultationUnitEconomicsResult {
  const price = Math.max(0, inputs.consultationPrice);
  const takePercent = inputs.quhealthyTakePercent ?? 0.15;
  const duration = inputs.durationMinutes ?? 30;

  // Revenue split
  const quhealthyGrossTake = Math.round(price * takePercent * 100) / 100;
  const providerPayout = Math.round((price - quhealthyGrossTake) * 100) / 100;

  // Costos directos (COGS)
  const stripePercent = inputs.stripePercentFee ?? 0.036;
  const stripeFixed = inputs.stripeFixedFee ?? 3.0;
  const stripeFee = Math.round((price * stripePercent + stripeFixed) * 100) / 100;

  const cloudRunPerMin = inputs.cloudRunCostPerMinute ?? 0.0014;
  const cloudRunCost = Math.round(duration * cloudRunPerMin * 1000) / 1000;

  const vertexAiCost = inputs.vertexAiCostPerConsultation ?? 0.18;

  const liveKitPerMin = inputs.liveKitStreamingCostPerMinute ?? 0.012;
  const liveKitCost = Math.round(duration * liveKitPerMin * 1000) / 1000;

  const satCfdiCost = inputs.satCfdiCost ?? 0.85;

  const totalDirectCogs =
    Math.round(
      (stripeFee + cloudRunCost + vertexAiCost + liveKitCost + satCfdiCost) * 100
    ) / 100;

  const contributionMargin =
    Math.round((quhealthyGrossTake - totalDirectCogs) * 100) / 100;

  const contributionMarginPercent =
    quhealthyGrossTake > 0
      ? Math.round((contributionMargin / quhealthyGrossTake) * 1000) / 10
      : 0;

  return {
    consultationPrice: price,
    providerPayout,
    quhealthyGrossTake,
    stripeFee,
    cloudRunCost,
    vertexAiCost,
    liveKitCost,
    satCfdiCost,
    totalDirectCogs,
    contributionMargin,
    contributionMarginPercent,
  };
}

/**
 * Calcula métricas agregadas de Unit Economics para suscripciones SaaS institucionales
 */
export function calculateSaasUnitEconomics(
  inputs: SaasUnitEconomicsInputs
): SaasUnitEconomicsResult {
  const mrr = Math.max(0, inputs.mrr);
  const subs = Math.max(0, inputs.activeSubscribers);
  const arpu = subs > 0 ? Math.round((mrr / subs) * 100) / 100 : 0;

  const totalMonthlyCogs =
    Math.round(
      (inputs.monthlyGcpCloudCosts +
        inputs.monthlyVertexAiCosts +
        inputs.monthlyStripeCosts) *
        100
    ) / 100;

  const grossProfit = Math.round((mrr - totalMonthlyCogs) * 100) / 100;
  const grossMarginPercent =
    mrr > 0 ? Math.round((grossProfit / mrr) * 1000) / 10 : 0;

  return {
    mrr,
    activeSubscribers: subs,
    arpu,
    totalMonthlyCogs,
    grossProfit,
    grossMarginPercent,
  };
}
