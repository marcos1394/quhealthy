"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ExternalLink,
  Code2,
  Copy,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  Search,
  Lock,
  Play,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { agentMarketplaceService } from "@/services/agentMarketplace.service";
import {
  AgentMarketplaceSearchResponse,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
} from "@/types/agentMarketplace";

interface ToolPreset {
  name: string;
  label: string;
  category: string;
  description: string;
  defaultArgs: Record<string, unknown>;
}

const AVAILABLE_TOOLS: ToolPreset[] = [
  {
    name: "search_medical_marketplace",
    label: "Búsqueda Marketplace",
    category: "Descubrimiento",
    description: "Búsqueda de médicos especialistas con Cédula SEP, clínicas, precios y slots.",
    defaultArgs: {
      query: "Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN",
      city: "Guadalajara",
      requiresCertified: true,
      limit: 3,
    },
  },
  {
    name: "triage_symptom_to_specialty",
    label: "Pre-Triage Clínico",
    category: "Clínico",
    description: "Evalúa síntomas, calcula nivel de urgencia y recomienda especialidades médicas.",
    defaultArgs: {
      symptomsDescription: "Dolor punzante en muela del juicio con inflamación facial desde hace 2 días",
      patientAge: 29,
      biologicalSex: "F",
      city: "Guadalajara",
    },
  },
  {
    name: "verify_doctor_credentials_and_quscore",
    label: "Auditoría SEP & QuScore™",
    category: "Regulatorio",
    description: "Verifica Cédula Profesional SEP, registro COFEPRIS y reputación multidimensional.",
    defaultArgs: {
      doctorId: "2041",
    },
  },
  {
    name: "create_appointment_hold",
    label: "Reserva Garantizada (Hold)",
    category: "Agendamiento",
    description: "Genera bloqueo con modalidad en consultorio o Garantía QuWallet (10% desc).",
    defaultArgs: {
      doctorId: "2041",
      dateTime: "2026-11-10T10:00:00",
      patientName: "Carlos Santana",
      patientPhone: "+523312345678",
      symptoms: "Valoración de ortodoncia invisible",
      paymentGuaranteeMode: "QUWALLET_GUARANTEE",
    },
  },
  {
    name: "attach_preconsultation_intake",
    label: "Pre-Admisión NOM-004",
    category: "Clínico",
    description: "Adjunta ficha clínica de anamnesis inicial conforme a la NOM-004-SSA3-2012.",
    defaultArgs: {
      holdId: "HOLD-AI-2041",
      chiefComplaint: "Dolor e inflamación en tercer molar inferior derecho",
      symptomDuration: "3 días",
      severityScale: 7,
      knownAllergies: "Penicilina",
      currentMedications: "Ibuprofeno 400mg",
      chronicConditions: "Ninguna",
    },
  },
  {
    name: "share_ephemeral_health_vault_context",
    label: "Health Vault™ Efímero",
    category: "Privacidad",
    description: "Genera token de lectura temporal conforme a NOM-024-SSA3-2012 y LFPDPPP.",
    defaultArgs: {
      holdId: "HOLD-AI-2041",
      sharedSections: ["ALLERGIES", "ACTIVE_MEDICATIONS", "RECENT_LABS"],
      accessDurationMinutes: 120,
    },
  },
  {
    name: "match_lab_biomarkers_to_specialists",
    label: "Biomarcadores de Lab",
    category: "Diagnóstico",
    description: "Analiza estudios de laboratorio alterados y canaliza con especialistas disponibles.",
    defaultArgs: {
      biomarkers: [
        { name: "Glucosa en ayuno", value: 136, unit: "mg/dL" },
        { name: "Colesterol Total", value: 248, unit: "mg/dL" },
      ],
      city: "Guadalajara",
      maxBudgetMxn: 1200,
    },
  },
  {
    name: "get_doctor_availability_and_quote",
    label: "Disponibilidad y Cotización",
    category: "Agendamiento",
    description: "Obtiene slots y desglose de precio de un médico específico.",
    defaultArgs: {
      doctorId: "2041",
      serviceId: "101",
    },
  },
];

const SAMPLE_PROMPTS = [
  "Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN",
  "Dermatología para acné en Monterrey menos de $1,000 MXN",
  "Pediatría certificada en Ciudad de México para recién nacido",
];

