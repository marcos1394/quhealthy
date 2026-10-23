import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  TabExecutivePulse,
  validateSourceDate,
} from "@/app/[locale]/admin/dashboard/tabs/TabExecutivePulse";
import {
  UnitEconomicsDTO,
  AdminDashboardDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
} from "@/services/admin.service";

// Mock ResizeObserver for recharts ResponsiveContainer in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("TabExecutivePulse & validateSourceDate (ADMIN-TRUST-01 & HU #43 Veracity Audit)", () => {
  const formatCurrency = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  const mockNavigateTab = vi.fn();

  const mockProviders: ProviderAdminDTO[] = [
    {
      id: 1,
      fullName: "Dra. Sofía Mendoza",
      email: "sofia.mendoza@example.com",
      specialty: "Pediatría",
      licenseNumber: "12345678",
      onboardingComplete: true,
      onboardingStatus: "COMPLETED",
      createdAt: "2026-10-01T00:00:00Z",
      status: "ACTIVE",
    },
  ];

  describe("1. validateSourceDate Helper: Rigorous Date Verification", () => {
    it("handles missing/undefined/empty date strings with MISSING status", () => {
      const res1 = validateSourceDate(undefined);
      expect(res1.status).toBe("MISSING");
      expect(res1.formattedText).toBe("No disponible / No verificado");
      expect(res1.isValid).toBe(false);

      const res2 = validateSourceDate(null);
      expect(res2.status).toBe("MISSING");

      const res3 = validateSourceDate("   ");
      expect(res3.status).toBe("MISSING");
    });

    it("detects malformed/invalid date strings with INVALID status", () => {
      const res = validateSourceDate("not-a-real-date-2026");
      expect(res.status).toBe("INVALID");
      expect(res.formattedText).toBe("Fecha inválida");
      expect(res.isValid).toBe(false);
    });

    it("detects future dates with FUTURE status", () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      const res = validateSourceDate(futureDate);
      expect(res.status).toBe("FUTURE");
      expect(res.formattedText).toBe("Fecha futura no válida");
      expect(res.isValid).toBe(false);
    });

    it("detects obsolete/stale dates (>48h) with STALE status", () => {
      const staleDate = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
      const res = validateSourceDate(staleDate, 48);
      expect(res.status).toBe("STALE");
      expect(res.isStale).toBe(true);
      expect(res.isValid).toBe(true);
      expect(res.formattedText).toContain("(Obsoleto >48h)");
    });

    it("validates fresh dates within 48h with VALID status", () => {
      const freshDate = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      const res = validateSourceDate(freshDate, 48);
      expect(res.status).toBe("VALID");
      expect(res.isStale).toBe(false);
      expect(res.isValid).toBe(true);
    });
  });

  describe("2. Render: Datos Ausentes (Null / Empty Props)", () => {
    it("renders 'No disponible / No verificado' for all proposal cards and KPI cards without inventing zeroes", () => {
      render(
        <TabExecutivePulse
          economics={null}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Proposal cards show 'No disponible / No verificado' for metrics
      const unverifiedItems = screen.getAllByText(/No disponible \/ No verificado/i);
      expect(unverifiedItems.length).toBeGreaterThanOrEqual(3);

      // Never display invented zeros or claims
      expect(screen.queryByText("$0.00 MXN")).not.toBeInTheDocument();
      expect(screen.queryByText("0 fallas de pasarela en BD")).not.toBeInTheDocument();
      expect(screen.queryByText(/Cero citas orgánicas/i)).not.toBeInTheDocument();

      // Empty telemetry banner is visible
      expect(
        screen.getByText(/Telemetría no conectada \(Estado Vacío \/ Sin telemetría verificada\)/i)
      ).toBeInTheDocument();

      // Cutoff shows unverified
      expect(screen.getAllByText(/Generado API: No disponible \/ No verificado/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("3. Render: Cero Válido vs Dato Ausente", () => {
    it("preserves authentic 0 values faithfully without turning them into 'No disponible'", () => {
      const validZeroEconomics: UnitEconomicsDTO = {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        totalSubscriptionsRevenue: 0,
        totalCommissionsRevenue: 0,
        onlineRevenue: 0,
        inClinicRevenue: 0,
        cloudCosts: 0,
        stripeFees: 0,
        totalCosts: 0,
        arpu: 0,
        grossMargin: 0,
        mrr: 0,
        topProviders: [],
        salesByType: [],
        asOf: new Date(Date.now() - 3600 * 1000).toISOString(),
        period: "30d",
        reconciliationQuality: "PROVISIONAL",
        costsQuality: {
          stripeFees: "PROVISIONAL",
          cloudCosts: "PROVISIONAL",
        },
      };

      const validZeroDashboard: AdminDashboardDTO = {
        appointmentsToday: 0,
        appointmentsThisMonth: 0,
        activeProvidersThisMonth: 0,
        newProvidersThisMonth: 0,
        completedAppointmentsThisMonth: 0,
        cancelledAppointmentsThisMonth: 0,
        noShowAppointmentsThisMonth: 0,
        revenueThisMonth: 0,
        generatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      };

      render(
        <TabExecutivePulse
          economics={validZeroEconomics}
          dashboard={validZeroDashboard}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Authenticated zero revenue is rendered as $0.00
      expect(screen.getAllByText("$0.00").length).toBeGreaterThanOrEqual(1);

      // 0 consultations is rendered faithfully in proposal card 1
      expect(screen.getByText("0 consultas")).toBeInTheDocument();

      // Top KPI appointments today displays 0
      expect(screen.getByText("0 este mes")).toBeInTheDocument();

      // Cost cloud registered shows $0.00
      expect(screen.getAllByText(/Costo cloud estimado \(GCP\):/i).length).toBe(1);
    });
  });

  describe("4. Render: Valores No Cero", () => {
    it("renders authentic non-zero figures accurately across proposal cards and top KPIs", () => {
      const nonZeroEconomics: UnitEconomicsDTO = {
        totalUsers: 15,
        activeSubscriptions: 4,
        totalRevenue: 15400,
        totalSubscriptionsRevenue: 7200,
        totalCommissionsRevenue: 8200,
        onlineRevenue: 9000,
        inClinicRevenue: 6400,
        cloudCosts: 480,
        stripeFees: 120,
        totalCosts: 600,
        arpu: 1026,
        grossMargin: 0.96,
        mrr: 7200,
        topProviders: [],
        salesByType: [],
        asOf: new Date(Date.now() - 3600 * 1000).toISOString(),
        period: "30d",
        costsQuality: {
          stripeFees: "CERTIFIED",
          cloudCosts: "CERTIFIED",
        },
      };

      const nonZeroDashboard: AdminDashboardDTO = {
        appointmentsToday: 2,
        appointmentsThisMonth: 8,
        activeProvidersThisMonth: 3,
        newProvidersThisMonth: 1,
        completedAppointmentsThisMonth: 7,
        cancelledAppointmentsThisMonth: 1,
        noShowAppointmentsThisMonth: 0,
        revenueThisMonth: 8200,
        generatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      };

      render(
        <TabExecutivePulse
          economics={nonZeroEconomics}
          dashboard={nonZeroDashboard}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Non-zero values rendered accurately
      expect(screen.getByText("7 consultas")).toBeInTheDocument();
      expect(screen.getAllByText("$15,400.00").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("$480.00")).toBeInTheDocument();
      expect(screen.getByText("8 este mes")).toBeInTheDocument();
      expect(screen.getByText("4 suscripciones")).toBeInTheDocument();
    });
  });

  describe("5. Render: Error y Fechas Inválidas o Futuras", () => {
    it("displays error indicators and 'Fecha de corte inválida' when date string is malformed", () => {
      const invalidDateEconomics: UnitEconomicsDTO = {
        totalUsers: 5,
        activeSubscriptions: 1,
        totalRevenue: 100,
        totalSubscriptionsRevenue: 100,
        totalCommissionsRevenue: 0,
        topProviders: [],
        salesByType: [],
        arpu: 20,
        asOf: "invalid-date-format-XYZ",
        period: "30d",
      };

      render(
        <TabExecutivePulse
          economics={invalidDateEconomics}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Warning pill for invalid cut-off date
      expect(screen.getByText(/Fecha de corte inválida/i)).toBeInTheDocument();

      // Top KPI signal quality reflects ERROR
      const errorBadges = screen.getAllByRole("alert");
      expect(errorBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("displays error indicators and 'Fecha futura no válida' when date is in the future", () => {
      const futureDateEconomics: UnitEconomicsDTO = {
        totalUsers: 5,
        activeSubscriptions: 1,
        totalRevenue: 100,
        totalSubscriptionsRevenue: 100,
        totalCommissionsRevenue: 0,
        topProviders: [],
        salesByType: [],
        arpu: 20,
        asOf: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
        period: "30d",
      };

      render(
        <TabExecutivePulse
          economics={futureDateEconomics}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      expect(screen.getAllByText(/Fecha futura no válida/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("6. Render: Dato Obsoleto (>48h)", () => {
    it("displays warning badge 'Dato obsoleto (>48h)' when telemetry is older than 48 hours", () => {
      const staleDate = new Date(Date.now() - 96 * 3600 * 1000).toISOString();
      const staleEconomics: UnitEconomicsDTO = {
        totalUsers: 5,
        activeSubscriptions: 1,
        totalRevenue: 100,
        totalSubscriptionsRevenue: 100,
        totalCommissionsRevenue: 0,
        topProviders: [],
        salesByType: [],
        arpu: 20,
        asOf: staleDate,
        period: "30d",
      };

      render(
        <TabExecutivePulse
          economics={staleEconomics}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      expect(screen.getByText(/Dato obsoleto \(>48h\)/i)).toBeInTheDocument();
    });
  });

  describe("7. Gobernanza de Decisiones: Tres Propuestas Pendientes de Junta", () => {
    it("maintains the 3 axes strictly as proposals pending board decision without claiming approved decisions", () => {
      render(
        <TabExecutivePulse
          economics={null}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Must NOT claim approved decisions
      expect(screen.queryByText("Acción Aprobada:")).not.toBeInTheDocument();
      expect(screen.queryByText(/evidencia certificada/i)).not.toBeInTheDocument();

      // Must NOT present assumptions as measured or approved decisions
      expect(screen.queryByText(/10 médicos seleccionados y soporte concierge únicamente tras validación humana/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ahorro 80%/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/rechazar Cloud Armor \(\$80\/mes\)/i)).not.toBeInTheDocument();

      // All 3 cards indicate PENDING decision
      const pendingDecisions = screen.getAllByText(/Decisión: PENDIENTE/i);
      expect(pendingDecisions.length).toBe(3);

      const proposalBadges = screen.getAllByText("PROPUESTA A JUNTA");
      expect(proposalBadges.length).toBe(3);
    });
  });

  describe("8. Contrato Financiero Veraz: Réplica de DTO Real de AdminPaymentController & StripeAnalyticsService", () => {
    it("renders accurately with realistic backend DTO payload without promoting signals to CERTIFIED or inventing +0% variations", () => {
      const realBackendPayload: UnitEconomicsDTO = {
        totalUsers: 12,
        activeSubscriptions: 0,
        totalRevenue: 0,
        totalSubscriptionsRevenue: 0,
        totalCommissionsRevenue: 0,
        onlineRevenue: 0,
        inClinicRevenue: 0,
        totalGmv: 0,
        cloudCosts: 35.5,
        aiCosts: undefined,
        satFacturamaCosts: undefined,
        communicationsCosts: undefined,
        marketingCosts: undefined,
        stripeFees: 0,
        totalCosts: undefined,
        mrr: 0,
        arr: 0,
        churnRate: 0,
        planTiers: [],
        totalDoctorPayouts: undefined,
        pendingDoctorPayouts: undefined,
        reconciliationMatch: false,
        reconciliationQuality: "PROVISIONAL",
        reconciliationNotes: "Conciliación bancaria y balance Stripe en proceso",
        isEstimatedScenario: true,
        costsQuality: {
          stripeFees: "PROVISIONAL",
          cloudCosts: "PROVISIONAL",
          aiCosts: "UNAVAILABLE",
          satFacturamaCosts: "UNAVAILABLE",
          communicationsCosts: "UNAVAILABLE",
          marketingCosts: "UNAVAILABLE",
          totalCosts: "UNAVAILABLE",
          costPerUser: "UNAVAILABLE",
          netProfit: "UNAVAILABLE",
        },
        asOf: new Date(Date.now() - 1800 * 1000).toISOString(),
        period: "30d",
        salesByType: [],
        arpu: 0,
        costPerUser: undefined,
        grossMargin: 0,
        netProfit: undefined,
        topProviders: [],
      };

      const realDashboardPayload: AdminDashboardDTO = {
        appointmentsToday: 0,
        appointmentsThisMonth: 0,
        activeProvidersThisMonth: 1,
        newProvidersThisMonth: 0,
        completedAppointmentsThisMonth: 0,
        cancelledAppointmentsThisMonth: 0,
        noShowAppointmentsThisMonth: 0,
        revenueThisMonth: 0,
        generatedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
      };

      render(
        <TabExecutivePulse
          economics={realBackendPayload}
          dashboard={realDashboardPayload}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Verify no +0% variation badges appear
      expect(screen.queryByText("+0%")).not.toBeInTheDocument();

      // Verify signal quality is PROVISIONAL, never promoted to CERTIFIED
      expect(screen.queryByText("Certificada")).not.toBeInTheDocument();
      expect(screen.queryByText("AUDITADA")).not.toBeInTheDocument();

      // Verify labels match truth:
      expect(screen.getByText("Recaudo de transacciones Stripe:")).toBeInTheDocument();
      expect(screen.getByText("Costo cloud estimado (GCP):")).toBeInTheDocument();
      expect(screen.getByText(/Volumen Clínico Agregado/i)).toBeInTheDocument();
      expect(screen.getByText(/Recaudo por Suscripciones/i)).toBeInTheDocument();

      // Verify API response timestamp note
      expect(screen.getAllByText(/Generado API:/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders 'No disponible' for GMV when totalGmv is missing/undefined, without falling back to totalRevenue", () => {
      const missingGmvEconomics: UnitEconomicsDTO = {
        totalUsers: 10,
        activeSubscriptions: 2,
        totalRevenue: 5000, // Existe totalRevenue, pero totalGmv es null
        totalSubscriptionsRevenue: 2000,
        totalCommissionsRevenue: 3000,
        cloudCosts: 100,
        stripeFees: 50,
        totalCosts: undefined,
        arpu: 500,
        grossMargin: 0.99,
        topProviders: [],
        salesByType: [],
        asOf: new Date(Date.now() - 3600 * 1000).toISOString(),
        period: "30d",
        reconciliationQuality: "PROVISIONAL",
      };

      render(
        <TabExecutivePulse
          economics={missingGmvEconomics}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // El KPI de Volumen Clínico Agregado debe mostrar "No disponible" y NO "$5,000.00"
      const gmvKpiTitle = screen.getByText(/Volumen Clínico Agregado/i);
      const gmvKpiCard = gmvKpiTitle.closest("div")?.parentElement;
      expect(gmvKpiCard).toBeTruthy();
      expect(within(gmvKpiCard!).queryByText("$5,000.00")).not.toBeInTheDocument();
      expect(within(gmvKpiCard!).getByText("No disponible")).toBeInTheDocument();
    });

    it("honors reconciliationQuality=PROVISIONAL without promoting revenue signals to CERTIFIED or AUDITADA even if costsQuality has CERTIFIED fees", () => {
      const provisionalEconomics: UnitEconomicsDTO = {
        totalUsers: 10,
        activeSubscriptions: 2,
        totalGmv: 4000,
        totalRevenue: 4000,
        totalSubscriptionsRevenue: 1800,
        totalCommissionsRevenue: 2200,
        cloudCosts: 50,
        stripeFees: 30,
        totalCosts: undefined,
        arpu: 400,
        grossMargin: 0.99,
        mrr: 1800,
        topProviders: [],
        salesByType: [],
        asOf: new Date(Date.now() - 3600 * 1000).toISOString(),
        period: "30d",
        reconciliationQuality: "PROVISIONAL",
        costsQuality: {
          stripeFees: "CERTIFIED", // Las tarifas de pasarela pueden estar auditadas por Stripe, pero NO certifican los ingresos
          cloudCosts: "PROVISIONAL",
        },
      };

      render(
        <TabExecutivePulse
          economics={provisionalEconomics}
          dashboard={null}
          productMetrics={null}
          providers={mockProviders}
          formatCurrency={formatCurrency}
          onNavigateTab={mockNavigateTab}
        />
      );

      // Señales de ingresos y GMV permanecen en calidad provisional / estimada (badge 'Estimado' en KpiCard y 'Calidad: PROVISIONAL' en tarjeta de decisiones)
      const estimatedBadges = screen.getAllByText("Estimado");
      expect(estimatedBadges.length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText(/Calidad:\s*PROVISIONAL/i).length).toBeGreaterThanOrEqual(1);

      // Nunca promover a CERTIFIED o AUDITADA
      expect(screen.queryByText("Certificado")).not.toBeInTheDocument();
      expect(screen.queryByText("Certificada")).not.toBeInTheDocument();
      expect(screen.queryByText("AUDITADA")).not.toBeInTheDocument();
    });
  });
});

