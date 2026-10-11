import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabExecutivePulse } from "@/app/[locale]/admin/dashboard/tabs/TabExecutivePulse";
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

describe("TabExecutivePulse (PORT-E-01 & HU #43 Compliance - Veracidad y Gobernanza)", () => {
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

  it("renders the 3 CEO axes as Board Proposals with PENDING human approval, provenance sources and data quality", () => {
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

    // Title clarifies they are Board Proposals under preliminary diagnosis
    expect(
      screen.getByText(/Las Tres Decisiones Esenciales del CEO \(PORT-E-01\) — Propuestas a Junta/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Requieren ratificación humana de la Junta Directiva/i)
    ).toBeInTheDocument();

    // Never present unverified recommendations as already approved actions
    expect(screen.queryByText("Acción Aprobada:")).not.toBeInTheDocument();
    expect(screen.queryByText(/evidencia certificada/i)).not.toBeInTheDocument();

    // Board proposal badges and pending status
    const proposalBadges = screen.getAllByText("PROPUESTA A JUNTA");
    expect(proposalBadges.length).toBe(3);

    const pendingDecisions = screen.getAllByText(/Decisión: PENDIENTE/i);
    expect(pendingDecisions.length).toBe(3);

    // Eje 1: Producto & Activación
    expect(screen.getByText("1. Eje Producto & Activación")).toBeInTheDocument();
    expect(screen.getByText(/Fuente: DB Logs & appointment-service/i)).toBeInTheDocument();
    expect(screen.getByText(/Calidad: PROVISIONAL/i)).toBeInTheDocument();

    // Eje 2: Demanda & Monetización
    expect(screen.getByText("2. Eje Demanda & Monetización")).toBeInTheDocument();
    expect(screen.getByText(/Fuente: Stripe Events & analytics-service/i)).toBeInTheDocument();
    expect(screen.getByText(/Calidad: AUDITADA/i)).toBeInTheDocument();

    // Eje 3: Riesgo Operativo & FinOps
    expect(screen.getByText("3. Eje Riesgo Operativo & FinOps")).toBeInTheDocument();
    expect(screen.getByText(/Fuente: GCP Billing & Cloudflare Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Calidad: ESTIMADA/i)).toBeInTheDocument();
  });

  it("renders empty telemetry state banner and 'Sin corte verificado' when data is null", () => {
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

    // Empty state banner
    expect(
      screen.getByText(/Telemetría no conectada \(Estado Vacío \/ Diagnóstico Preliminar\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Corte: Sin corte verificado/i)).toBeInTheDocument();
    // Must NOT fabricate a default date
    expect(screen.queryByText(/Corte: 2026-10-10/i)).not.toBeInTheDocument();
  });

  it("renders stale data warning when asOf timestamp is older than 48 hours", () => {
    const staleDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const staleEconomics: UnitEconomicsDTO = {
      totalUsers: 10,
      activeSubscriptions: 0,
      totalRevenue: 0,
      totalSubscriptionsRevenue: 0,
      totalCommissionsRevenue: 0,
      cloudCosts: 0,
      stripeFees: 0,
      totalCosts: 0,
      arpu: 0,
      grossMargin: 0,
      topProviders: [],
      salesByType: [],
      asOf: staleDate,
      period: "30d",
      costsQuality: {
        stripeFees: "PROVISIONAL",
        cloudCosts: "PROVISIONAL",
        aiCosts: "UNAVAILABLE",
        satFacturamaCosts: "UNAVAILABLE",
        communicationsCosts: "UNAVAILABLE",
        totalCosts: "UNAVAILABLE",
        costPerUser: "UNAVAILABLE",
        netProfit: "UNAVAILABLE",
      },
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

    // Stale telemetry badge
    expect(screen.getByText(/Dato obsoleto \(>48h\)/i)).toBeInTheDocument();
  });

  it("formats the asOf cut-off date faithfully when fresh economics data is provided", () => {
    const freshDate = new Date().toISOString();
    const freshEconomics: UnitEconomicsDTO = {
      totalUsers: 12,
      activeSubscriptions: 0,
      totalRevenue: 0,
      totalSubscriptionsRevenue: 0,
      totalCommissionsRevenue: 0,
      cloudCosts: 0,
      stripeFees: 0,
      totalCosts: 0,
      arpu: 0,
      grossMargin: 0,
      topProviders: [],
      salesByType: [],
      asOf: freshDate,
      period: "30d",
      costsQuality: {
        stripeFees: "PROVISIONAL",
        cloudCosts: "PROVISIONAL",
        aiCosts: "UNAVAILABLE",
        satFacturamaCosts: "UNAVAILABLE",
        communicationsCosts: "UNAVAILABLE",
        totalCosts: "UNAVAILABLE",
        costPerUser: "UNAVAILABLE",
        netProfit: "UNAVAILABLE",
      },
    };

    render(
      <TabExecutivePulse
        economics={freshEconomics}
        dashboard={null}
        productMetrics={null}
        providers={mockProviders}
        formatCurrency={formatCurrency}
        onNavigateTab={mockNavigateTab}
      />
    );

    const expectedDate = new Date(freshDate).toLocaleDateString("es-MX");
    expect(screen.getByText(new RegExp(`Corte: ${expectedDate}`, "i"))).toBeInTheDocument();
    expect(screen.queryByText(/Dato obsoleto \(>48h\)/i)).not.toBeInTheDocument();
  });

  it("obeys ADMIN-TRUST-01 by rendering 'No disponible' for uncertified metrics instead of fabricated figures", () => {
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

    const unavailableLabels = screen.getAllByText(/No disponible/i);
    expect(unavailableLabels.length).toBeGreaterThanOrEqual(1);

    // Hardcoded fake numbers from old issues must not exist
    expect(screen.queryByText("$124,500 MXN")).not.toBeInTheDocument();
    expect(screen.queryByText("1,420")).not.toBeInTheDocument();
  });
});