const MCP_ENDPOINT_URL = "https://api.quhealthy.org/api/v1/agent-marketplace/mcp";

export function AgentMarketplaceMcpView() {
  const [activeTab, setActiveTab] = useState<"search" | "tools">("search");
  const [query, setQuery] = useState(
    "Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN"
  );
  const [selectedTool, setSelectedTool] = useState<string>("triage_symptom_to_specialty");
  const [toolArgsJson, setToolArgsJson] = useState<string>(
    JSON.stringify(AVAILABLE_TOOLS[1].defaultArgs, null, 2)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] =
    useState<AgentMarketplaceSearchResponse | null>(null);
  const [lastStructuredResult, setLastStructuredResult] = useState<Record<string, unknown> | null>(null);
  const [lastExecutionMarkdown, setLastExecutionMarkdown] = useState<string | null>(null);
  const [mcpInspectorOpen, setMcpInspectorOpen] = useState(false);
  const [lastMcpPayload, setLastMcpPayload] = useState<{
    request: McpJsonRpcRequest;
    response: McpJsonRpcResponse;
  } | null>(null);

  const activePreset = AVAILABLE_TOOLS.find((t) => t.name === selectedTool) || AVAILABLE_TOOLS[0];

  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    const preset = AVAILABLE_TOOLS.find((t) => t.name === toolName);
    if (preset) {
      setToolArgsJson(JSON.stringify(preset.defaultArgs, null, 2));
    }
  };

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(MCP_ENDPOINT_URL);
      toast.success("URL del servidor MCP copiada al portapapeles");
    } catch {
      toast.info(MCP_ENDPOINT_URL);
    }
  };

  const handleRunAgentSearch = async (promptToRun?: string) => {
    const activeQuery = promptToRun || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    try {
      // 1. Ejecutar búsqueda estructurada en la pasarela
      const res = await agentMarketplaceService.searchMarketplace({
        query: activeQuery,
        clientAgentName: "QuHealthy Agent Sandbox UI",
      });
      setSearchResponse(res);

      // 2. Simular en paralelo la llamada MCP tools/call para el inspector JSON-RPC
      const mcpReq: McpJsonRpcRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "search_medical_marketplace",
          arguments: {
            query: activeQuery,
            requiresCertified: true,
          },
        },
      };

      const mcpRes = await agentMarketplaceService.callMcp(mcpReq);
      setLastMcpPayload({
        request: mcpReq,
        response: mcpRes,
      });

      toast.success(
        `Se encontraron ${res.totalFound} opciones verificadas en el Marketplace`
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al consultar la pasarela para agentes de IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTool = async () => {
    let parsedArgs: Record<string, unknown> = {};
    try {
      parsedArgs = JSON.parse(toolArgsJson);
    } catch {
      toast.error("JSON de argumentos inválido. Revisa la sintaxis.");
      return;
    }

    setIsLoading(true);
    setSearchResponse(null);
    setLastStructuredResult(null);
    setLastExecutionMarkdown(null);

    try {
      const mcpReq: McpJsonRpcRequest = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: selectedTool,
          arguments: parsedArgs,
        },
      };

      const mcpRes = await agentMarketplaceService.callMcp(mcpReq);
      setLastMcpPayload({
        request: mcpReq,
        response: mcpRes,
      });

      if (mcpRes.error) {
        toast.error(`Error MCP: ${mcpRes.error.message}`);
        return;
      }

      const resObj = mcpRes.result as Record<string, unknown> | undefined;
      const structured = (resObj?.structuredContent || resObj?.data || resObj) as Record<string, unknown>;
      setLastStructuredResult(structured);

      if (Array.isArray(resObj?.content) && resObj.content[0]?.text) {
        setLastExecutionMarkdown(resObj.content[0].text);
      }

      if (selectedTool === "search_medical_marketplace") {
        const searchTyped = structured as unknown as AgentMarketplaceSearchResponse;
        if (searchTyped?.quotes) {
          setSearchResponse(searchTyped);
        }
      }

      toast.success(`Herramienta '${selectedTool}' ejecutada exitosamente vía MCP`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      console.error(err);
      toast.error(`Error al ejecutar herramienta MCP: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm font-sans transition-colors space-y-8">
      {/* ── CABECERA MCP ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <Bot className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Pasarela para Agentes de IA & Servidor MCP
              </h2>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2 py-0.5">
                ● Model Context Protocol v2024-11-05
              </Badge>
              <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 rounded-full text-[10px] font-bold px-2 py-0.5">
                Inspirado en Zocdoc
              </Badge>
              <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 rounded-full text-[10px] font-bold px-2 py-0.5">
                8 Herramientas MCP
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
              Habilita que agentes de IA externos (Claude Desktop, ChatGPT,
              Gemini, asistentes personales de pacientes o bots) descubran tu
              perfil médico, coticen tus servicios y agenden citas disponibles en
              tiempo real con verificación estricta de Cédula Profesional SEP y
              COFEPRIS.
            </p>
          </div>
        </div>

        {/* Endpoint MCP para copiar */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#101010] p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0">
          <div className="space-y-0.5 px-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
              URL del Servidor MCP
            </span>
            <code className="text-[11px] font-mono text-gray-800 dark:text-gray-200">
              /api/v1/agent-marketplace/mcp
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEndpoint}
            className="h-8 px-2.5 rounded-xl border-gray-200 dark:border-gray-700 text-xs font-bold gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar</span>
          </Button>
        </div>
      </div>

      {/* ── NAVEGACIÓN ENTRE MODOS: BÚSQUEDA RÁPIDA O EXPLORADOR DE HERRAMIENTAS ── */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "search"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-[#151515] text-gray-600 dark:text-gray-300"
          }`}
        >
          🔍 Búsqueda Natural de Pacientes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "tools"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-[#151515] text-gray-600 dark:text-gray-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explorer de 8 Herramientas MCP (Triage, SEP, Vault)</span>
        </button>
      </div>

      {/* ── MODO 1: BÚSQUEDA NATURAL (ZOCDOC STYLE) ──────────────────── */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Simulador Interactivo de Consultas de Agentes</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Prueba cómo un agente de IA externo busca y recibe opciones
              médicas estructuradas con horarios y precios exactos.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRunAgentSearch();
                  }}
                  placeholder="Ej. Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                />
              </div>

              <Button
                type="button"
                disabled={isLoading || !query.trim()}
                onClick={() => handleRunAgentSearch()}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>Consultando Pasarela...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Consultar como Agente IA</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                Ejemplos:
              </span>
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setQuery(p);
                    handleRunAgentSearch(p);
                  }}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 dark:bg-[#121212] dark:hover:bg-emerald-950/30 text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODO 2: EXPLORER DE 8 HERRAMIENTAS MCP ────────────────────── */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sandbox Interactivo de Herramientas MCP QuHealthy</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selecciona cualquiera de las 8 herramientas del protocolo y prueba en vivo la respuesta clínica estructurada.
            </p>
          </div>

          {/* Selector de Herramientas MCP (Tabs/Chips) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_TOOLS.map((tool) => {
              const isSelected = selectedTool === tool.name;
              return (
                <button
                  key={tool.name}
                  type="button"
                  onClick={() => handleSelectTool(tool.name)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-2xs ring-1 ring-emerald-500/30"
                      : "bg-gray-50/60 dark:bg-[#111] border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {tool.category}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <span className="text-xs font-bold leading-tight line-clamp-1">{tool.label}</span>
                  <span className="text-[10px] text-gray-500 font-mono line-clamp-1">{tool.name}</span>
                </button>
              );
            })}
          </div>

          {/* Panel de Configuración y Ejecución del Tool */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0c0c0c] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 text-[10px] font-mono">
                    tools/call: {activePreset.name}
                  </Badge>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {activePreset.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activePreset.description}
                </p>
              </div>

              <Button
                type="button"
                disabled={isLoading}
                onClick={handleRunTool}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>Ejecutando Herramienta...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ejecutar vía MCP</span>
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Parámetros de Entrada (JSON arguments):
                </label>
                <button
                  type="button"
                  onClick={() => setToolArgsJson(JSON.stringify(activePreset.defaultArgs, null, 2))}
                  className="text-[10px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Restaurar ejemplo por defecto
                </button>
              </div>
              <textarea
                rows={5}
                value={toolArgsJson}
                onChange={(e) => setToolArgsJson(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black font-mono text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTADOS ESTRUCTURADOS DE BÚSQUEDA ─────────────────────── */}
      {searchResponse && (
        <div className="space-y-4 pt-2">
          {/* Criterios Extraídos por la IA */}
          <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#080808] border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">
                Criterios Parseados:
              </span>
              {searchResponse.extractedCriteria.specialty && (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold">
                  Especialidad: {searchResponse.extractedCriteria.specialty}
                </Badge>
              )}
              {searchResponse.extractedCriteria.city && (
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 text-[10px] font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{searchResponse.extractedCriteria.city}</span>
                </Badge>
              )}
              {searchResponse.extractedCriteria.maxPriceMxn && (
                <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 text-[10px] font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>
                    Máx: ${searchResponse.extractedCriteria.maxPriceMxn} MXN
                  </span>
                </Badge>
              )}
              <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Cédula SEP Auditada</span>
              </Badge>
            </div>

            <span className="text-[11px] font-bold text-gray-500">
              {searchResponse.totalFound} médicos verificados disponibles
            </span>
          </div>

          {/* Listado de Tarjetas de Doctores y Cotizaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResponse.quotes.map((quote) => (
              <div
                key={quote.providerId}
                className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xs space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Encabezado Doctor */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {quote.doctorName}
                        </h4>
                        {quote.isCertified && (
                          <span title="Cédula Profesional SEP y Registro COFEPRIS Verificado">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {quote.specialty}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>
                          {quote.clinicName} • {quote.city}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold">
                        ⭐ {quote.quScore}
                      </Badge>
                      <span className="text-[10px] text-gray-400">
                        {quote.reviewCount} reseñas
                      </span>
                    </div>
                  </div>

                  {/* Badge de Verificación Regulatoria */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Verificado NOM-004-SSA3
                    </Badge>
                    {quote.meetsBudget && (
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 text-[10px] font-bold">
                        ✓ Cumple Presupuesto
                      </Badge>
                    )}
                  </div>

                  {/* Bloque de Precios y Cédula SEP */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Cédula SEP Auditada:
                      </span>
                      <code className="font-mono font-bold text-gray-800 dark:text-gray-200 text-[11px] bg-white dark:bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                        {quote.cedulaProfesional}
                      </code>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/50 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Precio Final Consulta:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {quote.discountPercentage > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ${quote.basePriceMxn} MXN
                          </span>
                        )}
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          ${quote.finalPriceMxn} MXN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horarios Disponibles */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Próximos Horarios Disponibles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quote.availableSlots.map((slot) => {
                        const dateObj = new Date(slot);
                        const timeStr = dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const dateStr = dateObj.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <Badge
                            key={slot}
                            variant="outline"
                            className="text-[11px] font-mono py-1 px-2.5 bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                          >
                            <Calendar className="w-3 h-3 mr-1 text-emerald-600" />
                            {dateStr} - {timeStr}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botón de Reserva con Enlace Profundo */}
                <div className="pt-2">
                  <a
                    href={quote.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 rounded-xl bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Reservar Consulta en 1 Clic</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-[#0c0c0c] rounded-xl text-[11px] text-gray-500 dark:text-gray-400 italic border border-gray-200/60 dark:border-gray-800">
            ⚖️ {searchResponse.regulatoryDisclaimer}
          </div>
        </div>
      )}

      {/* ── RESULTADOS ESTRUCTURADOS DE OTRAS HERRAMIENTAS MCP ──────── */}
      {lastStructuredResult && !searchResponse && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resultado Clínico Interpretado</span>
            </h4>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-mono">
              Status: {String(lastStructuredResult.status || "SUCCESS")}
            </Badge>
          </div>

          {/* CASO: triage_symptom_to_specialty */}
          {selectedTool === "triage_symptom_to_specialty" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Nivel de Urgencia Calculado</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold px-2.5 py-1">
                      {String(lastStructuredResult.urgencyLevel || "ROUTINE")}
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                      Especialidad Primaria: {String(lastStructuredResult.primaryRecommendedSpecialty || "Medicina General")}
                    </Badge>
                  </div>
                </div>
              </div>

              {Boolean(lastStructuredResult.hasRedFlags) && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Se identificaron posibles banderas rojas. Se recomienda valorar atención prioritaria.</span>
                </div>
              )}

              {Array.isArray(lastStructuredResult.suggestedFollowUpQuestions) && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Preguntas de Seguimiento para el Agente:</span>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    {lastStructuredResult.suggestedFollowUpQuestions.map((q, idx) => (
                      <li key={idx}>{String(q)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* CASO: verify_doctor_credentials_and_quscore */}
          {selectedTool === "verify_doctor_credentials_and_quscore" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {String(lastStructuredResult.fullName || "Médico Verificado")}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600">
                    {String(lastStructuredResult.specialty || "")}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{String(lastStructuredResult.institution || "")}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                  ⭐ {String(lastStructuredResult.quScore || 4.9)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Cédula Profesional SEP</span>
                  <p className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {String(lastStructuredResult.sepLicenseDegree || "")}
                  </p>
                  <Badge className="bg-emerald-50 text-emerald-700 text-[9px]">
                    {String(lastStructuredResult.sepStatus || "VERIFICADA_ACTIVA_SEP")}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Aviso COFEPRIS</span>
                  <p className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {String(lastStructuredResult.cofeprisNoticeNumber || "")}
                  </p>
                  <Badge className="bg-blue-50 text-blue-700 text-[9px]">
                    {String(lastStructuredResult.cofeprisStatus || "VIGENTE")}
                  </Badge>
                </div>
              </div>

              {Boolean(lastStructuredResult.quScoreBreakdown) && typeof lastStructuredResult.quScoreBreakdown === "object" ? (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Desglose Dinámico QuScore™</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(lastStructuredResult.quScoreBreakdown as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                        <span className="text-[9px] text-gray-400 uppercase block">{k}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* CASO: create_appointment_hold */}
          {selectedTool === "create_appointment_hold" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">Folio de Pre-Reserva</span>
                  <h4 className="text-base font-mono font-bold text-gray-900 dark:text-white">
                    {String(lastStructuredResult.holdId || "")}
                  </h4>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold">
                  Modalidad: {String(lastStructuredResult.paymentGuaranteeMode || "PAY_AT_CLINIC")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Boolean(lastStructuredResult.whatsappConfirmationLink) && (
                  <a
                    href={String(lastStructuredResult.whatsappConfirmationLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 hover:border-emerald-300 text-emerald-800 dark:text-emerald-200 flex items-center justify-between font-bold"
                  >
                    <span>📲 Confirmar Cita por WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {Boolean(lastStructuredResult.quWalletCheckoutUrl) && (
                  <a
                    href={String(lastStructuredResult.quWalletCheckoutUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 hover:border-indigo-300 text-indigo-800 dark:text-indigo-200 flex items-center justify-between font-bold"
                  >
                    <span>💳 Garantizar con QuWallet (-10%)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* CASO: attach_preconsultation_intake */}
          {selectedTool === "attach_preconsultation_intake" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                  NOM-004-SSA3-2012 Compliant
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs font-bold">
                  Escala Dolor/Severidad: {String(lastStructuredResult.severityScale || "N/A")}/10
                </Badge>
              </div>
              {Boolean(lastStructuredResult.clinicalBriefMarkdown) && (
                <pre className="p-3.5 bg-gray-50 dark:bg-[#111] rounded-xl text-xs font-sans text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {String(lastStructuredResult.clinicalBriefMarkdown)}
                </pre>
              )}
            </div>
          )}

          {/* CASO: share_ephemeral_health_vault_context */}
          {selectedTool === "share_ephemeral_health_vault_context" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>NOM-024-SSA3-2012 & LFPDPPP</span>
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 text-xs font-mono">
                  Audit: {String(lastStructuredResult.auditLogId || "")}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">URL Temporal para Especialista:</span>
                  <a
                    href={String(lastStructuredResult.ephemeralAccessUrl || "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-600 dark:text-emerald-400 underline block break-all"
                  >
                    {String(lastStructuredResult.ephemeralAccessUrl || "")}
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">URL de Revocación Inmediata (Control Paciente):</span>
                  <a
                    href={String(lastStructuredResult.revokeAccessUrl || "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-rose-600 dark:text-rose-400 underline block break-all"
                  >
                    {String(lastStructuredResult.revokeAccessUrl || "")}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* CASO: match_lab_biomarkers_to_specialists */}
          {selectedTool === "match_lab_biomarkers_to_specialists" && (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                    Prioridad Clínica: {String(lastStructuredResult.clinicalPriority || "MEDIUM")}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                    Especialidad Sugerida: {String(lastStructuredResult.primaryRecommendedSpecialty || "")}
                  </Badge>
                </div>
              </div>

              {Array.isArray(lastStructuredResult.flaggedBiomarkers) && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Biomarcadores Alterados Detectados:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {lastStructuredResult.flaggedBiomarkers.map((fb: Record<string, unknown>, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>{String(fb.name)}</span>
                          <code className="text-rose-700 dark:text-rose-400 font-mono">{String(fb.value)}</code>
                        </div>
                        <p className="text-[11px] text-gray-500">Ref: {String(fb.referenceRange)}</p>
                        <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">{String(fb.clinicalInterpretation)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Texto Markdown devuelto por el MCP */}
          {lastExecutionMarkdown && (
            <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {lastExecutionMarkdown}
            </div>
          )}
        </div>
      )}

      {/* ── INSPECTOR MCP JSON-RPC 2.0 ───────────────────────────── */}
      {lastMcpPayload && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mt-4">
          <button
            type="button"
            onClick={() => setMcpInspectorOpen(!mcpInspectorOpen)}
            className="w-full p-4 bg-gray-50 dark:bg-[#0c0c0c] hover:bg-gray-100/70 dark:hover:bg-[#141414] transition-colors flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Inspector de Protocolo MCP (Trama JSON-RPC 2.0 tools/call)</span>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">
                Compatible con Claude Desktop & Antigravity
              </Badge>
            </div>
            {mcpInspectorOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {mcpInspectorOpen && (
            <div className="p-4 bg-gray-950 text-gray-200 font-mono text-[11px] space-y-3 overflow-x-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                  1. Petición JSON-RPC 2.0 (Enviada por el Agente de IA):
                </span>
                <pre className="p-3 bg-black/60 rounded-xl overflow-x-auto text-emerald-300">
                  {JSON.stringify(lastMcpPayload.request, null, 2)}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">
                  2. Respuesta MCP (Devuelta por QuHealthy al Agente):
                </span>
                <pre className="p-3 bg-black/60 rounded-xl overflow-x-auto text-cyan-300 max-h-60">
                  {JSON.stringify(lastMcpPayload.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GUÍA RÁPIDA DE CONFIGURACIÓN MCP PARA DESARROLLADORES ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-200 dark:border-gray-800 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>¿Cómo conectar este servidor MCP a tu agente personal?</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
            Conecta tu IA (Claude Desktop, Cursor, Gemini CLI o agentes autónomos) para buscar médicos certificados, cotizaciones y agendar citas en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Opción 1: Conexión Directa */}
          <div className="space-y-2 p-4 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                1. Conexión Directa (Streamable HTTP)
              </span>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">
                Recomendado
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Para Claude Desktop, Cursor y clientes compatibles con transporte HTTP moderno:
            </p>
            <pre className="p-3 bg-gray-900 dark:bg-black rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "quhealthy": {
      "url": "https://api.quhealthy.org/api/v1/agent-marketplace/mcp"
    }
  }
}`}
            </pre>
          </div>

          {/* Opción 2: Proxy stdio */}
          <div className="space-y-2 p-4 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                2. Conexión stdio vía mcp-remote
              </span>
              <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[10px]">
                Legacy / CLI
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Para clientes locales que únicamente aceptan comandos de subproceso stdio:
            </p>
            <pre className="p-3 bg-gray-900 dark:bg-black rounded-lg text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "quhealthy": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.quhealthy.org/api/v1/agent-marketplace/mcp"
      ]
    }
  }
}`}
            </pre>
          </div>
        </div>

        {/* ChatGPT Actions Tip */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5 text-xs">
          <Bot className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-gray-600 dark:text-gray-300">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">¿Usas ChatGPT Actions?</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Importa directamente el esquema OpenAPI 3.1.0 desde{" "}
              <a
                href="https://api.quhealthy.org/api/v1/agent-marketplace/openapi.json"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
              >
                https://api.quhealthy.org/api/v1/agent-marketplace/openapi.json
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
