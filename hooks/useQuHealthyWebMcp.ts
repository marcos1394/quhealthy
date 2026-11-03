"use client";

import { useEffect } from "react";
import { agentMarketplaceService } from "@/services/agentMarketplace.service";

/**
 * Hook cliente para habilitar WebMCP (Web Model Context Protocol) en el navegador.
 * Permite a navegadores y agentes IA nativos (Gemini in Chrome, extensiones de agentes, etc.)
 * descubrir y ejecutar herramientas médicas directamente sobre QuHealthy.
 */
export function useQuHealthyWebMcp() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Verificar soporte de WebMCP en el navegador (navigator.modelContext)
    const nav = navigator as unknown as {
      modelContext?: {
        registerTool?: (tool: Record<string, unknown>) => void;
        unregisterTool?: (name: string) => void;
      };
    };

    if (
      !("modelContext" in nav) ||
      typeof nav.modelContext?.registerTool !== "function"
    ) {
      return;
    }

    try {
      // 1. Herramienta search_medical_marketplace
      nav.modelContext.registerTool({
        name: "search_medical_marketplace",
        description:
          "Busca doctores certificados, clínicas y cotizaciones médicas transparentes en QuHealthy en México con slots de citas en tiempo real (Inspirado en Zocdoc).",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "Consulta libre en lenguaje natural (ej. 'Consulta de ginecología en Guadalajara menos de $1000 MXN')",
            },
            specialty: {
              type: "string",
              description:
                "Especialidad médica (ej. 'Ortodoncia', 'Dermatología', 'Cardiología')",
            },
            city: {
              type: "string",
              description:
                "Ciudad mexicana de atención (ej. 'Guadalajara', 'Ciudad de México', 'Monterrey')",
            },
            maxPriceMxn: {
              type: "number",
              description: "Presupuesto máximo en MXN",
            },
            requiresCertified: {
              type: "boolean",
              description:
                "Filtrar únicamente médicos con Cédula Profesional SEP y acreditación COFEPRIS",
            },
            limit: {
              type: "integer",
              description: "Número máximo de opciones (default: 5)",
            },
          },
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.searchMarketplace(args || {});
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(res, null, 2),
                },
              ],
              structuredContent: res,
              isError: false,
            };
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Error desconocido";
            return {
              content: [
                {
                  type: "text",
                  text: `Error al buscar en QuHealthy: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });

      // 2. Herramienta get_doctor_availability_and_quote
      nav.modelContext.registerTool({
        name: "get_doctor_availability_and_quote",
        description:
          "Obtiene los horarios disponibles y desglose de precio de un doctor específico en QuHealthy.",
        inputSchema: {
          type: "object",
          properties: {
            doctorId: { type: "string", description: "ID del médico" },
            serviceId: { type: "string", description: "ID del servicio o consulta" },
          },
          required: ["doctorId"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.searchMarketplace({
              query: `doctor id ${args?.doctorId || ""}`,
              limit: 1,
            });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(res, null, 2),
                },
              ],
              structuredContent: res,
              isError: false,
            };
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Error desconocido";
            return {
              content: [
                {
                  type: "text",
                  text: `Error al obtener disponibilidad: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });

      // 3. Herramienta create_appointment_hold
      nav.modelContext.registerTool({
        name: "create_appointment_hold",
        description:
          "Crea una pre-reserva de cita médica para un paciente a través de un agente de IA en QuHealthy.",
        inputSchema: {
          type: "object",
          properties: {
            doctorId: { type: "string", description: "ID del médico" },
            serviceId: { type: "string", description: "ID del servicio" },
            dateTime: { type: "string", description: "Horario ISO-8601" },
            patientName: { type: "string", description: "Nombre del paciente" },
            patientPhone: { type: "string", description: "Teléfono de contacto" },
            symptoms: { type: "string", description: "Motivo de consulta" },
          },
          required: ["doctorId", "dateTime", "patientName"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.createAppointmentHold(args || {});
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(res, null, 2),
                },
              ],
              structuredContent: res,
              isError: false,
            };
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Error desconocido";
            return {
              content: [
                {
                  type: "text",
                  text: `Error al crear pre-reserva: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP no disponible en este entorno:", e);
    }
  }, []);
}
