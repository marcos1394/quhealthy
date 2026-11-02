import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentMarketplaceMcpView } from "@/components/provider/connections/AgentMarketplaceMcpView";
import { agentMarketplaceService } from "@/services/agentMarketplace.service";
import { AgentMarketplaceSearchResponse } from "@/types/agentMarketplace";

// Mock del servicio de Agent Marketplace
vi.mock("@/services/agentMarketplace.service", () => ({
  agentMarketplaceService: {
    searchMarketplace: vi.fn(),
    callMcp: vi.fn(),
    createAppointmentHold: vi.fn(),
    getMcpManifest: vi.fn(),
  },
}));

// Mock de react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock de navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

const mockSearchResponse: AgentMarketplaceSearchResponse = {
  extractedCriteria: {
    specialty: "Ortodoncia",
    city: "Guadalajara",
    maxPriceMxn: 800,
    requiresCertified: true,
  },
  totalFound: 2,
  quotes: [
    {
      providerId: 2041,
      doctorName: "Dra. Sofía Mendoza Alarcón",
      specialty: "Ortodoncia y Ortopedia Maxilofacial",
      clinicName: "Centro Dental Guadalajara",
      city: "Guadalajara",
      address: "Av. Chapultepec 223",
      cedulaProfesional: "SEP-CED-10984521",
      isCertified: true,
      quScore: 4.95,
      reviewCount: 84,
      serviceId: 801,
      serviceName: "Consulta Diagnóstica de Ortodoncia",
      durationMinutes: 45,
      basePriceMxn: 750,
      finalPriceMxn: 750,
      discountPercentage: 0,
      meetsBudget: true,
      availableSlots: ["2026-11-05T10:00:00", "2026-11-05T12:30:00"],
      nextAvailableSlot: "2026-11-05T10:00:00",
      bookingUrl: "https://quhealthy.org/es/providers/dra-sofia-mendoza",
    },
  ],
  regulatoryDisclaimer:
    "Servicios y cédulas auditadas conforme a NOM-004-SSA3-2012 y COFEPRIS.",
  mcpTool: "search_medical_marketplace",
  timestamp: "2026-11-02T13:00:00",
};

describe("AgentMarketplaceMcpView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el encabezado del servidor MCP con endpoint y protocolo v2024-11-05", () => {
    render(<AgentMarketplaceMcpView />);

    expect(
      screen.getByText("Pasarela para Agentes de IA & Servidor MCP")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Model Context Protocol v2024-11-05/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("/api/v1/agent-marketplace/mcp")
    ).toBeInTheDocument();
  });

  it("permite copiar el endpoint del servidor MCP al portapapeles", async () => {
    render(<AgentMarketplaceMcpView />);

    const copyBtn = screen.getByRole("button", { name: /copiar/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://api.quhealthy.org/api/v1/agent-marketplace/mcp"
    );
  });

  it("ejecuta la consulta del agente y muestra doctores, cédulas verificadas y slots", async () => {
    vi.mocked(agentMarketplaceService.searchMarketplace).mockResolvedValue(
      mockSearchResponse
    );
    vi.mocked(agentMarketplaceService.callMcp).mockResolvedValue({
      jsonrpc: "2.0",
      id: 1,
      result: { isError: false },
    });

    render(<AgentMarketplaceMcpView />);

    const queryBtn = screen.getByRole("button", {
      name: /consultar como agente ia/i,
    });
    fireEvent.click(queryBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Dra. Sofía Mendoza Alarcón")
      ).toBeInTheDocument();
      expect(screen.getByText("SEP-CED-10984521")).toBeInTheDocument();
      expect(screen.getByText("$750 MXN")).toBeInTheDocument();
      expect(screen.getByText("✓ Cumple Presupuesto")).toBeInTheDocument();
      expect(screen.getByText(/Verificado NOM-004-SSA3/i)).toBeInTheDocument();
      expect(screen.getByText("Reservar Consulta en 1 Clic")).toBeInTheDocument();
    });
  });

  it("permite abrir y explorar el inspector JSON-RPC 2.0 de MCP", async () => {
    vi.mocked(agentMarketplaceService.searchMarketplace).mockResolvedValue(
      mockSearchResponse
    );
    vi.mocked(agentMarketplaceService.callMcp).mockResolvedValue({
      jsonrpc: "2.0",
      id: 12345,
      result: { isError: false, content: [{ type: "text", text: "OK" }] },
    });

    render(<AgentMarketplaceMcpView />);

    const queryBtn = screen.getByRole("button", {
      name: /consultar como agente ia/i,
    });
    fireEvent.click(queryBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Inspector de Protocolo MCP/i)
      ).toBeInTheDocument();
    });

    const inspectorBtn = screen.getByText(/Inspector de Protocolo MCP/i);
    fireEvent.click(inspectorBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/1\. Petición JSON-RPC 2\.0/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/2\. Respuesta MCP/i)
      ).toBeInTheDocument();
    });
  });
});
