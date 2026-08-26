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
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

interface CrmConversation {
  id: string;
  providerId: number;
  platform: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  leadCategory?: "DOCTOR_PROSPECT" | "CLINIC_QUOTE" | "SUPPORT" | "GENERAL";
}

interface CrmMessage {
  id: string;
  conversationId: string;
  senderType: "USER" | "AGENT" | "AI";
  senderName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
}

export const TabAdminCrm: React.FC = () => {
  const [conversations, setConversations] = useState<CrmConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<CrmConversation | null>(null);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await adminService.getAdminCrmConversations(0, 50);
      const list = res?.content || res || [];
      setConversations(list);
      if (list.length > 0 && !selectedConversation) {
        setSelectedConversation(list[0]);
      }
    } catch (err) {
      console.error("Error cargando conversaciones CRM", err);
      // Si la BD aún no tiene mensajes de webhook reales, iniciamos con lista vacía
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await adminService.getAdminCrmMessages(convId, 0, 50);
      const msgList = res?.content || res || [];
      setMessages(msgList);
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      setSendingMessage(true);
      const newMsg = await adminService.sendAdminCrmMessage(selectedConversation.id, {
        text: messageText,
      });

      setMessages((prev) => [
        ...prev,
        newMsg || {
          id: `temp_${Date.now()}`,
          conversationId: selectedConversation.id,
          senderType: "AGENT",
          senderName: "Equipo Quhealthy",
          content: messageText,
          createdAt: new Date().toISOString(),
        },
      ]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error enviando mensaje", err);
      toast.error("No se pudo enviar el mensaje a través del canal oficial.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!selectedConversation || messages.length === 0) {
      toast.info("No hay suficientes mensajes para generar una sugerencia contextual.");
      return;
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.senderType === "USER")?.content || selectedConversation.lastMessage;

    try {
      setGeneratingAi(true);
      const res = await adminService.getAdminAiSuggestedReply(selectedConversation.id, lastUserMsg);
      if (res?.suggestedReply || res?.reply) {
        setInputText(res.suggestedReply || res.reply);
        toast.success("Sugerencia de IA generada.");
      } else {
        toast.info("No se generó una sugerencia.");
      }
    } catch (err) {
      console.error("Error en sugerencia IA", err);
      toast.error("Servicio de IA ocupado o sin respuesta.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.senderPhone && c.senderPhone.includes(searchTerm)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlatform = filterPlatform === "ALL" || c.platform?.toUpperCase() === filterPlatform;

    return matchesSearch && matchesPlatform;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform?.toUpperCase()) {
      case "WHATSAPP":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">WhatsApp</span>;
      case "INSTAGRAM":
        return <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold">Instagram</span>;
      case "FACEBOOK":
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Facebook</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{platform || "Chat"}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" /> Centro de Atención & Leads Institucional
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Admin CRM Omnicanal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona prospectos médicos, cotizaciones clínicas y soporte a usuarios desde los canales oficiales de Quhealthy.
          </p>
        </div>

        <button
          onClick={loadConversations}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingConversations ? "animate-spin" : ""}`} />
          Refrescar Chats
        </button>
      </div>

      {/* Main CRM Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Panel Izquierdo: Lista de Conversaciones */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Barra de Filtros & Búsqueda */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prospecto o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Chips de Plataforma */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["ALL", "WHATSAPP", "INSTAGRAM", "FACEBOOK"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                    filterPlatform === p
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p === "ALL" ? "Todos" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Lista scrolleable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs">Cargando conversaciones...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600">No hay mensajes entrantes</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Cuando un médico o cliente escriba al WhatsApp o redes oficiales de Quhealthy, aparecerá aquí en tiempo real.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                      isSelected ? "bg-indigo-50/70 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {conv.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {conv.senderName}
                        </span>
                        {getPlatformBadge(conv.platform)}
                      </div>
                      <p className="text-xs text-slate-500 truncate leading-relaxed">
                        {conv.lastMessage || "Sin mensajes"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Central y Derecho: Hilo de Conversación */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Cabecera del Chat */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedConversation.senderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {selectedConversation.senderName}
                      {getPlatformBadge(selectedConversation.platform)}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedConversation.senderPhone || selectedConversation.senderEmail || "Contacto Directo"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    En vivo
                  </span>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                {loadingMessages ? (
                  <div className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-xs">Inicia la conversación enviando un mensaje abajo.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAgent = msg.senderType === "AGENT" || msg.senderType === "AI";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                            isAgent
                              ? "bg-slate-900 text-white rounded-br-none"
                              : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
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

              {/* Caja de Input + Sugerencias IA */}
              <div className="p-4 border-t border-slate-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={generatingAi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? "animate-spin" : "text-indigo-500"}`} />
                    {generatingAi ? "Generando respuesta IA..." : "Sugerencia Copilot IA"}
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una respuesta institucional..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !inputText.trim()}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Selecciona una conversación</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Elige un prospecto o usuario de la lista de la izquierda para responder en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
