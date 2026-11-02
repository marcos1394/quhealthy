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
   * Obtiene el manifiesto de descubrimiento MCP del servidor.
   */
  getMcpManifest: async (): Promise<Record<string, unknown>> => {
    const response = await axiosInstance.get(
      '/api/v1/agent-marketplace/mcp/manifest'
    );
    return response.data;
  },
};
