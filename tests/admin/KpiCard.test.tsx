import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { KpiCard } from "@/app/[locale]/admin/dashboard/components/KpiCard";

describe("KpiCard component", () => {
  it("renders title and value properly", () => {
    render(
      <KpiCard
        title="Ingresos Totales"
        value="$125,000"
        icon={Activity}
        variant="emerald"
      />
    );

    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
    expect(screen.getByText("$125,000")).toBeInTheDocument();
  });

  it("renders subtext when no changePercent is provided", () => {
    render(
      <KpiCard
        title="Usuarios Activos"
        value={1540}
        subtext="Últimos 30 días"
        icon={Activity}
      />
    );

    expect(screen.getByText("Usuarios Activos")).toBeInTheDocument();
    expect(screen.getByText("1540")).toBeInTheDocument();
    expect(screen.getByText("Últimos 30 días")).toBeInTheDocument();
  });

  it("renders positive change percentage with plus sign and period", () => {
    render(
      <KpiCard
        title="Consultas"
        value={320}
        changePercent={12.5}
        changePeriod="vs mes anterior"
        icon={Activity}
        variant="blue"
      />
    );

    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("vs mes anterior")).toBeInTheDocument();
  });

  it("renders negative change percentage with period", () => {
    render(
      <KpiCard
        title="Tasa de Cancelación"
        value="4.2%"
        changePercent={-2.1}
        changePeriod="vs mes anterior"
        icon={Activity}
        variant="rose"
      />
    );

    expect(screen.getByText("-2.1%")).toBeInTheDocument();
    expect(screen.getByText("vs mes anterior")).toBeInTheDocument();
  });
});
