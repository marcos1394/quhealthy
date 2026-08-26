"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Bot,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  Star,
  Zap,
  Check,
  Flame,
  ChevronRight,
  Layers,
  Inbox,
  Kanban,
  Radar,
  SlidersHorizontal,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

export type FunnelStage =
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUALIFIED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface CrmConversation {
  id: string;
  providerId: number;
  platform: string;
  contactName?: string;
  senderName?: string;
  externalContactId: string;
  senderPhone?: string;
  senderEmail?: string;
  contactPhone?: string;
  contactEmail?: string;
  lastMessage?: string;
  lastMessagePreview?: string;
  lastMessageAt: string;
  unreadCount?: number;
  isRead: boolean;
  status: string;
  funnelStage: FunnelStage;
  leadSource?: string;
  leadScore: number;
  interestedPlan?: string;
  aiSummary?: string;
  aiSuggestedAction?: string;
  aiAutoResponderEnabled?: boolean;
}

export interface CrmMessage {
  id: string;
  conversationId?: string;
  direction?: "INBOUND" | "OUTBOUND";
  senderType?: "USER" | "AGENT" | "AI";
  senderName?: string;
  type?: string;
  content: string;
  mediaUrl?: string;
  status?: string;
  createdAt: string;
}

export interface ProspectLead {
  conversationId?: string;
  platform: string;
  authorName: string;
  authorId: string;
  postUrlOrId: string;
  commentText: string;
  leadScore: number;
  interestedPlan: string;
  intentSummary: string;
  suggestedAction: string;
  suggestedReply: string;
  detectedAt: string;
}

