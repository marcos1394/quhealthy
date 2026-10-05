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

// Mock Vercel Analytics & Speed Insights
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));

// Mock PublicLayoutShell
vi.mock("@/components/layout/PublicLayoutShell", () => ({
  PublicLayoutShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-layout-shell">{children}</div>
  ),
}));

import PublicLayout from "@/app/[locale]/(public)/layout";
import AdminLayout from "@/app/[locale]/admin/layout";

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
    it("renders consumer elements, Vercel Analytics and SpeedInsights when accessed from public consumer routes", () => {
      mockPathname = "/es/doctors";

      render(<ConsumerPlatformBoundary />);

      // Consumer Pulso AI assistant is rendered on public consumer surface
      expect(
        screen.getByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).toBeInTheDocument();

      // Vercel Analytics & SpeedInsights are loaded on consumer surface
      expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
      expect(screen.getByTestId("vercel-speed-insights")).toBeInTheDocument();
    });

    it("renders NOTHING (null) and isolates surface (blocking Analytics & SpeedInsights) when accessed from admin routes", () => {
      mockPathname = "/admin/dashboard";

      const { container } = render(<ConsumerPlatformBoundary />);

      expect(container.firstChild).toBeNull();
      expect(
        screen.queryByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
      expect(screen.queryByTestId("vercel-speed-insights")).not.toBeInTheDocument();
    });

    it("renders NOTHING (null) when accessed from localized admin routes", () => {
      mockPathname = "/es/admin/login";

      const { container } = render(<ConsumerPlatformBoundary />);

      expect(container.firstChild).toBeNull();
      expect(
        screen.queryByRole("button", { name: /abrir asistente de salud pulso ai/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
      expect(screen.queryByTestId("vercel-speed-insights")).not.toBeInTheDocument();
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

    it("implements WAI-ARIA roving tabindex on AdminSidebar tabs (only active tab has tabIndex=0)", () => {
      render(
        <AdminSidebar
          activeTab="crm"
          onTabChange={vi.fn()}
          pendingKycCount={0}
          unhealthyServicesCount={0}
        />
      );

      const crmTab = screen.getByRole("tab", { name: /Admin CRM & Leads/i });
      expect(crmTab).toHaveAttribute("tabindex", "0");

      const pulseTab = screen.getByRole("tab", { name: /Executive Pulse/i });
      expect(pulseTab).toHaveAttribute("tabindex", "-1");

      const financesTab = screen.getByRole("tab", { name: /Finanzas & SaaS/i });
      expect(financesTab).toHaveAttribute("tabindex", "-1");
    });

    it("navigates AdminSidebar tabs using vertical arrow keys (ArrowDown, ArrowUp, Home, End)", () => {
      const onTabChange = vi.fn();
      render(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={onTabChange}
          pendingKycCount={0}
          unhealthyServicesCount={0}
        />
      );

      const pulseTab = screen.getByRole("tab", { name: /Executive Pulse/i });

      // ArrowDown -> next tab (crm)
      fireEvent.keyDown(pulseTab, { key: "ArrowDown" });
      expect(onTabChange).toHaveBeenCalledWith("crm");

      // ArrowUp from pulse -> wraps around to last tab (health)
      fireEvent.keyDown(pulseTab, { key: "ArrowUp" });
      expect(onTabChange).toHaveBeenCalledWith("health");

      // End -> last tab (health)
      fireEvent.keyDown(pulseTab, { key: "End" });
      expect(onTabChange).toHaveBeenCalledWith("health");

      // Home -> first tab (pulse)
      fireEvent.keyDown(pulseTab, { key: "Home" });
      expect(onTabChange).toHaveBeenCalledWith("pulse");
    });

    it("implements roving tabindex and horizontal arrow navigation on AdminHeader period tabs", () => {
      const onSelectPeriod = vi.fn();
      render(
        <AdminHeader
          selectedPeriod="24h"
          onSelectPeriod={onSelectPeriod}
          onRefresh={vi.fn()}
          isRefreshing={false}
          onLogout={vi.fn()}
          isMobileOpen={false}
        />
      );

      const tab24h = screen.getByRole("tab", { name: /filtrar por últimas 24 horas/i });
      const tab7d = screen.getByRole("tab", { name: /filtrar por últimos 7 días/i });

      expect(tab24h).toHaveAttribute("tabindex", "0");
      expect(tab7d).toHaveAttribute("tabindex", "-1");

      // ArrowRight -> next period (7d)
      fireEvent.keyDown(tab24h, { key: "ArrowRight" });
      expect(onSelectPeriod).toHaveBeenCalledWith("7d");

      // ArrowLeft from 24h -> wraps to last period (month)
      fireEvent.keyDown(tab24h, { key: "ArrowLeft" });
      expect(onSelectPeriod).toHaveBeenCalledWith("month");
    });
  });

  describe("5. Mobile Drawer Focus Management & Accessibility", () => {
    it("focuses the close button initially when the mobile drawer opens", async () => {
      render(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={vi.fn()}
          isMobileOpen={true}
          onCloseMobile={vi.fn()}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /cerrar menú lateral/i });
      await waitFor(() => {
        expect(document.activeElement).toBe(closeBtn);
      });
    });

    it("traps focus inside the mobile drawer on Tab and Shift+Tab", async () => {
      render(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={vi.fn()}
          isMobileOpen={true}
          onCloseMobile={vi.fn()}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /cerrar menú lateral/i });
      const mobileDialog = document.getElementById("admin-mobile-sidebar")!;
      const mobileTabs = mobileDialog.querySelectorAll<HTMLElement>('[role="tab"]');
      const lastInteractive = mobileTabs[mobileTabs.length - 1];

      // Shift+Tab from close button (first interactive element) wraps to last interactive element
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(lastInteractive);

      // Tab from last interactive element wraps back to close button
      lastInteractive.focus();
      expect(document.activeElement).toBe(lastInteractive);
      fireEvent.keyDown(window, { key: "Tab", shiftKey: false });
      expect(document.activeElement).toBe(closeBtn);
    });

    it("closes mobile drawer on Escape and restores focus to previous element", async () => {
      const onCloseMobile = vi.fn();

      // Create an outside trigger button and focus it
      const triggerBtn = document.createElement("button");
      triggerBtn.textContent = "Open Menu";
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      const { rerender } = render(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={vi.fn()}
          isMobileOpen={true}
          onCloseMobile={onCloseMobile}
        />
      );

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onCloseMobile).toHaveBeenCalled();

      // Rerender as closed
      rerender(
        <AdminSidebar
          activeTab="pulse"
          onTabChange={vi.fn()}
          isMobileOpen={false}
          onCloseMobile={onCloseMobile}
        />
      );

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(triggerBtn);
      document.body.removeChild(triggerBtn);
    });
  });

  describe("6. Layout Tree Isolation & Metadata", () => {
    it("PublicLayout injects Schema.org JSON-LD for consumer search engines", async () => {
      const publicContent = await PublicLayout({
        children: <div data-testid="child-page">Public Page</div>,
        params: Promise.resolve({ locale: "es" }),
      });

      const { container } = render(publicContent);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
      expect(script?.innerHTML).toContain("https://schema.org");
      expect(script?.innerHTML).toContain("QuHealthy");
      expect(screen.getByTestId("child-page")).toBeInTheDocument();
    });

    it("AdminLayout does NOT contain any Schema.org JSON-LD or consumer scripts", () => {
      const { container } = render(
        <AdminLayout>
          <div data-testid="admin-page">Admin Dashboard</div>
        </AdminLayout>
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeNull();
      expect(screen.getByTestId("admin-page")).toBeInTheDocument();
    });
  });
});
