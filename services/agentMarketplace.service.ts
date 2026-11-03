import axiosInstance from '@/lib/axios';
import {
  AgentMarketplaceSearchRequest,
  AgentMarketplaceSearchResponse,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
} from '@/types/agentMarketplace';

export const agentMarketplaceService = {
  /**
   * Búsqueda en el Marketplace para Agentes de IA externos (Zocdoc + Walmart model).
   * Retorna doctores certificados, precios transparentes y slots listos para reservar.
   */
  searchMarketplace: async (
    request: AgentMarketplaceSearchRequest
  ): Promise<AgentMarketplaceSearchResponse> => {
    const response = await axiosInstance.post(
      '/api/v1/agent-marketplace/search',
      request
    );
    return response.data;
  },

  /**
   * Ejecución JSON-RPC 2.0 del Model Context Protocol (MCP) estándar.
   * Compatible con Claude Desktop, ChatGPT Actions, Gemini Antigravity y agentes autónomos.
   */
  callMcp: async (request: McpJsonRpcRequest): Promise<McpJsonRpcResponse> => {
    const response = await axiosInstance.post(
      '/api/v1/agent-marketplace/mcp',
      request
    );
    return response.data;
  },

  /**
   * Crea una pre-reserva (Hold) programática de cita médica.
   */
  createAppointmentHold: async (
    holdPayload: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.post(
      '/api/v1/agent-marketplace/hold',
      holdPayload
    );
    return response.data;
  },

  /**
   * Adjunta la ficha clínica de pre-admisión (NOM-004-SSA3-2012) a una pre-reserva (Hold).
   */
  attachPreconsultationIntake: async (
    intakePayload: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.post(
      '/api/v1/agent-marketplace/intake',
      intakePayload
    );
    return response.data;
  },

  /**
   * Pre-triage clínico inteligente: evalúa síntomas y sugiere especialidades médicas (Fase 2).
   */
  triageSymptoms: async (
    triagePayload: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.post(
      '/api/v1/agent-marketplace/triage',
      triagePayload
    );
    return response.data;
  },

  /**
   * Consulta la auditoría de credenciales SEP, COFEPRIS y desglose QuScore™ de un médico (Fase 2).
   */
  verifyDoctorCredentials: async (
    doctorId: string
  ): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get(
      `/api/v1/agent-marketplace/doctors/${encodeURIComponent(doctorId)}/verification`
    );
    return response.data;
  },

  /**
   * Obtiene el manifiesto de descubrimiento MCP del servidor.
   */
  getMcpManifest: async (): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get(
      '/api/v1/agent-marketplace/mcp/manifest'
    );
    return response.data;
  },
};
