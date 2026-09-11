import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DollarSign, Activity, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/app/[locale]/admin/dashboard/components/KpiCard";
import {
  createCertifiedSignal,
  createProvisionalSignal,
  createUnavailableSignal,
  createErrorSignal,
} from "@/types/admin-signal";

describe("Admin Trust Signals & Veracity", () => {
  describe("Signal Factory Functions", () => {
    it("creates a certified signal correctly", () => {
      const signal = createCertifiedSignal(
        150000,
        "Stripe Balance API",
        "Finanzas",
        "30d",
        true,
        "Volumen conciliado"
      );
      expect(signal.value).toBe(150000);
      expect(signal.quality).toBe("CERTIFIED");
      expect(signal.source).toBe("Stripe Balance API");
      expect(signal.owner).toBe("Finanzas");
      expect(signal.period).toBe("30d");
      expect(signal.isFilterable).toBe(true);
      expect(signal.explanation).toBe("Volumen conciliado");
      expect(signal.asOf).toBeDefined();
    });

    it("creates a provisional signal correctly", () => {
      const signal = createProvisionalSignal(
        450,
        "Modelo Teórico",
        "FinOps",
        "30d",
        "Cálculo estimado basado en consumo de tokens"
      );
      expect(signal.value).toBe(450);
      expect(signal.quality).toBe("PROVISIONAL");
      expect(signal.source).toBe("Modelo Teórico");
      expect(signal.owner).toBe("FinOps");
    });

    it("creates an unavailable signal correctly", () => {
      const signal = createUnavailableSignal(
        "GCP Billing Export",
        "Infraestructura",
        "Exportación no configurada",
        "30d"
      );
      expect(signal.value).toBeNull();
      expect(signal.quality).toBe("UNAVAILABLE");
      expect(signal.source).toBe("GCP Billing Export");
      expect(signal.explanation).toBe("Exportación no configurada");
    });

    it("creates an error signal correctly", () => {
      const signal = createErrorSignal(
        "Telemetry Service",
        "Producto",
        "Timeout de conexión",
        "24h"
      );
      expect(signal.value).toBeNull();
      expect(signal.quality).toBe("ERROR");
      expect(signal.explanation).toBe("Timeout de conexión");
    });
  });

  describe("KpiCard Veracity & Quality Badges", () => {
    it("renders CERTIFIED badge and lineage information", () => {
      render(
        <KpiCard
          title="MRR Suscripciones"
          value="$45,000"
          icon={DollarSign}
          quality="CERTIFIED"
          source="Stripe Billing API"
          owner="Finanzas"
          period="30d"
          asOf="2026-09-11T12:00:00Z"
          explanation="Certificado directamente desde Stripe Billing"
        />
      );

      expect(screen.getByText("MRR Suscripciones")).toBeInTheDocument();
      expect(screen.getByText("$45,000")).toBeInTheDocument();
      expect(screen.getByText("Certificado")).toBeInTheDocument();

      // Check lineage source and owner tooltip
      const sourceElement = screen.getByText(/Fuente: Stripe Billing API/i);
      expect(sourceElement).toBeInTheDocument();
      expect(sourceElement).toHaveAttribute(
        "title",
        expect.stringContaining("Dueño: Finanzas")
      );
    });

    it("renders PROVISIONAL badge with alert styling and explanation", () => {
      render(
        <KpiCard
          title="Costo por Usuario (CPAU)"
          value="$18.50"
          icon={Activity}
          quality="PROVISIONAL"
          source="Modelo Estimado"
          owner="FinOps"
          period="30d"
          explanation="Cálculo basado en supuestos de tokens y SMS"
        />
      );

      expect(screen.getByText("Estimado")).toBeInTheDocument();
      expect(screen.getByText("$18.50")).toBeInTheDocument();
      const badge = screen.getByText("Estimado");
      expect(badge).toHaveAttribute(
        "title",
        expect.stringContaining("Cálculo basado en supuestos de tokens y SMS")
      );
    });

    it("renders UNAVAILABLE state as 'No disponible' without fabricating zero", () => {
      render(
        <KpiCard
          title="GCP Cloud Costs"
          value={0}
          icon={AlertTriangle}
          quality="UNAVAILABLE"
          source="GCP BigQuery"
          owner="Infraestructura"
          explanation="BigQuery billing export aún no enlazado"
        />
      );

      const noDisponibleElements = screen.getAllByText("No disponible");
      expect(noDisponibleElements.length).toBeGreaterThanOrEqual(1);
      // Should NOT render misleading "$0.00" or fake "0"
      expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    });

    it("renders ERROR state as 'Error de consulta'", () => {
      render(
        <KpiCard
          title="Métricas de Telemetría"
          value={null}
          icon={AlertTriangle}
          quality="ERROR"
          source="Telemetry Microservice"
          owner="Growth"
          explanation="Error 500 al conectar con el clúster"
        />
      );

      expect(screen.getByText("Error de fuente")).toBeInTheDocument();
      expect(screen.getByText("Error de consulta")).toBeInTheDocument();
    });
  });
});
