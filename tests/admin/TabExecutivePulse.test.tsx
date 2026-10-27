import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TabExecutivePulse } from "@/app/[locale]/admin/dashboard/tabs/TabExecutivePulse";
import type {
  AdminDashboardDTO,
  MicroserviceHealthDTO,
  ProductMetricsDTO,
  ProviderAdminDTO,
  UnitEconomicsDTO,
} from "@/services/admin.service";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

const formatCurrency = (val: number) => `$${val.toFixed(2)} MXN`;

function buildBaseProps() {
  const nowIso = new Date().toISOString();

  const dashboard: AdminDashboardDTO = {
    appointmentsToday: 4,
    appointmentsThisMonth: 42,
    activeProvidersThisMonth: 11,
    newProvidersThisMonth: 3,
    completedAppointmentsThisMonth: 31,
    cancelledAppointmentsThisMonth: 5,
    noShowAppointmentsThisMonth: 2,
    revenueThisMonth: 18500,
    generatedAt: nowIso,
  };

  const economics: UnitEconomicsDTO = {
    totalUsers: 120,
    activeSubscriptions: 18,
    totalRevenue: 24000,
    totalSubscriptionsRevenue: 15000,
    totalCommissionsRevenue: 9000,
    onlineRevenue: 14000,
    inClinicRevenue: 8000,
    totalGmv: 22000,
    cloudCosts: 110,
    stripeFees: 864,
    mrr: 15000,
    arr: 180000,
    churnRate: 2.5,
    planTiers: [],
    reconciliationMatch: false,
    reconciliationQuality: "PROVISIONAL",
    reconciliationNotes: "Conciliación bancaria en proceso",
    isEstimatedScenario: true,
    costsQuality: {
      stripeFees: "PROVISIONAL",
      cloudCosts: "PROVISIONAL",
      totalCosts: "UNAVAILABLE",
      netProfit: "UNAVAILABLE",
    },
    asOf: nowIso,
    period: "30d",
    salesByType: [],
    arpu: 200,
    grossMargin: 23136,
    topProviders: [],
  };

  const productMetrics: ProductMetricsDTO = {
    dau: 12,
    wau: 38,
    mau: 80,
    stickinessRatio: 15,
    totalSessionsMonth: 210,
    activeProvidersMonth: 11,
    activePatientsMonth: 69,
    avgSessionDurationMinutes: 8.4,
    avgProviderSessionDurationMinutes: 14.2,
    avgPatientSessionDurationMinutes: 5.1,
    topModules: [],
    dauTrends: [],
    providerOnboardingFunnel: [],
    patientBookingFunnel: [],
    asOf: nowIso,
  };

  const providers: ProviderAdminDTO[] = [];
  const services: MicroserviceHealthDTO[] = [
    {
      name: "Payment Service",
      serviceKey: "payment-service",
      port: 8083,
      status: "UP",
      latencyMs: 12,
      version: "v1",
      uptime: "ACTIVE",
      lastChecked: nowIso,
      quality: "CERTIFIED",
    },
    {
      name: "Analytics Service",
      serviceKey: "analytics-service",
      port: 8087,
      status: "UP",
      latencyMs: 45,
      version: "v1",
      uptime: "ACTIVE",
      lastChecked: nowIso,
      quality: "CERTIFIED",
    },
  ];

  return {
    dashboard,
    economics,
    productMetrics,
    providers,
    services,
    selectedPeriod: "30d",
    formatCurrency,
    onNavigateTab: vi.fn(),
  };
}

describe("TabExecutivePulse — Real Connected Signals & Decluttered UI", () => {
  it("renders connected GMV, Stripe Revenue, Gross Margin Post-Stripe, and StartupAristasRadar", () => {
    const props = buildBaseProps();
    render(<TabExecutivePulse {...props} />);

    expect(screen.getByTestId("startup-aristas-radar")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-gross-margin-value")).toHaveTextContent("$23136.00 MXN");
    expect(screen.getByTestId("pulse-infra-card")).toHaveTextContent("2/2 UP");
  });

  it("renders 'No disponible' when economics is null", () => {
    const props = buildBaseProps();
    render(<TabExecutivePulse {...props} economics={null} />);

    expect(screen.getByTestId("pulse-gross-margin-value")).toHaveTextContent("No disponible");
  });
});
