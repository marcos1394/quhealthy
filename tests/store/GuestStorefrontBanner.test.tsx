import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestStorefrontBanner } from "@/components/store/GuestStorefrontBanner";
import { useSessionStore } from "@/stores/SessionStore";

vi.mock("next-intl", () => ({
  useLocale: () => "es",
  useTranslations: () => (key: string, opts?: any) => opts?.defaultValue || key,
}));

describe("GuestStorefrontBanner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,
    });
  });

  it("renders invitation banner when user is not authenticated", () => {
    render(
      <GuestStorefrontBanner
        storeName="Farmacia del Sol"
        slug="farmacia-del-sol"
        type="store"
      />
    );

    const banner = screen.getByTestId("guest-storefront-banner");
    expect(banner).toBeDefined();
    expect(screen.getByText("¿Primera vez en Farmacia del Sol?")).toBeDefined();

    const registerBtn = screen.getByTestId("guest-banner-register-btn");
    expect(registerBtn).toBeDefined();
    expect(registerBtn.getAttribute("href")).toContain("/es/register");

    const loginBtn = screen.getByTestId("guest-banner-login-btn");
    expect(loginBtn).toBeDefined();
    expect(loginBtn.getAttribute("href")).toContain("/es/login");
  });

  it("renders product-specific prompt when type is product", () => {
    render(
      <GuestStorefrontBanner
        storeName="Farmacia del Sol"
        slug="60-cartucho-ta"
        type="product"
      />
    );

    expect(
      screen.getByText("¿Deseas adquirir este ítem o agendar una cita?")
    ).toBeDefined();
  });

  it("does not render when user is authenticated", () => {
    useSessionStore.setState({
      token: "valid-jwt-token",
      user: { id: 42, email: "paciente@quhealthy.org" } as any,
      isAuthenticated: true,
      role: "PATIENT" as any,
    });

    const { container } = render(
      <GuestStorefrontBanner
        storeName="Farmacia del Sol"
        slug="farmacia-del-sol"
        type="store"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("guest-storefront-banner")).toBeNull();
  });

  it("dismisses the banner when user clicks close button", () => {
    render(
      <GuestStorefrontBanner
        storeName="Farmacia del Sol"
        slug="farmacia-del-sol"
        type="store"
      />
    );

    const closeBtn = screen.getByTestId("guest-banner-close-btn");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("guest-storefront-banner")).toBeNull();
  });
});
