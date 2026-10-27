import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TabFoundations } from "@/app/[locale]/admin/dashboard/tabs/TabFoundations";
import { adminService } from "@/services/admin.service";

vi.mock("@/services/admin.service", () => ({
  adminService: {
    getFoundations: vi.fn(),
    updateFoundationVerification: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("COM-FOUNDATION-02: TabFoundations Impact Table & KYB Governance", () => {
  const mockFoundations = [
    {
      id: 1,
      legalName: "Fundación Cardio Infantil AC",
      brandName: "CardioKids",
      organizationType: "CIVIL_ASSOCIATION",
      rfc: "FCI100201AB9",
      cluniNumber: "FCI10020109012",
      contactEmail: "contacto@cardiokids.org",
      contactPhone: "+52 55 1234 5678",
      isAuthorizedDonatary: true,
      activeProgramsCount: 3,
      totalBeneficiariesCount: 150,
      totalDisbursedBudget: 45000,
      verificationStatus: "APPROVED",
    },
    {
      id: 2,
      legalName: "Fundación Sonrisas de Vida IAP",
      brandName: "Sonrisas IAP",
      organizationType: "IAP",
      rfc: "FSV150612XY1",
      cluniNumber: "FSV15061209033",
      contactEmail: "ayuda@sonrisas.org",
      contactPhone: "+52 55 9876 5432",
      isAuthorizedDonatary: false,
      activeProgramsCount: 1,
      totalBeneficiariesCount: 40,
      totalDisbursedBudget: 12000,
      verificationStatus: "PENDING",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getFoundations as any).mockResolvedValue({
      content: mockFoundations,
      totalElements: 2,
    });
  });

  it("renders the foundation impact table with data-testid='admin-foundation-impact-table'", async () => {
    render(<TabFoundations />);

    await waitFor(() => {
      expect(screen.getByTestId("admin-foundation-impact-table")).toBeInTheDocument();
    });

    // Check institutions are rendered
    expect(screen.getByText("Fundación Cardio Infantil AC")).toBeInTheDocument();
    expect(screen.getByText("Fundación Sonrisas de Vida IAP")).toBeInTheDocument();

    // Check beneficiaries and impact metrics
    expect(screen.getByText("150 Beneficiarios")).toBeInTheDocument();
    expect(screen.getByText("40 Beneficiarios")).toBeInTheDocument();
    expect(screen.getByText("3 Programas Activos")).toBeInTheDocument();
    expect(screen.getByText("$45,000")).toBeInTheDocument();

    // Check verification status
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });
});
