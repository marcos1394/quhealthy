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

const SAMPLE_PROMPTS = [
  "Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN",
  "Dermatología para acné en Monterrey menos de $1,000 MXN",
  "Pediatría certificada en Ciudad de México para recién nacido",
];

const MCP_ENDPOINT_URL = "https://api.quhealthy.org/api/v1/agent-marketplace/mcp";

export function AgentMarketplaceMcpView() {
  const [query, setQuery] = useState(
    "Consulta de ortodoncia en Guadalajara con doctor certificado por menos de $800 MXN"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] =
    useState<AgentMarketplaceSearchResponse | null>(null);
  const [mcpInspectorOpen, setMcpInspectorOpen] = useState(false);
  const [lastMcpPayload, setLastMcpPayload] = useState<{
    request: McpJsonRpcRequest;
    response: McpJsonRpcResponse;
  } | null>(null);

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

      {/* ── SIMULADOR / AGENT SANDBOX ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
        </div>

        {/* Input de Búsqueda */}
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

          {/* Prompt pills rápidos */}
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

        {/* ── RESULTADOS ESTRUCTURADOS ─────────────────────────────── */}
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

                      {/* Calificación QuScore */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-end gap-1">
                          <span className="text-amber-500">★</span>{" "}
                          {quote.quScore}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {quote.reviewCount} reseñas
                        </span>
                      </div>
                    </div>

                    {/* Badge Cédula Profesional */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {quote.cedulaProfesional}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Verificado NOM-004-SSA3
                      </span>
                    </div>

                    {/* Cotización y Precio Transparente */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#101010] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          {quote.serviceName}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-gray-900 dark:text-white">
                            ${quote.finalPriceMxn} MXN
                          </span>
                          {quote.discountPercentage > 0 && (
                            <span className="text-[10px] line-through text-gray-400">
                              ${quote.basePriceMxn} MXN
                            </span>
                          )}
                        </div>
                      </div>

                      {quote.meetsBudget && (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold">
                          ✓ Cumple Presupuesto
                        </Badge>
                      )}
                    </div>

                    {/* Slots Verificados Disponibles */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>Próximos Horarios Verificados (En Tiempo Real)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {quote.availableSlots.slice(0, 4).map((slot) => {
                          const dateObj = new Date(slot);
                          const formatted = isNaN(dateObj.getTime())
                            ? slot
                            : dateObj.toLocaleDateString("es-MX", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                          return (
                            <span
                              key={slot}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{formatted}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Enlace Directo / Hold */}
                  <a
                    href={quote.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-9 rounded-xl bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
                  >
                    <span>Reservar Consulta en 1 Clic</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Aviso Regulatorio */}
            <p className="text-[10px] text-gray-400 italic text-center pt-2">
              {searchResponse.regulatoryDisclaimer}
            </p>
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
                <span>
                  Inspector de Protocolo MCP (Trama JSON-RPC 2.0 tools/call)
                </span>
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
      </div>

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
