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

    // 1. Herramienta search_medical_marketplace
    try {
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
    } catch (e) {
      console.debug("WebMCP registerTool search_medical_marketplace skipped/failed:", e);
    }

    // 2. Herramienta get_doctor_availability_and_quote
    try {
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
    } catch (e) {
      console.debug("WebMCP registerTool get_doctor_availability_and_quote skipped/failed:", e);
    }

    // 3. Herramienta create_appointment_hold
    try {
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
            paymentGuaranteeMode: {
              type: "string",
              enum: ["PAY_AT_CLINIC", "QUWALLET_GUARANTEE"],
              description: "Modalidad de reserva: 'PAY_AT_CLINIC' (30 min) o 'QUWALLET_GUARANTEE' (24 hrs aseguradas con 10% descuento)",
            },
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
      console.debug("WebMCP registerTool create_appointment_hold skipped/failed:", e);
    }

    // 4. Herramienta attach_preconsultation_intake (NOM-004-SSA3-2012)
    try {
      nav.modelContext.registerTool({
        name: "attach_preconsultation_intake",
        description:
          "Adjunta la ficha clínica de pre-admisión (anamnesis inicial) conforme a la NOM-004-SSA3-2012 para una pre-reserva de cita médica en QuHealthy.",
        inputSchema: {
          type: "object",
          properties: {
            holdId: { type: "string", description: "ID o folio del hold de cita" },
            appointmentId: { type: "string", description: "ID de la cita médica" },
            chiefComplaint: { type: "string", description: "Motivo principal de consulta médica" },
            symptomDuration: { type: "string", description: "Tiempo de evolución del cuadro" },
            severityScale: { type: "integer", description: "Escala de severidad (1-10)" },
            knownAllergies: { type: "string", description: "Alergias conocidas a fármacos o alimentos" },
            currentMedications: { type: "string", description: "Medicamentos o suplementos actuales" },
            chronicConditions: { type: "string", description: "Antecedentes médicos crónicos" },
          },
          required: ["chiefComplaint"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.attachPreconsultationIntake(args || {});
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
                  text: `Error al adjuntar pre-admisión clínica: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP registerTool attach_preconsultation_intake skipped/failed:", e);
    }

    // 5. Herramienta triage_symptom_to_specialty (Fase 2)
    try {
      nav.modelContext.registerTool({
        name: "triage_symptom_to_specialty",
        description:
          "Pre-triage clínico inteligente: evalúa síntomas en lenguaje natural, calcula nivel de urgencia, detecta banderas rojas y recomienda especialidades médicas QuHealthy.",
        inputSchema: {
          type: "object",
          properties: {
            symptomsDescription: {
              type: "string",
              description: "Descripción detallada de síntomas en lenguaje natural",
            },
            patientAge: { type: "integer", description: "Edad del paciente" },
            biologicalSex: {
              type: "string",
              enum: ["M", "F", "OTHER"],
              description: "Sexo biológico",
            },
            city: { type: "string", description: "Ciudad de atención médica" },
          },
          required: ["symptomsDescription"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.triageSymptoms(args || {});
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
                  text: `Error en pre-triage médico: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP registerTool triage_symptom_to_specialty skipped/failed:", e);
    }

    // 6. Herramienta verify_doctor_credentials_and_quscore (Fase 2)
    try {
      nav.modelContext.registerTool({
        name: "verify_doctor_credentials_and_quscore",
        description:
          "Audita y valida la Cédula Profesional SEP, aviso de funcionamiento COFEPRIS y desglose QuScore™ de un médico especialista.",
        inputSchema: {
          type: "object",
          properties: {
            doctorId: { type: "string", description: "ID del médico en QuHealthy" },
          },
          required: ["doctorId"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const docId = String(args?.doctorId || "1");
            const res = await agentMarketplaceService.verifyDoctorCredentials(docId);
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
                  text: `Error al auditar credenciales médicas: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP registerTool verify_doctor_credentials_and_quscore skipped/failed:", e);
    }

    // 7. Herramienta share_ephemeral_health_vault_context (Fase 3)
    try {
      nav.modelContext.registerTool({
        name: "share_ephemeral_health_vault_context",
        description:
          "Genera un consentimiento efímero de lectura para Health Vault™ conforme a la NOM-024-SSA3-2012 y LFPDPPP para una consulta médica.",
        inputSchema: {
          type: "object",
          properties: {
            holdId: { type: "string", description: "ID de la cita médica pre-reservada (Hold ID)" },
            sharedSections: {
              type: "array",
              items: { type: "string" },
              description: "Secciones autorizadas (ALLERGIES, ACTIVE_MEDICATIONS, RECENT_LABS, VACCINATIONS, SURGICAL_HISTORY)",
            },
            accessDurationMinutes: { type: "integer", description: "Vigencia en minutos (default: 120, máx: 1440)" },
            vaultAccessPinOrToken: { type: "string", description: "PIN o token de autorización opcional" },
          },
          required: ["holdId", "sharedSections"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.shareEphemeralHealthVaultContext(args || {});
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
                  text: `Error al compartir Health Vault™: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP registerTool share_ephemeral_health_vault_context skipped/failed:", e);
    }

    // 8. Herramienta match_lab_biomarkers_to_specialists (Fase 3)
    try {
      nav.modelContext.registerTool({
        name: "match_lab_biomarkers_to_specialists",
        description:
          "Interpreta biomarcadores de laboratorio, detecta desviaciones clínicas y canaliza a especialistas certificados disponibles en QuHealthy.",
        inputSchema: {
          type: "object",
          properties: {
            biomarkers: {
              type: "array",
              items: { type: "object" },
              description: "Lista de biomarcadores con name, value, unit y opcional referenceRange",
            },
            city: { type: "string", description: "Ciudad de atención médica" },
            maxBudgetMxn: { type: "number", description: "Presupuesto máximo para la consulta en MXN" },
          },
          required: ["biomarkers"],
        },
        execute: async (args: Record<string, unknown>) => {
          try {
            const res = await agentMarketplaceService.matchLabBiomarkersToSpecialists(args || {});
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
                  text: `Error al canalizar biomarcadores: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug("WebMCP registerTool match_lab_biomarkers_to_specialists skipped/failed:", e);
    }

    // 9. Herramienta check_medication_interactions_and_contraindications (Fase 4)
    try {
      nav.modelContext.registerTool({
        name: "check_medication_interactions_and_contraindications",
        description:
          "Evalúa interacciones farmacológicas, contraindicaciones por antecedentes clínicos y alertas de alergias medicamentosas en tiempo real según lineamientos de COFEPRIS y NOM-004-SSA3-2012.",
        inputSchema: {
          type: "object",
          properties: {
            medications: {
              type: "array",
              items: { type: "string" },
              description:
                "Lista de fármacos o principios activos a evaluar (ej: ['Metformina 850mg', 'Sertralina 50mg'])",
            },
            patientConditions: {
              type: "array",
              items: { type: "string" },
              description:
                "Diagnósticos o antecedentes patológicos del paciente (ej: ['Insuficiencia renal crónica leve', 'Embarazo'])",
            },
            knownAllergies: {
              type: "array",
              items: { type: "string" },
              description:
                "Alergias farmacológicas reportadas por el paciente (ej: ['Penicilina', 'Sulfas'])",
            },
          },
          required: ["medications"],
        },
        handler: async (args: Record<string, unknown>) => {
          try {
            const result =
              await agentMarketplaceService.checkMedicationInteractions(args);
            const markdown =
              typeof result.medicationSummaryMarkdown === "string"
                ? result.medicationSummaryMarkdown
                : "Análisis de interacciones medicamentosas completado.";
            return {
              content: [{ type: "text", text: markdown }],
              structuredContent: result,
              data: result,
              isError: false,
            };
          } catch (err: unknown) {
            const errorMsg =
              err instanceof Error ? err.message : "Error desconocido";
            return {
              content: [
                {
                  type: "text",
                  text: `Error al evaluar interacciones farmacológicas: ${errorMsg}`,
                },
              ],
              isError: true,
            };
          }
        },
      });
    } catch (e) {
      console.debug(
        "WebMCP registerTool check_medication_interactions_and_contraindications skipped/failed:",
        e
      );
    }

    return () => {
      try {
        nav.modelContext?.unregisterTool?.("search_medical_marketplace");
        nav.modelContext?.unregisterTool?.("get_doctor_availability_and_quote");
        nav.modelContext?.unregisterTool?.("create_appointment_hold");
        nav.modelContext?.unregisterTool?.("attach_preconsultation_intake");
        nav.modelContext?.unregisterTool?.("triage_symptom_to_specialty");
        nav.modelContext?.unregisterTool?.("verify_doctor_credentials_and_quscore");
        nav.modelContext?.unregisterTool?.("share_ephemeral_health_vault_context");
        nav.modelContext?.unregisterTool?.("match_lab_biomarkers_to_specialists");
        nav.modelContext?.unregisterTool?.("check_medication_interactions_and_contraindications");
      } catch (e) {
        console.debug("Error during WebMCP cleanup:", e);
      }
    };
  }, []);
}
