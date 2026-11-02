"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, MessageSquare, X, CheckCheck } from "lucide-react";

import { Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/SessionStore";
import { formatChatSidebarTime } from "@/lib/formatMessageTime";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conv: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: ChatSidebarProps) {
  const t = useTranslations("PatientMessages");
  const { user, role } = useSessionStore();
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const isProvider =
    role === "ROLE_PROVIDER" ||
    role === "ROLE_STAFF" ||
    user?.role === "ROLE_PROVIDER" ||
    user?.role === "ROLE_STAFF";

  const fallbackName = isProvider ? t("patient_label") : t("specialist");

  // Filtrado por texto y por pestaña activa (Todos / No leídos)
  const filtered = conversations.filter((c) => {
    const nameMatch = (c.provider?.name || c.otherParticipantName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!nameMatch) return false;

    if (activeFilter === "unread") {
      return c.unreadCount && c.unreadCount > 0;
    }
    return true;
  });

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );

  return (
    <div className="w-full md:w-80 lg:w-[380px] border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#111b21] h-full shrink-0 font-sans transition-colors select-none">
      {/* ── HEADER WHATSAPP-STYLE Y BUSCADOR ─────────────────────────────── */}
      <div className="p-3.5 pb-2.5 border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#111b21] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e9edef] tracking-tight">
            {t("chats_header_title")}
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono font-semibold text-[11px] text-gray-500 dark:text-gray-400">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Barra de Búsqueda tipo Píldora */}
        <div className="relative flex items-center">
          <Search
            className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isProvider
                ? t("search_placeholder_provider")
                : t("search_placeholder")
            }
            className="w-full pl-10 pr-9 rounded-xl bg-gray-100/80 dark:bg-[#202c33] border-0 h-9 text-xs font-medium text-gray-900 dark:text-[#e9edef] focus:outline-none focus:ring-1 focus:ring-emerald-500/30 placeholder:text-gray-400 dark:placeholder:text-[#8696a0] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Rápidos (Chips estilo WhatsApp Web) */}
        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0",
              activeFilter === "all"
                ? "bg-emerald-100 text-emerald-800 dark:bg-[#005c4b]/40 dark:text-[#00a884]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#202c33] dark:text-[#8696a0] dark:hover:bg-[#2a3942]"
            )}
          >
            {t("filter_all")}
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("unread")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
              activeFilter === "unread"
                ? "bg-emerald-100 text-emerald-800 dark:bg-[#005c4b]/40 dark:text-[#00a884]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#202c33] dark:text-[#8696a0] dark:hover:bg-[#2a3942]"
            )}
          >
            <span>{t("filter_unread")}</span>
            {totalUnread > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── LISTA DE CONVERSACIONES ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100/50 dark:divide-gray-800/40">
        {filtered.length > 0 ? (
          filtered.map((convo) => {
            const providerName =
              convo.provider?.name ||
              convo.otherParticipantName ||
              fallbackName;
            const isSelected = selectedId === convo.id;

            const isOnline =
              convo.otherParticipantOnline ?? convo.provider?.online;

            const timeLabel = formatChatSidebarTime(convo.lastMessageAt, {
              today: t("today"),
              yesterday: t("yesterday"),
            });

            return (
              <div
                key={convo.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(convo)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(convo)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all relative group",
                  isSelected
                    ? "bg-[#f0f2f5] dark:bg-[#202c33] border-l-4 border-l-emerald-600 dark:border-l-[#00a884]"
                    : "bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]/70"
                )}
              >
                {/* Avatar Circular con Indicador En Línea */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden transition-all shadow-xs border",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 dark:bg-[#00a884] dark:border-[#00a884]"
                        : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {convo.provider?.image || convo.otherParticipantImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          convo.provider?.image || convo.otherParticipantImage
                        }
                        alt={providerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{providerName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Indicador de Conexión En Línea */}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111b21] shadow-xs ring-1 ring-emerald-500/20" />
                  )}
                </div>

                {/* Detalles de la Conversación */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="font-bold text-xs text-gray-900 dark:text-[#e9edef] truncate">
                      {providerName}
                    </p>
                    <span
                      className={cn(
                        "text-[11px] font-mono shrink-0",
                        convo.unreadCount && convo.unreadCount > 0
                          ? "text-emerald-600 dark:text-[#00a884] font-bold"
                          : "text-gray-400 dark:text-[#8696a0] font-normal"
                      )}
                    >
                      {timeLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs truncate leading-snug flex items-center gap-1",
                        convo.unreadCount && convo.unreadCount > 0
                          ? "text-gray-900 dark:text-[#e9edef] font-semibold"
                          : "text-gray-500 dark:text-[#8696a0] font-normal"
                      )}
                    >
                      {/* Checkmarks de status si no tiene mensajes sin leer */}
                      {(!convo.unreadCount || convo.unreadCount === 0) && (
                        <CheckCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="truncate">
                        {convo.lastMessagePreview || t("new_conversation")}
                      </span>
                    </p>

                    {/* Badge Circular de Mensajes No Leídos */}
                    {convo.unreadCount && convo.unreadCount > 0 ? (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 dark:bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                        {convo.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Estado Vacío de Conversaciones */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 m-4 rounded-3xl bg-gray-50/50 dark:bg-[#111b21] border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <MessageSquare className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {t("no_conversations")}
              </p>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-xs">
                {t("no_conversations_desc")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
