import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TabAdminCrm } from "@/app/[locale]/admin/dashboard/tabs/TabAdminCrm";
import { adminService } from "@/services/admin.service";
import { toast } from "react-toastify";

vi.mock("@/services/admin.service", () => ({
  adminService: {
    getAdminCrmConversations: vi.fn(),
    getAdminFunnelStats: vi.fn(),
    getAdminCrmMessages: vi.fn(),
    getAdminAiSuggestedReply: vi.fn(),
    sendAdminCrmMessage: vi.fn(),
    deleteAdminCrmConversation: vi.fn(),
    sendDirectCrmMessage: vi.fn(),
    updateAdminLeadStage: vi.fn(),
    toggleAdminAutoResponder: vi.fn(),
    syncAdminCrmMessages: vi.fn(),
    scanSocialProspects: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("CRM-GOV-01: Material Actions Governance in TabAdminCrm", () => {
  const mockConversations = [
    {
      id: "conv-101",
      providerId: 1,
      platform: "WHATSAPP",
      contactName: "Dra. Elena Ruiz",
      externalContactId: "+5215512345678",
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: "¿Cuáles son los requisitos de la NOM-004?",
      isRead: true,
      status: "ACTIVE",
      funnelStage: "QUALIFIED" as const,
      leadScore: 90,
      aiAutoResponderEnabled: false,
    },
  ];

  const mockMessages = [
    {
      id: "msg-1",
      conversationId: "conv-101",
      direction: "INBOUND" as const,
      senderType: "USER" as const,
      content: "¿Cuáles son los requisitos de la NOM-004?",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.getAdminCrmConversations).mockResolvedValue(mockConversations as any);
    vi.mocked(adminService.getAdminFunnelStats).mockResolvedValue({
      totalLeads: 1,
      contacted: 1,
      qualified: 1,
      won: 0,
      conversionRate: 0,
    } as any);
    vi.mocked(adminService.getAdminCrmMessages).mockResolvedValue(mockMessages as any);
    vi.mocked(adminService.getAdminAiSuggestedReply).mockResolvedValue({
      suggestions: [
        {
          tone: "PROFESIONAL",
          text: "Estimada Dra. Elena, Quhealthy cumple 100% con la NOM-004 para expediente clínico.",
        },
        {
          tone: "DIRECTO",
          text: "Hola Dra. Elena, aquí puede agendar su demostración de la NOM-004.",
        },
      ],
    } as any);
    vi.mocked(adminService.sendAdminCrmMessage).mockResolvedValue({
      id: "msg-2",
      conversationId: "conv-101",
      content: "Mensaje aprobado",
    } as any);
  });

  it("RULE 1: Selecting an AI suggestion ONLY copies text to draft and NEVER dispatches external message", async () => {
    render(<TabAdminCrm />);

    // Wait for conversation to load
    await waitFor(() => {
      expect(screen.getAllByText("Dra. Elena Ruiz")[0]).toBeInTheDocument();
    });

    // Click 'Generar Sugerencia IA'
    const aiBtn = screen.getByText("Generar Sugerencia IA");
    fireEvent.click(aiBtn);

    // Wait for suggestions to render
    await waitFor(() => {
      expect(screen.getAllByText("Usar como Borrador").length).toBeGreaterThan(0);
    });

    // Click 'Usar como Borrador' on the first suggestion
    const draftButtons = screen.getAllByText("Usar como Borrador");
    fireEvent.click(draftButtons[0]);

    // Verify zero material side effects
    expect(adminService.sendAdminCrmMessage).not.toHaveBeenCalled();

    // Verify draft is populated in the input field
    const input = screen.getByPlaceholderText("Escribe una respuesta institucional revisada...") as HTMLInputElement;
    expect(input.value).toBe(
      "Estimada Dra. Elena, Quhealthy cumple 100% con la NOM-004 para expediente clínico."
    );

    // Verify governance badge and review banner are visible
    expect(
      screen.getByText(/Borrador IA cargado \(PROFESIONAL\) — Revisión requerida/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Edite el texto libremente antes de aprobar y presionar Enviar.")
    ).toBeInTheDocument();
  });

  it("RULE 2: Message dispatch requires explicit human review and deliberate submit action", async () => {
    render(<TabAdminCrm />);

    await waitFor(() => {
      expect(screen.getAllByText("Dra. Elena Ruiz")[0]).toBeInTheDocument();
    });

    // Generate AI suggestion
    fireEvent.click(screen.getByText("Generar Sugerencia IA"));
    await waitFor(() => {
      expect(screen.getAllByText("Usar como Borrador").length).toBeGreaterThan(0);
    });

    // Load draft
    fireEvent.click(screen.getAllByText("Usar como Borrador")[0]);
    expect(adminService.sendAdminCrmMessage).not.toHaveBeenCalled();

    // Human operator edits draft
    const input = screen.getByPlaceholderText("Escribe una respuesta institucional revisada...");
    fireEvent.change(input, {
      target: {
        value: "Estimada Dra. Elena, Quhealthy cumple 100% con la NOM-004. ¿Tiene disponibilidad el jueves a las 4pm?",
      },
    });

    // Human operator clicks Send
    const sendBtn = screen.getByTitle("Aprobar y enviar mensaje");
    fireEvent.click(sendBtn);

    // Now sendAdminCrmMessage should be called with the reviewed and edited message
    await waitFor(() => {
      expect(adminService.sendAdminCrmMessage).toHaveBeenCalledTimes(1);
      expect(adminService.sendAdminCrmMessage).toHaveBeenCalledWith("conv-101", {
        text: "Estimada Dra. Elena, Quhealthy cumple 100% con la NOM-004. ¿Tiene disponibilidad el jueves a las 4pm?",
      });
    });
  });

  it("RULE 3: Auto-Responder toggle is blocked with governance warning in P0", async () => {
    render(<TabAdminCrm />);

    await waitFor(() => {
      expect(screen.getAllByText("Dra. Elena Ruiz")[0]).toBeInTheDocument();
    });

    // The header displays "Auto-IA Bloqueado"
    const autoResponderBtn = screen.getByText("Auto-IA Bloqueado");
    fireEvent.click(autoResponderBtn);

    // Verify governance toast warning and zero autonomous activation
    expect(toast.warn).toHaveBeenCalledWith(
      expect.stringContaining("La auto-respuesta corporativa autónoma está bloqueada por política de gobierno del CEO (CRM-GOV-01)")
    );
    expect(adminService.toggleAdminAutoResponder).not.toHaveBeenCalled();
  });

  it("RULE 4: Direct Outbound modal is locked and prevents unapproved external dispatch", async () => {
    render(<TabAdminCrm />);

    await waitFor(() => {
      expect(screen.getAllByText("Dra. Elena Ruiz")[0]).toBeInTheDocument();
    });

    // Open direct send modal
    const directBtn = screen.getByText("Detonar Envío Directo");
    fireEvent.click(directBtn);

    // Modal displays governance alert banner
    expect(
      screen.getByText("Acción Restringida por Política de Gobierno (CRM-GOV-01)")
    ).toBeInTheDocument();

    // The dispatch button is disabled and marked as blocked
    const dispatchBtn = screen.getByText("Despacho Bloqueado por Gobierno").closest("button");
    expect(dispatchBtn).toBeDisabled();

    // Attempting to click does not call sendAdminDirectMessage
    if (dispatchBtn) {
      fireEvent.click(dispatchBtn);
    }
    expect(adminService.sendDirectCrmMessage).not.toHaveBeenCalled();
  });

  it("RULE 5: Archiving a conversation does NOT call destructive physical deletion", async () => {
    // Mock window.confirm to return true
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TabAdminCrm />);

    await waitFor(() => {
      expect(screen.getAllByText("Dra. Elena Ruiz")[0]).toBeInTheDocument();
    });

    // Click archive/delete button
    const archiveBtn = screen.getByTitle("Archivar conversación (retención gobernada CRM-GOV-01)");
    fireEvent.click(archiveBtn);

    // Physical deletion is NEVER called; retention policy preserves audit
    expect(adminService.deleteAdminCrmConversation).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("Conversación archivada correctamente (preservada en auditoría)")
    );
  });
});
