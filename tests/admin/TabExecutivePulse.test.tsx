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

describe("TabExecutivePulse (PORT-E-01 & HU #43 Compliance)", () => {
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

  it("renders the 3 Essential CEO Decisions (PORT-E-01) with their status badges and approved actions", () => {
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

    // Title and container
    expect(
      screen.getByText("Las Tres Decisiones Esenciales del CEO (PORT-E-01)")
    ).toBeInTheDocument();

    // Decision 1: Producto & Activación
    expect(screen.getByText("1. Producto & Activación")).toBeInTheDocument();
    expect(screen.getByText("PILOTO CONTROLADO")).toBeInTheDocument();
    expect(
      screen.getByText(/No abrir a tráfico masivo\. Ejecutar piloto cerrado con 10 médicos/i)
    ).toBeInTheDocument();

    // Decision 2: Demanda & Monetización
    expect(screen.getByText("2. Demanda & Monetización")).toBeInTheDocument();
    expect(screen.getByText("CONGELAR PAUTA")).toBeInTheDocument();
    expect(
      screen.getByText(/\$0 en Meta\/Google Ads\. Prohibir pauta pagada/i)
    ).toBeInTheDocument();

    // Decision 3: Riesgo Operativo & FinOps
    expect(screen.getByText("3. Riesgo Operativo & FinOps")).toBeInTheDocument();
    expect(screen.getByText("OPTIMIZACIÓN ACTIVA")).toBeInTheDocument();
    expect(
      screen.getByText(/Liberar IP estática, evaluar minScale=0 en Auth/i)
    ).toBeInTheDocument();

    // Default cutoff date when economics is null
    expect(screen.getByText(/Corte: 2026-10-10/i)).toBeInTheDocument();
  });

  it("formats the asOf cut-off date faithfully when economics provides an asOf timestamp", () => {
    const mockEconomics: UnitEconomicsDTO = {
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
      asOf: "2026-10-09T18:30:00Z",
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
        economics={mockEconomics}
        dashboard={null}
        productMetrics={null}
        providers={mockProviders}
        formatCurrency={formatCurrency}
        onNavigateTab={mockNavigateTab}
      />
    );

    const expectedDate = new Date("2026-10-09T18:30:00Z").toLocaleDateString("es-MX");
    expect(screen.getByText(new RegExp(`Corte: ${expectedDate}`, "i"))).toBeInTheDocument();
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
