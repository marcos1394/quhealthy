import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  ConsumerPlatformBoundary,
  isAdministrativeSurface,
} from "@/components/layout/ConsumerPlatformBoundary";
import AdminLoginPage from "@/app/[locale]/admin/login/page";
import { AdminSidebar } from "@/app/[locale]/admin/dashboard/components/AdminSidebar";
import { AdminHeader } from "@/app/[locale]/admin/dashboard/components/AdminHeader";
import apiClient from "@/lib/axios";

// Mocks for Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

// Mocks for next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

// Mock Turnstile
vi.mock("@marsidev/react-turnstile", () => {
  const MockTurnstile = React.forwardRef(({ onSuccess }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => onSuccess && onSuccess("mock-turnstile-token"),
      reset: vi.fn(),
    }));
    return <div data-testid="mock-turnstile" />;
  });
  MockTurnstile.displayName = "MockTurnstile";
  return {
    Turnstile: MockTurnstile,
  };
});

// Mock auth-cookies
vi.mock("@/app/actions/auth-cookies", () => ({
  setAuthCookies: vi.fn().mockResolvedValue(undefined),
}));

// Mock axios
vi.mock("@/lib/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ADMIN-UX-01: Administrative Surface Isolation & Accessible UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
  });

  describe("1. Administrative Surface Detection (isAdministrativeSurface)", () => {
    it("identifies root /admin and its nested routes as administrative", () => {
      expect(isAdministrativeSurface("/admin")).toBe(true);
      expect(isAdministrativeSurface("/admin/")).toBe(true);
      expect(isAdministrativeSurface("/admin/login")).toBe(true);
      expect(isAdministrativeSurface("/admin/dashboard")).toBe(true);
    });

    it("identifies localized /:locale/admin routes as administrative", () => {
      expect(isAdministrativeSurface("/es/admin")).toBe(true);
      expect(isAdministrativeSurface("/en/admin/dashboard")).toBe(true);
      expect(isAdministrativeSurface("/pt/admin/login")).toBe(true);
    });

    it("identifies admin subdomains as administrative regardless of path", () => {
      expect(isAdministrativeSurface("/", "admin.quhealthy.org")).toBe(true);
      expect(isAdministrativeSurface("/dashboard", "admin.quhealthy.org")).toBe(true);
      expect(isAdministrativeSurface("/any-path", "admin.localhost")).toBe(true);
    });

    it("classifies public consumer routes as non-administrative", () => {
      expect(isAdministrativeSurface("/")).toBe(false);
      expect(isAdministrativeSurface("/es")).toBe(false);
      expect(isAdministrativeSurface("/en/doctors")).toBe(false);
      expect(isAdministrativeSurface("/es/search?q=pediatra")).toBe(false);
      expect(isAdministrativeSurface("/servicios", "www.quhealthy.org")).toBe(false);
    });
  });

  describe("2. Consumer Platform Boundary Isolation (<ConsumerPlatformBoundary>)", () => {
    it("renders consumer elements when accessed from public consumer routes", () => {
      mockPathname = "/es/doctors";

      render(<ConsumerPlatformBoundary />);

      // Consumer Pulso AI assistant is rendered on public consumer surface
      expect(
        screen.getByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).toBeInTheDocument();
    });

    it("renders NOTHING (null) and isolates surface when accessed from admin routes", () => {
      mockPathname = "/admin/dashboard";

      const { container } = render(<ConsumerPlatformBoundary />);

      expect(container.firstChild).toBeNull();
      expect(
        screen.queryByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).not.toBeInTheDocument();
    });

    it("renders NOTHING (null) when accessed from localized admin routes", () => {
      mockPathname = "/es/admin/login";

      const { container } = render(<ConsumerPlatformBoundary />);

      expect(container.firstChild).toBeNull();
      expect(
        screen.queryByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("3. Administrative Login Accessibility & Standards", () => {
    it("provides accessible labels properly associated with input elements", () => {
      render(<AdminLoginPage />);

      const emailInput = screen.getByLabelText(/correo corporativo/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("id", "admin-email");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete");

      const passwordInput = screen.getByLabelText(/contraseña/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("id", "admin-password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    it("announces errors in an accessible alert container with role='alert'", async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: "Credenciales corporativas inválidas" } },
      });

      render(<AdminLoginPage />);

      const emailInput = screen.getByLabelText(/correo corporativo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      fireEvent.change(emailInput, { target: { value: "admin@quhealthy.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrong-password" } });

      const submitBtn = screen.getByRole("button", { name: /ingresar al dashboard/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent("Credenciales corporativas inválidas");
        expect(errorAlert).toHaveAttribute("aria-live", "polite");
      });
    });

    it("has visible focus ring styling classes on critical interactive elements", () => {
      render(<AdminLoginPage />);

      const emailInput = screen.getByLabelText(/correo corporativo/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitBtn = screen.getByRole("button", { name: /ingresar al dashboard/i });

      expect(emailInput.className).toContain("focus:ring-2");
      expect(passwordInput.className).toContain("focus:ring-2");
      expect(submitBtn.className).toContain("focus-visible:ring-2");
    });
  });

  describe("4. Admin Navigation Semantics & Accessibility (Sidebar & Header)", () => {
    it("AdminSidebar contains role='tablist' with proper role='tab' and aria-selected items", () => {
      const onTabChange = vi.fn();

      render(
        <AdminSidebar
          activeTab="crm"
          onTabChange={onTabChange}
          pendingKycCount={2}
          unhealthyServicesCount={0}
        />
      );

      const tablist = screen.getByRole("tablist", { name: /pestañas de navegación administrativa/i });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThanOrEqual(8);

      // Find the active tab (crm)
      const crmTab = tabs.find((tab) => tab.getAttribute("aria-controls") === "admin-panel-crm");
      expect(crmTab).toBeDefined();
      expect(crmTab).toHaveAttribute("aria-selected", "true");

      // Other tabs should have aria-selected="false"
      const pulseTab = tabs.find((tab) => tab.getAttribute("aria-controls") === "admin-panel-pulse");
      expect(pulseTab).toBeDefined();
      expect(pulseTab).toHaveAttribute("aria-selected", "false");
    });

    it("AdminSidebar toggle collapse button reflects aria-expanded state", () => {
      render(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={vi.fn()}
          pendingKycCount={0}
          unhealthyServicesCount={0}
        />
      );

      const collapseBtn = screen.getByRole("button", { name: /colapsar menú lateral/i });
      expect(collapseBtn).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(collapseBtn);
      const expandBtn = screen.getByRole("button", { name: /expandir menú lateral/i });
      expect(expandBtn).toHaveAttribute("aria-expanded", "false");
    });

    it("AdminHeader includes role='tablist' for period filters and aria-busy on refresh", () => {
      const onSelectPeriod = vi.fn();
      const onRefresh = vi.fn();

      render(
        <AdminHeader
          selectedPeriod="7d"
          onSelectPeriod={onSelectPeriod}
          onRefresh={onRefresh}
          isRefreshing={false}
          onLogout={vi.fn()}
          isMobileOpen={false}
        />
      );

      const periodTablist = screen.getByRole("tablist", { name: /filtro de período de tiempo/i });
      expect(periodTablist).toBeInTheDocument();

      const period7dTab = screen.getByRole("tab", { name: /filtrar por últimos 7 días/i });
      expect(period7dTab).toHaveAttribute("aria-selected", "true");

      const period24hTab = screen.getByRole("tab", { name: /filtrar por últimas 24 horas/i });
      expect(period24hTab).toHaveAttribute("aria-selected", "false");

      const refreshBtn = screen.getByRole("button", { name: /actualizar datos/i });
      expect(refreshBtn).toHaveAttribute("aria-busy", "false");

      const mobileMenuBtn = screen.getByRole("button", { name: /abrir menú de navegación/i });
      expect(mobileMenuBtn).toHaveAttribute("aria-expanded", "false");
      expect(mobileMenuBtn).toHaveAttribute("aria-controls", "admin-mobile-sidebar");
    });

    it("AdminHeader updates aria-busy when isRefreshing is true", () => {
      render(
        <AdminHeader
          selectedPeriod="30d"
          onSelectPeriod={vi.fn()}
          onRefresh={vi.fn()}
          isRefreshing={true}
          onLogout={vi.fn()}
          isMobileOpen={true}
        />
      );

      const refreshBtn = screen.getByRole("button", { name: /actualizar datos/i });
      expect(refreshBtn).toHaveAttribute("aria-busy", "true");

      const mobileMenuBtn = screen.getByRole("button", { name: /cerrar menú de navegación/i });
      expect(mobileMenuBtn).toHaveAttribute("aria-expanded", "true");
    });
  });
});
