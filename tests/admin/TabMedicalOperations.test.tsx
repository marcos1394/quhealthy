import React from "react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabMedicalOperations } from "@/app/[locale]/admin/dashboard/tabs/TabMedicalOperations";
import { AdminDashboardDTO, ProviderAdminDTO } from "@/services/admin.service";

// Mock ResizeObserver for recharts ResponsiveContainer in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("TabMedicalOperations (ADMIN-TRUST-01 & PORT-C-01 Compliance)", () => {
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

  it("renders 'No disponible' and zeroes instead of synthetic hardcoded fixtures when dashboard is null", () => {
    render(
      <TabMedicalOperations
        dashboard={null}
        providers={mockProviders}
        onRefreshProviders={vi.fn()}
      />
    );

    // KpiCards must display "No disponible" instead of 12, 180, 34, 8
    const unavailableLabels = screen.getAllByText(/No disponible/i);
    expect(unavailableLabels.length).toBeGreaterThanOrEqual(4);

    // Hardcoded fixtures must NEVER appear
    expect(screen.queryByText("142")).not.toBeInTheDocument();
    expect(screen.queryByText("180")).not.toBeInTheDocument();
    expect(screen.queryByText("78.9%")).not.toBeInTheDocument();

    // Attendance rate badge should display "No disponible"
    expect(screen.getByText(/Tasa de Asistencia: No disponible/i)).toBeInTheDocument();
  });

  it("renders exact zeroes faithfully without falling back to synthetic fixtures when metrics are 0", () => {
    const zeroDashboard: AdminDashboardDTO = {
      appointmentsToday: 0,
      appointmentsThisMonth: 0,
      activeProvidersThisMonth: 0,
      newProvidersThisMonth: 0,
      completedAppointmentsThisMonth: 0,
      cancelledAppointmentsThisMonth: 0,
      noShowAppointmentsThisMonth: 0,
      revenueThisMonth: 0,
      generatedAt: "2026-10-10T12:00:00Z",
    };

    render(
      <TabMedicalOperations
        dashboard={zeroDashboard}
        providers={mockProviders}
        onRefreshProviders={vi.fn()}
      />
    );

    // Must show genuine zeroes, NOT synthetic fallback numbers (142, 24, 14, 12, etc.)
    expect(screen.queryByText("142")).not.toBeInTheDocument();
    expect(screen.queryByText("24")).not.toBeInTheDocument();
    expect(screen.queryByText("180")).not.toBeInTheDocument();
    expect(screen.queryByText("78.9%")).not.toBeInTheDocument();

    // Since total evaluated is 0, attendance rate should be "No disponible"
    expect(screen.getByText(/Tasa de Asistencia: No disponible/i)).toBeInTheDocument();
  });

  it("computes dynamic attendance rate accurately when real data is present", () => {
    const activeDashboard: AdminDashboardDTO = {
      appointmentsToday: 5,
      appointmentsThisMonth: 20,
      activeProvidersThisMonth: 4,
      newProvidersThisMonth: 2,
      completedAppointmentsThisMonth: 8,
      cancelledAppointmentsThisMonth: 1,
      noShowAppointmentsThisMonth: 1,
      revenueThisMonth: 4500,
      generatedAt: "2026-10-10T12:00:00Z",
    };

    render(
      <TabMedicalOperations
        dashboard={activeDashboard}
        providers={mockProviders}
        onRefreshProviders={vi.fn()}
      />
    );

    // Total evaluated = 8 + 1 + 1 = 10. Completed = 8 -> 80.0%
    expect(screen.getByText(/Tasa de Asistencia: 80.0%/i)).toBeInTheDocument();
    expect(screen.queryByText("78.9%")).not.toBeInTheDocument();
  });
});
