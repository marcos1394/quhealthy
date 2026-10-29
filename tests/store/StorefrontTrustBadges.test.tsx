import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StorefrontTrustBadges } from "@/components/store/StorefrontTrustBadges";
import { StorefrontData } from "@/types/storefront";
import { ProviderScoreResponse } from "@/types/providerScore";

describe("StorefrontTrustBadges Component with Real Backend Compliance Data", () => {
  const baseSupplierStore: StorefrontData = {
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
    supplierStatus: "VERIFIED",
    cofeprisNotice: "242501506X0123",
    coldChainCertified: true,
    kycStatus: "COMPLETED",
    rfc: "OOCP930708D24",
    taxReceiptAvailable: true,
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

  it("renders verified supplier badges with real RFC, KYC and cold chain from backend", () => {
    render(
      <StorefrontTrustBadges
        store={baseSupplierStore}
        brandColor="#059669"
      />
    );

    expect(
      screen.getByText("Garantías de Cumplimiento y Calidad en Insumos")
    ).toBeInTheDocument();

    // Supplier status
    expect(screen.getByText("Distribuidor Oficial Verificado")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();

    // KYC badge in header
    expect(screen.getByText("KYC Oficial Validado")).toBeInTheDocument();

    // Cold chain
    expect(screen.getByText("Cadena de Frío Certificada")).toBeInTheDocument();

    // RFC masked
    expect(screen.getByText("Facturación SAT CFDI 4.0")).toBeInTheDocument();
    expect(screen.getByText(/OOCP\*\*\*/i)).toBeInTheDocument();

    // Escrow
    expect(screen.getByText("Pago Protegido en Garantía")).toBeInTheDocument();
  });

  it("renders registered status when supplier is PENDING_REVIEW without claiming false official verification", () => {
    const pendingSupplier: StorefrontData = {
      ...baseSupplierStore,
      supplierStatus: "PENDING_REVIEW",
      coldChainCertified: false,
      kycStatus: "PENDING",
    };

    render(
      <StorefrontTrustBadges
        store={pendingSupplier}
      />
    );

    // Header KYC pending
    expect(screen.getByText("KYC en Revisión")).toBeInTheDocument();

    // Does NOT say "Distribuidor Oficial Verificado", says "Distribuidor Registrado QuHealthy"
    expect(screen.getByText("Distribuidor Registrado QuHealthy")).toBeInTheDocument();
    expect(screen.getByText("Registrado")).toBeInTheDocument();

    // Standard logistics
    expect(screen.getByText("Envíos Asegurados a Todo México")).toBeInTheDocument();
  });

  it("renders doctor badges with audited license when doctorLicense is present", () => {
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
      licenseStatus: "COMPLETED",
      kycStatus: "COMPLETED",
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

    expect(
      screen.getByText("Garantías de Confianza y Calidad Médica")
    ).toBeInTheDocument();

    expect(screen.getByText("Cédula Profesional Auditada")).toBeInTheDocument();
    expect(screen.getByText(/Cédula SEP \/ DGP: 12345678/i)).toBeInTheDocument();
    expect(screen.getByText("Cédula Verificada")).toBeInTheDocument();
    expect(screen.getByText("Expediente Digital NOM-004")).toBeInTheDocument();
    expect(screen.getByText("Confirmación Inmediata de Cita")).toBeInTheDocument();
    expect(screen.getByText("Pago Seguro QuHealthy")).toBeInTheDocument();
  });

  it("renders pending review badge when doctor has not yet submitted/audited their license", () => {
    const unverifiedDoctor: StorefrontData = {
      providerId: 11,
      displayName: "Clínica Bienestar",
      slug: "clinica-bienestar",
      bio: "Atención de medicina general",
      logoUrl: null,
      bannerUrl: null,
      primaryColor: "#0284c7",
      whatsappEnabled: false,
      instagramUrl: null,
      providerType: "DOCTOR",
      doctorLicense: undefined,
      licenseStatus: "PENDING",
      rating: 4.0,
      reviewsCount: 2,
      packages: [],
      courses: [],
      services: [
        {
          id: 1,
          type: "SERVICE",
          category: "General",
          name: "Orientación Médica",
          description: "Chequeo preventivo",
          price: 400,
        },
      ],
      products: [],
    };

    render(
      <StorefrontTrustBadges
        store={unverifiedDoctor}
      />
    );

    // Shows transparently that license is pending review
    expect(screen.getByText("Profesional de Salud Registrado")).toBeInTheDocument();
    expect(screen.getByText("En Revisión")).toBeInTheDocument();
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
        store={baseSupplierStore}
        scoreData={mockScore}
      />
    );

    expect(screen.getByText(/QuScore 368/i)).toBeInTheDocument();
    expect(screen.getByText(/• Verificado/i)).toBeInTheDocument();
  });
});
