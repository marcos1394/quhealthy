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

    it("does not render 'En vivo' merely because isFilterable is false", () => {
      render(
        <KpiCard
          title="Total Usuarios Registrados"
          value={1250}
          icon={Activity}
          quality="CERTIFIED"
          source="PostgreSQL primary"
          owner="Operaciones"
          isFilterable={false}
          isLive={false}
        />
      );

      // No debe decir "En vivo" cuando sólo es un snapshot acumulado
      expect(screen.queryByText("En vivo")).not.toBeInTheDocument();
      expect(screen.getByText("Snapshot acumulado")).toBeInTheDocument();
    });

    it("renders 'En vivo' with pulse indicator ONLY when isLive is explicitly true", () => {
      render(
        <KpiCard
          title="Conexiones Activas SSE"
          value={14}
          icon={Activity}
          quality="CERTIFIED"
          source="Redis SSE Ticket Store"
          owner="Plataforma"
          isFilterable={false}
          isLive={true}
        />
      );

      expect(screen.getByText("En vivo")).toBeInTheDocument();
      expect(screen.queryByText("Snapshot acumulado")).not.toBeInTheDocument();
    });

    it("renders source asOf timestamp without fabricating current render time", () => {
      const sourceAsOf = "2026-09-11T14:30:00.000Z";
      render(
        <KpiCard
          title="MRR Stripe"
          value="$12,000"
          icon={Activity}
          quality="CERTIFIED"
          source="Stripe Invoicing"
          owner="Finanzas"
          asOf={sourceAsOf}
        />
      );

      const sourceElement = screen.getByText(/Fuente: Stripe Invoicing/i);
      expect(sourceElement).toHaveAttribute(
        "title",
        expect.stringContaining(sourceAsOf)
      );
    });
  });

  describe("Server-Side Health Aggregator", () => {
    it("getSystemHealthList delegates to server-side endpoint rather than probing browser ports", async () => {
      const { adminService } = await import("@/services/admin.service");
      const axiosInstance = (await import("@/lib/axios")).default;
      const vi = (await import("vitest")).vi;

      const mockResponse = {
        data: [
          {
            name: "Payment Service",
            serviceKey: "payment-service",
            port: 8083,
            status: "UP",
            latencyMs: 1,
            version: "2026.1",
            uptime: "JVM Activa",
            lastChecked: "2026-09-11T18:00:00Z",
            quality: "CERTIFIED",
          },
          {
            name: "Catalog Service",
            serviceKey: "catalog-service",
            port: 8084,
            status: "UNAVAILABLE",
            latencyMs: null,
            version: null,
            uptime: null,
            lastChecked: "2026-09-11T18:00:00Z",
            quality: "UNAVAILABLE",
          },
        ],
      };

      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce(mockResponse as any);

      const result = await adminService.getSystemHealthList();

      expect(getSpy).toHaveBeenCalledWith("/api/payments/admin/system-health");
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("UP");
      expect(result[0].quality).toBe("CERTIFIED");
      expect(result[1].status).toBe("UNAVAILABLE");
      expect(result[1].version).toBeNull();
      expect(result[1].uptime).toBeNull();
    });
  });
});
