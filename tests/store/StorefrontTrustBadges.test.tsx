import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StorefrontTrustBadges } from "@/components/store/StorefrontTrustBadges";
import { StorefrontData } from "@/types/storefront";
import { ProviderScoreResponse } from "@/types/providerScore";

describe("StorefrontTrustBadges Component", () => {
  const baseMockStore: StorefrontData = {
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
    address: "Fuente de Cristal 2488",
    city: "Los Mochis",
    providerType: "SUPPLIER",
    cofeprisNotice: "242501506X0123",
    coldChainCertified: true,
    rating: 5.0,
    reviewsCount: 12,
    services: [],
    packages: [],
    courses: [],
    products: [
      {
        id: 101,
        type: "PRODUCT",
        category: "Material Quirúrgico",
        name: "Guantes de Nitrilo Grado Médico",
        description: "Caja con 100 guantes esterilizados",
        price: 180,
      },
    ],
  };

  it("renders supplier/insumos trust badges with COFEPRIS and cold chain when provider is SUPPLIER", () => {
    render(
      <StorefrontTrustBadges
        store={baseMockStore}
        brandColor="#059669"
      />
    );

    // Section title
    expect(
      screen.getByText("Garantías de Cumplimiento y Calidad en Insumos")
    ).toBeInTheDocument();

    // 4 Badges
    expect(screen.getByText("Insumos Médicos Verificados")).toBeInTheDocument();
    expect(
      screen.getByText(/Aviso de Funcionamiento COFEPRIS: 242501506X0123/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Cadena de Frío & Envío Asegurado")).toBeInTheDocument();
    expect(screen.getByText("Facturación SAT CFDI 4.0")).toBeInTheDocument();
    expect(screen.getByText("Pago Seguro SSL en Garantía")).toBeInTheDocument();
  });

  it("renders supplier/insumos trust badges when store only has products and no services", () => {
    const productStoreWithoutExplicitType: StorefrontData = {
      ...baseMockStore,
      providerType: undefined,
      cofeprisNotice: undefined,
      coldChainCertified: false,
    };

    render(
      <StorefrontTrustBadges
        store={productStoreWithoutExplicitType}
      />
    );

    expect(
      screen.getByText("Garantías de Cumplimiento y Calidad en Insumos")
    ).toBeInTheDocument();
    expect(screen.getByText("Envíos Asegurados a Todo México")).toBeInTheDocument();
    expect(screen.getByText("Facturación SAT CFDI 4.0")).toBeInTheDocument();
  });

  it("renders doctor/clinic clinical badges when provider offers medical services", () => {
    const doctorStore: StorefrontData = {
      providerId: 10,
      displayName: "Dra. Sofía Morales",
      slug: "dra-sofia-morales",
      bio: "Médico Especialista en Dermatología Clínica",
      logoUrl: null,
      bannerUrl: null,
      primaryColor: "#0284c7",
      whatsappEnabled: true,
      instagramUrl: null,
      providerType: "DOCTOR",
      doctorLicense: "12345678",
      cancellationPolicy: "24h_prior",
      rating: 4.9,
      reviewsCount: 30,
      packages: [],
      courses: [],
      services: [
        {
          id: 1,
          type: "SERVICE",
          category: "Consulta",
          name: "Consulta Dermatológica Integral",
          description: "Diagnóstico especializado de patologías de la piel",
          price: 900,
        },
      ],
      products: [],
    };

    render(
      <StorefrontTrustBadges
        store={doctorStore}
        brandColor="#0284c7"
      />
    );

    // Section title
    expect(
      screen.getByText("Garantías de Confianza y Calidad Médica")
    ).toBeInTheDocument();

    // 4 Badges
    expect(screen.getByText("Profesionales de Salud Verificados")).toBeInTheDocument();
    expect(screen.getByText(/Cédula Profesional Auditada: 12345678/i)).toBeInTheDocument();
    expect(screen.getByText("Expediente Digital NOM-004")).toBeInTheDocument();
    expect(screen.getByText("Confirmación Inmediata de Cita")).toBeInTheDocument();
    expect(screen.getByText("Pago Seguro y Retención en Garantía")).toBeInTheDocument();
  });

  it("displays QuScore badge when scoreData is provided", () => {
    const mockScore: ProviderScoreResponse = {
      providerId: 34,
      score: 368,
      band: "ADVANCED",
      isNewProvider: false,
      breakdown: {
        P1: {
          name: "Completitud de Perfil",
          percentage: 100,
          status: "OPTIMAL",
          tooltip: "Perfil 100% completo",
        },
      },
      lastCalculatedAt: new Date().toISOString(),
    };

    render(
      <StorefrontTrustBadges
        store={baseMockStore}
        scoreData={mockScore}
      />
    );

    expect(screen.getByText(/QuScore 368 \/ 1000/i)).toBeInTheDocument();
    expect(screen.getByText(/• Verificado/i)).toBeInTheDocument();
  });
});