const FUNNEL_STAGES_CONFIG: Array<{
  key: FunnelStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  { key: "NEW_LEAD", label: "Nuevos Leads", color: "text-sky-700", bgColor: "bg-sky-50", borderColor: "border-sky-200" },
  { key: "CONTACTED", label: "Contactados", color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { key: "QUALIFIED", label: "Calificados", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { key: "DEMO_SCHEDULED", label: "Demo Agendada", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { key: "PROPOSAL_SENT", label: "Propuesta Enviada", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { key: "WON", label: "Ganados (Clientes)", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { key: "LOST", label: "Perdidos / Descartados", color: "text-slate-600", bgColor: "bg-slate-100", borderColor: "border-slate-300" },
];

export const TabAdminCrm: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<"inbox" | "funnel" | "prospector">("inbox");

  // State
  const [conversations, setConversations] = useState<CrmConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<CrmConversation | null>(null);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const [prospects, setProspects] = useState<ProspectLead[]>([]);
  const [funnelStats, setFunnelStats] = useState<any>(null);

  // Loadings
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [syncingMessages, setSyncingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [scanningProspects, setScanningProspects] = useState(false);

  // Filters & Inputs
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ tone: string; text: string }>>([]);
  const [showLeadDetails, setShowLeadDetails] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Cargar Conversaciones
  const loadConversations = useCallback(async (autoSelectFirst = true) => {
    try {
      setLoadingConversations(true);
      const res = await adminService.getAdminCrmConversations(0, 100);
      const list: CrmConversation[] = res?.content || res || [];
      setConversations(list);

      if (list.length > 0) {
        if (autoSelectFirst && !selectedConversation) {
          setSelectedConversation(list[0]);
        } else if (selectedConversation) {
          const updated = list.find((c) => c.id === selectedConversation.id);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (err) {
      console.error("Error cargando conversaciones CRM", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversation]);

  // 2. Cargar Estadísticas del Funnel
  const loadFunnelStats = useCallback(async () => {
    try {
      const stats = await adminService.getAdminFunnelStats();
      setFunnelStats(stats);
    } catch (err) {
      console.error("Error cargando funnel stats", err);
    }
  }, []);

  // 3. Sincronización Manual con Meta (FB e IG)
  const handleSyncMetaMessages = async () => {
    try {
      setSyncingMessages(true);
      const res = await adminService.syncAdminCrmMessages();
      toast.success(
        `Sincronización completada: ${res.conversationsSynced || 0} chats y ${res.messagesSynced || 0} mensajes actualizados.`
      );
      await loadConversations(false);
      await loadFunnelStats();
    } catch (err) {
      console.error("Error sincronizando mensajes de Meta", err);
      toast.error("No se pudieron sincronizar los mensajes de Meta Graph API.");
    } finally {
      setSyncingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadFunnelStats();
  }, [loadConversations, loadFunnelStats]);

  // 4. Cargar Mensajes de una conversación
  const loadMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await adminService.getAdminCrmMessages(convId, 0, 100);
      const msgList = res?.content || res || [];
      // Orden cronológico (antiguos arriba, nuevos abajo)
      const sorted = [...msgList].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sorted);
      setAiSuggestions([]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error cargando mensajes", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  // 5. Enviar Mensaje
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedConversation) return;

    setInputText("");

    try {
      setSendingMessage(true);
      const newMsg = await adminService.sendAdminCrmMessage(selectedConversation.id, {
        text: text.trim(),
      });

      setMessages((prev) => [
        ...prev,
        newMsg || {
          id: `temp_${Date.now()}`,
          conversationId: selectedConversation.id,
          direction: "OUTBOUND",
          senderType: "AGENT",
          senderName: "Quhealthy",
          content: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      setAiSuggestions([]);
      setTimeout(scrollToBottom, 100);
      loadConversations(false);
      loadFunnelStats();
    } catch (err) {
      console.error("Error enviando mensaje", err);
      toast.error("No se pudo enviar el mensaje a través del canal oficial.");
    } finally {
      setSendingMessage(false);
    }
  };

  // 6. Generar Sugerencias de Copiloto IA (con contexto de Quhealthy)
  const handleAiSuggest = async () => {
    if (!selectedConversation) return;

    try {
      setGeneratingAi(true);
      const lastInbound = [...messages].reverse().find((m) => m.direction === "INBOUND" || m.senderType === "USER")?.content || selectedConversation.lastMessagePreview || "";
      const res = await adminService.getAdminAiSuggestedReply(selectedConversation.id, lastInbound);
      
      if (res?.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
        toast.success("Sugerencias de IA con contexto de Quhealthy listas.");
      } else if (res?.suggestedReply || res?.reply) {
        setInputText(res.suggestedReply || res.reply);
        toast.success("Respuesta sugerida generada.");
      } else {
        toast.info("No se generaron sugerencias para este mensaje.");
      }
    } catch (err) {
      console.error("Error en sugerencia IA", err);
      toast.error("Servicio de IA ocupado o sin respuesta.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // 7. Toggle Auto-Responder IA
  const handleToggleAutoResponder = async () => {
    if (!selectedConversation) return;
    const newState = !selectedConversation.aiAutoResponderEnabled;
    try {
      const updated = await adminService.toggleAdminAutoResponder(selectedConversation.id, newState);
      setSelectedConversation((prev) => (prev ? { ...prev, aiAutoResponderEnabled: newState } : null));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, aiAutoResponderEnabled: newState } : c))
      );
      toast.success(
        newState
          ? "🤖 Piloto Automático IA activado para este chat."
          : "⏹️ Piloto Automático IA desactivado."
      );
    } catch (err) {
      toast.error("No se pudo actualizar el modo auto-responder.");
    }
  };

  // 8. Actualizar Etapa de Funnel
  const handleUpdateStage = async (stage: FunnelStage, plan?: string) => {
    if (!selectedConversation) return;
    try {
      await adminService.updateAdminLeadStage(selectedConversation.id, {
        funnelStage: stage,
        interestedPlan: plan || selectedConversation.interestedPlan,
      });
      setSelectedConversation((prev) => (prev ? { ...prev, funnelStage: stage, interestedPlan: plan || prev.interestedPlan } : null));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, funnelStage: stage, interestedPlan: plan || c.interestedPlan } : c
        )
      );
      loadFunnelStats();
      toast.success(`Lead movido a: ${FUNNEL_STAGES_CONFIG.find((s) => s.key === stage)?.label || stage}`);
    } catch (err) {
      toast.error("No se pudo mover la etapa del lead.");
    }
  };

  // 9. Escanear Redes con IA (Radar de Leads)
  const handleScanProspects = async () => {
    try {
      setScanningProspects(true);
      const results = await adminService.scanAdminLeadProspects();
      setProspects(results || []);
      toast.success(`Radar IA: ${results?.length || 0} prospectos calificados en publicaciones.`);
      loadConversations(false);
      loadFunnelStats();
    } catch (err) {
      console.error("Error escaneando prospectos", err);
      toast.error("Error al escanear comentarios con IA.");
    } finally {
      setScanningProspects(false);
    }
  };

  // Filtrado de Conversaciones
  const filteredConversations = conversations.filter((c) => {
    const name = (c.contactName || c.senderName || "").toLowerCase();
    const phone = (c.contactPhone || c.senderPhone || c.externalContactId || "").toLowerCase();
    const lastMsg = (c.lastMessagePreview || c.lastMessage || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || phone.includes(search) || lastMsg.includes(search);
    const matchesPlatform = filterPlatform === "ALL" || c.platform?.toUpperCase() === filterPlatform;
    const matchesStage = filterStage === "ALL" || c.funnelStage === filterStage;

    return matchesSearch && matchesPlatform && matchesStage;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform?.toUpperCase()) {
      case "WHATSAPP":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">WhatsApp</span>;
      case "INSTAGRAM":
        return <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold">Instagram</span>;
      case "FACEBOOK":
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Facebook</span>;
      case "EMAIL":
      case "GMAIL":
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">Gmail</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{platform || "Chat"}</span>;
    }
  };

  const getStageBadge = (stage: FunnelStage) => {
    const config = FUNNEL_STAGES_CONFIG.find((s) => s.key === stage) || FUNNEL_STAGES_CONFIG[0];
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Principal con Selector de Modos y Acciones */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Centro de Leads & CRM Quhealthy
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Gestión Comercial & IA Omnicanal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inbox oficial con sincronización de Facebook, Instagram y WhatsApp, copiloto comercial con contexto de Quhealthy y pipeline de ventas.
          </p>
        </div>

        {/* Switcher de Vistas */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "inbox"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" /> Inbox & Chat
          </button>
          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "funnel"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Pipeline Funnel
          </button>
          <button
            onClick={() => setActiveTab("prospector")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "prospector"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-amber-500" /> Radar Leads IA
          </button>
        </div>

        {/* Botón Sincronizar */}
        <button
          onClick={handleSyncMetaMessages}
          disabled={syncingMessages}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingMessages ? "animate-spin text-amber-400" : ""}`} />
          {syncingMessages ? "Sincronizando Meta..." : "Sincronizar Mensajes"}
        </button>
      </div>

      {/* KPI Stats Bar (Visible en Funnel y accesible) */}
      {funnelStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Total Leads</span>
            <div className="text-xl font-bold text-slate-900">{funnelStats.totalLeads || 0}</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-sky-700">Nuevos</span>
            <div className="text-xl font-bold text-sky-900">{funnelStats.newLeads || 0}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-indigo-700">Contactados</span>
            <div className="text-xl font-bold text-indigo-900">{funnelStats.contacted || 0}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700">Calificados</span>
            <div className="text-xl font-bold text-amber-900">{funnelStats.qualified || 0}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-700">Demos</span>
            <div className="text-xl font-bold text-purple-900">{funnelStats.demoScheduled || 0}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700">Ganados</span>
            <div className="text-xl font-bold text-emerald-900">{funnelStats.won || 0}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Conversión</span>
            <div className="text-xl font-bold text-indigo-600">{funnelStats.conversionRate || 0}%</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: INBOX & CHAT OMNICANAL                                           */}
      {/* ========================================================================= */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[760px]">
          {/* Panel Izquierdo: Lista de Conversaciones */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            {/* Buscador y Filtros */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar lead, teléfono o mensaje..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Filtros de Plataforma */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {["ALL", "INSTAGRAM", "FACEBOOK", "WHATSAPP", "GMAIL"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      filterPlatform === p
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p === "ALL" ? "Todos" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Scrolleable de Chats */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConversations ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs">Cargando conversaciones...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Sin mensajes en este filtro</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Pulsa &quot;Sincronizar Mensajes&quot; para importar los DMs de tu página de Facebook e Instagram.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const name = conv.contactName || conv.senderName || "Contacto";
                  const preview = conv.lastMessagePreview || conv.lastMessage || "Sin mensajes";

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 border-l-4 ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-600"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900 text-xs truncate">{name}</span>
                          <div className="flex items-center gap-1">
                            {conv.leadScore > 50 && (
                              <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                                {conv.leadScore}
                              </span>
                            )}
                            {getPlatformBadge(conv.platform)}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate leading-relaxed">{preview}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                          {getStageBadge(conv.funnelStage || "NEW_LEAD")}
                          {conv.aiAutoResponderEnabled && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <Bot className="w-3 h-3" /> Auto-IA
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel Central: Hilo de Mensajes */}
          <div className={`${showLeadDetails ? "lg:col-span-5" : "lg:col-span-8"} bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden`}>
            {selectedConversation ? (
              <>
                {/* Header del Chat */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {(selectedConversation.contactName || selectedConversation.senderName || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {selectedConversation.contactName || selectedConversation.senderName}
                        {getPlatformBadge(selectedConversation.platform)}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        ID: {selectedConversation.externalContactId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Switch Auto-Responder */}
                    <button
                      onClick={handleToggleAutoResponder}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        selectedConversation.aiAutoResponderEnabled
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Bot className="w-3 h-3" />
                      {selectedConversation.aiAutoResponderEnabled ? "Auto-IA ON" : "Auto-IA OFF"}
                    </button>

                    <button
                      onClick={() => setShowLeadDetails(!showLeadDetails)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs"
                      title="Detalles del Lead"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hilo de Mensajes */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                  {loadingMessages ? (
                    <div className="p-10 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <p className="text-xs">No hay mensajes previos registrados.</p>
                      <p className="text-[11px] text-slate-400">Escribe una respuesta para iniciar el contacto.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOutbound = msg.direction === "OUTBOUND" || msg.senderType === "AGENT" || msg.senderType === "AI";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                              isOutbound
                                ? "bg-slate-900 text-white rounded-br-xs"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sugerencias de Copilot IA */}
                {aiSuggestions.length > 0 && (
                  <div className="p-3 bg-indigo-50/90 border-t border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Sugerencias Copiloto Quhealthy
                      </span>
                      <button
                        onClick={() => setAiSuggestions([])}
                        className="text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {aiSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s.text)}
                          className="p-2 text-left bg-white border border-indigo-200/80 rounded-xl hover:border-indigo-500 hover:shadow-xs transition-all text-[11px] text-slate-700 leading-snug flex items-start justify-between gap-2 group"
                        >
                          <span className="flex-1">{s.text}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[9px] rounded uppercase shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {s.tone} • Enviar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input de Mensajes */}
                <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleAiSuggest}
                      disabled={generatingAi}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? "animate-spin" : "text-amber-500"}`} />
                      {generatingAi ? "Consultando contexto..." : "Generar Sugerencia IA"}
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Escribe una respuesta institucional..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !inputText.trim()}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Selecciona una conversación</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Elige un lead de la lista o sincroniza tus canales para ver los mensajes entrantes.
                </p>
              </div>
            )}
          </div>

          {/* Panel Derecho: Ficha del Lead en el CRM */}
          {showLeadDetails && selectedConversation && (
            <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Ficha de Lead CRM
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Score: {selectedConversation.leadScore}/100
                </span>
              </div>

              {/* Etapa del Funnel */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Etapa en el Funnel</label>
                <select
                  value={selectedConversation.funnelStage || "NEW_LEAD"}
                  onChange={(e) => handleUpdateStage(e.target.value as FunnelStage)}
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                >
                  {FUNNEL_STAGES_CONFIG.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan de Interés */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Plan de Interés</label>
                <select
                  value={selectedConversation.interestedPlan || "GENERAL"}
                  onChange={(e) => handleUpdateStage(selectedConversation.funnelStage, e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="GENERAL">General / Indeciso</option>
                  <option value="FREE">Gratis ($0 MXN)</option>
                  <option value="BASIC">Básico ($499 MXN)</option>
                  <option value="PRO">Profesional / Pro ($999 MXN)</option>
                  <option value="ENTERPRISE">Clínicas / Enterprise ($1,999 MXN)</option>
                </select>
              </div>

              {/* Resumen / Análisis de IA */}
              {selectedConversation.aiSummary && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Resumen de Interés IA
                  </span>
                  <p className="text-[11px] text-amber-950 leading-relaxed">
                    {selectedConversation.aiSummary}
                  </p>
                </div>
              )}

              {/* Acción Sugerida */}
              {selectedConversation.aiSuggestedAction && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-indigo-600" /> Próxima Acción Comercial
                  </span>
                  <p className="text-[11px] text-indigo-950 font-medium">
                    {selectedConversation.aiSuggestedAction}
                  </p>
                </div>
              )}

              {/* Enlaces Rápidos de Conversión */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enlaces de Conversión</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <a
                    href="https://quhealthy.org/es/auth/register"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    <span>Registro Oficial Quhealthy</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://quhealthy.org/es/contacto"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    <span>Agendar Demo de Software</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PIPELINE FUNNEL KANBAN                                           */}
      {/* ========================================================================= */}
      {activeTab === "funnel" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {FUNNEL_STAGES_CONFIG.map((stage) => {
              const stageLeads = conversations.filter((c) => (c.funnelStage || "NEW_LEAD") === stage.key);

              return (
                <div
                  key={stage.key}
                  className="flex-1 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col h-[680px]"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Tarjetas de Leads */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 font-medium">
                        Sin prospectos
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const name = lead.contactName || lead.senderName || "Contacto";
                        return (
                          <div
                            key={lead.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 truncate">{name}</span>
                              {getPlatformBadge(lead.platform)}
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {lead.lastMessagePreview || lead.aiSummary || "Sin resumen"}
                            </p>

                            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {lead.interestedPlan || "PRO"}
                              </span>
                              <span className="font-semibold text-slate-400">Score: {lead.leadScore}</span>
                            </div>

                            {/* Acciones de Tarjeta */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => {
                                  setSelectedConversation(lead);
                                  setActiveTab("inbox");
                                }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                Abrir Chat <ChevronRight className="w-3 h-3" />
                              </button>

                              <select
                                value={lead.funnelStage}
                                onChange={(e) => {
                                  setSelectedConversation(lead);
                                  handleUpdateStage(e.target.value as FunnelStage);
                                }}
                                className="text-[10px] font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                              >
                                {FUNNEL_STAGES_CONFIG.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    Mover a {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: RADAR DE LEADS IA (OUTBOUND & COMENTARIOS)                        */}
      {/* ========================================================================= */}
      {activeTab === "prospector" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radar className="w-5 h-5 text-amber-500" /> Radar de Leads IA en Redes Sociales
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                La IA escanea automáticamente comentarios y reacciones en tus publicaciones de Facebook e Instagram para descubrir médicos y clínicas interesados en Quhealthy.
              </p>
            </div>

            <button
              onClick={handleScanProspects}
              disabled={scanningProspects}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${scanningProspects ? "animate-spin text-white" : ""}`} />
              {scanningProspects ? "Analizando Comentarios..." : "Escanear Redes con IA"}
            </button>
          </div>

          {/* Resultados del Escaneo */}
          {prospects.length === 0 && !scanningProspects ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                <Radar className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Radar en espera</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Haz clic en &quot;Escanear Redes con IA&quot; para buscar comentarios comerciales y consultas de precios en tus publicaciones recientes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prospects.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{p.authorName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Score: {p.leadScore}
                        </span>
                        {getPlatformBadge(p.platform)}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 italic">
                      &quot;{p.commentText}&quot;
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">Intención Comercial:</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{p.intentSummary}</p>
                    </div>

                    <div className="p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1 text-[11px]">
                      <span className="font-bold text-indigo-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Respuesta IA Sugerida:
                      </span>
                      <p className="text-slate-700 leading-snug">{p.suggestedReply}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">Plan Sugerido: {p.interestedPlan}</span>
                    <button
                      onClick={() => {
                        loadConversations(true);
                        setActiveTab("inbox");
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Ver en Inbox
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
