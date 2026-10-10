import React from "react";
import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabUnitEconomics } from "@/app/[locale]/admin/dashboard/tabs/TabUnitEconomics";
import { UnitEconomicsDTO } from "@/services/admin.service";

// Mock ResizeObserver for recharts ResponsiveContainer in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("TabUnitEconomics (ADMIN-TRUST-01 Compliance)", () => {
  const formatCurrency = (val: number) => `$${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  it("renders UNAVAILABLE badges and 'No disponible' when costs and net profit are uncertified/null", () => {
    const uncertifiedEconomics: UnitEconomicsDTO = {
      totalUsers: 100,
      activeSubscriptions: 0,
      totalRevenue: 0,
      totalSubscriptionsRevenue: 0,
      totalCommissionsRevenue: 0,
      cloudCosts: 500, // Partial GCP cost
      stripeFees: 150, // Partial Stripe fee
      totalCosts: undefined, // Total operating costs missing -> null
      arpu: 0,
      costPerUser: undefined, // Unavailable
      grossMargin: 0,
      netProfit: undefined, // Unavailable
      topProviders: [],
      salesByType: [],
      asOf: "2026-10-09T20:00:00Z",
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
      <TabUnitEconomics
        economics={uncertifiedEconomics}
        selectedPeriod="30d"
        formatCurrency={formatCurrency}
      />
    );

    // Costo Operativo Total should be No disponible (not summing 500 + 150)
    expect(screen.getByText("Costo Operativo Total")).toBeInTheDocument();
    expect(screen.queryByText("$650.00")).not.toBeInTheDocument();

    // CPAU should be No disponible
    expect(screen.getByText("Costo por Usuario (CPAU)")).toBeInTheDocument();

    // Margen Neto Global should be No disponible
    expect(screen.getByText("Margen Neto Global")).toBeInTheDocument();

    // There should be multiple "No disponible" labels
    const unavailableBadges = screen.getAllByText(/No disponible/i);
    expect(unavailableBadges.length).toBeGreaterThan(0);
  });

  it("renders certified values when full data is provided", () => {
    const certifiedEconomics: UnitEconomicsDTO = {
      totalUsers: 100,
      activeSubscriptions: 5,
      totalRevenue: 10000,
      totalSubscriptionsRevenue: 9000,
      totalCommissionsRevenue: 1000,
      cloudCosts: 2000,
      stripeFees: 500,
      aiCosts: 300,
      satFacturamaCosts: 100,
      communicationsCosts: 100,
      totalCosts: 3000,
      arpu: 100,
      costPerUser: 30,
      grossMargin: 9500,
      netProfit: 7000,
      topProviders: [],
      salesByType: [],
      asOf: "2026-10-09T20:00:00Z",
      period: "30d",
      costsQuality: {
        stripeFees: "CERTIFIED",
        cloudCosts: "CERTIFIED",
        aiCosts: "CERTIFIED",
        satFacturamaCosts: "CERTIFIED",
        communicationsCosts: "CERTIFIED",
        totalCosts: "CERTIFIED",
        costPerUser: "CERTIFIED",
        netProfit: "CERTIFIED",
      },
    };

    render(
      <TabUnitEconomics
        economics={certifiedEconomics}
        selectedPeriod="30d"
        formatCurrency={formatCurrency}
      />
    );

    expect(screen.getByText("Costo Operativo Total")).toBeInTheDocument();
    expect(screen.getByText("$3,000.00")).toBeInTheDocument();
    expect(screen.getAllByText("$30.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$7,000.00")).toBeInTheDocument();
  });
});
