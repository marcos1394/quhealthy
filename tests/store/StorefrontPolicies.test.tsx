import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { StorefrontHero } from "@/components/store/StorefrontHero";
import { StorefrontData } from "@/types/storefront";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, options?: { defaultValue?: string }) => {
    const translations: Record<string, string> = {
      cancellation_policy_title: "Política de Cancelación",
      our_team: "Nuestro Equipo",
      schedule_appointment: "Agendar Cita",
      book_now: "Reservar",
      starting_from: "Desde",
      certified_provider: "Verificado",
    };
    return translations[key] || options?.defaultValue || key;
  },
  useLocale: () => "es",
}));

vi.mock("@/components/ui/FavoriteButton", () => ({
  FavoriteButton: () => <button data-testid="favorite-btn">Fav</button>,
}));
vi.mock("@/components/store/QuScoreModal", () => ({
  QuScoreModal: () => null,
}));
vi.mock("@/components/store/QuickAvailability", () => ({
  QuickAvailability: () => null,
}));

describe("Storefront Policies Intelligence (Cancellation vs Return vs Hybrid)", () => {
  const baseStore: StorefrontData = {
    providerId: 34,
    displayName: "Asap Medix",
    slug: "asap-medix",
    bio: "Distribuidora de insumos médicos de alta especialidad.",
    logoUrl: null,
    bannerUrl: null,
    primaryColor: "#059669",
    whatsappEnabled: true,
    instagramUrl: null,
    phone: "6688821862",
    rating: 5.0,
    reviewsCount: 10,
    services: [],
    packages: [],
    courses: [],
    products: [],
  };

  it("renders only Return Policy for a supplier of medical supplies", () => {
    const supplierStore: StorefrontData = {
      ...baseStore,
      providerType: "SUPPLIER",
      returnPolicy: "Devoluciones dentro de 7 días naturales con empaque estéril sellado.",
      cancellationPolicy: undefined,
    };

    render(
      <StorefrontHero
        store={supplierStore}
        isFavorited={false}
      />
    );

    // Shows return policy
    expect(
      screen.getByText("Política de Devolución y Garantías")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Devoluciones dentro de 7 días naturales con empaque estéril sellado/i)
    ).toBeInTheDocument();

    // Does NOT show cancellation policy
    expect(
      screen.queryByText("Política de Cancelación y Reprogramación")
    ).not.toBeInTheDocument();
  });

  it("renders only Cancellation Policy for a clinical doctor with medical appointments", () => {
    const doctorStore: StorefrontData = {
      ...baseStore,
      displayName: "Dra. Sofía Morales",
      slug: "dra-sofia-morales",
      providerType: "DOCTOR",
      cancellationPolicy: "Cancelación flexible hasta 24 horas antes sin costo.",
      returnPolicy: undefined,
      services: [
        {
          id: 1,
          type: "SERVICE",
          category: "Consulta",
          name: "Consulta Dermatológica",
          description: "Revisión especializada",
          price: 800,
        },
      ],
    };

    render(
      <StorefrontHero
        store={doctorStore}
        isFavorited={false}
      />
    );

    // Shows cancellation policy
    expect(
      screen.getByText("Política de Cancelación y Reprogramación")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cancelación flexible hasta 24 horas antes sin costo/i)
    ).toBeInTheDocument();

    // Does NOT show return policy
    expect(
      screen.queryByText("Política de Devolución y Garantías")
    ).not.toBeInTheDocument();
  });

  it("renders interactive switcher for Hybrid providers (both cancellation and return configured)", () => {
    const hybridStore: StorefrontData = {
      ...baseStore,
      displayName: "Clínica Dermatológica & Dermofarmacia",
      slug: "clinica-dermatologica",
      providerType: "CLINIC",
      cancellationPolicy: "Citas: Cancelación hasta 48h previas.",
      returnPolicy: "Productos: Devolución en 15 días con sello intacto.",
      services: [
        {
          id: 1,
          type: "SERVICE",
          category: "Consulta",
          name: "Consulta Facial",
          description: "Limpieza médica",
          price: 1200,
        },
      ],
      products: [
        {
          id: 201,
          type: "PRODUCT",
          category: "Dermocosmética",
          name: "Protector Solar Médico FPS 50+",
          description: "Protección dermatológica",
          price: 650,
        },
      ],
    };

    render(
      <StorefrontHero
        store={hybridStore}
        isFavorited={false}
      />
    );

    // Both switch tabs exist
    const appointmentsTab = screen.getByText("Citas Médicas");
    const productsTab = screen.getByText("Insumos y Productos");

    expect(appointmentsTab).toBeInTheDocument();
    expect(productsTab).toBeInTheDocument();

    // Default active is appointments cancellation
    expect(
      screen.getByText("Política de Cancelación y Reprogramación")
    ).toBeInTheDocument();
    expect(screen.getByText(/Citas: Cancelación hasta 48h previas/i)).toBeInTheDocument();

    // Click on Products tab
    fireEvent.click(productsTab);

    // Now shows return policy
    expect(
      screen.getByText("Política de Devolución y Garantías")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Productos: Devolución en 15 días con sello intacto/i)
    ).toBeInTheDocument();
  });
});
