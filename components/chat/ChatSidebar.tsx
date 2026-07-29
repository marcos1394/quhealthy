"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React from "react";
import { useTranslations } from "next-intl";
import { Search, MessageSquare } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/SessionStore";

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

  const isProvider =
    role === "ROLE_PROVIDER" ||
    role === "ROLE_STAFF" ||
    user?.role === "ROLE_PROVIDER" ||
    user?.role === "ROLE_STAFF";

  const fallbackName = isProvider ? t("patient_label") : t("specialist");

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("time_now");
    if (minutes < 60) return t("time_minutes", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("time_hours", { count: hours });
    return t("time_days", { count: Math.floor(hours / 24) });
  };

  const filtered = conversations.filter((c) =>
    (c.provider?.name || c.otherParticipantName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] h-full shrink-0 font-sans transition-colors">
      {/* ── BÚSQUEDA Y HEADER DE DIRECTORIO ─────────────────────────────── */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-3 shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          {t("directory_title")}
        </h2>

        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isProvider
                ? t("search_placeholder_provider")
                : t("search_placeholder")
            }
            className="pl-10 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* ── LISTA DE CONVERSACIONES ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length > 0 ? (
          filtered.map((convo) => {
            const providerName =
              convo.provider?.name ||
              convo.otherParticipantName ||
              fallbackName;
            const isSelected = selectedId === convo.id;

            const isOnline =
              convo.otherParticipantOnline ?? convo.provider?.online;

            return (
              <div
                key={convo.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(convo)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(convo)}
                className={cn(
                  "flex items-start gap-3.5 p-4 cursor-pointer transition-all border-b border-gray-100/70 dark:border-gray-800/50 group select-none relative",
                  isSelected
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-600 dark:border-l-emerald-500"
                    : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/80 dark:hover:bg-[#050505]"
                )}
              >
                {/* Avatar del Participante */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs overflow-hidden transition-all shadow-xs border",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
                        : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
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

                  {/* Indicador de Conexión */}
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] shadow-xs" />
                  )}
                </div>

                {/* Detalles del Chat */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {providerName}
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 font-mono shrink-0">
                      {formatRelativeTime(convo.lastMessageAt)}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate">
                    {isProvider
                      ? t("patient_label")
                      : convo.provider?.specialty ||
                        convo.otherParticipantSpecialty ||
                        t("specialist")}
                  </p>

                  <p
                    className={cn(
                      "text-xs truncate pt-0.5 leading-snug",
                      convo.unreadCount && convo.unreadCount > 0
                        ? "text-gray-900 dark:text-white font-bold"
                        : "text-gray-500 dark:text-gray-400 font-normal"
                    )}
                  >
                    {convo.lastMessagePreview || t("new_conversation")}
                  </p>
                </div>

                {/* Badge Mensajes No Leídos */}
                {convo.unreadCount && convo.unreadCount > 0 ? (
                  <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs self-center">
                    {convo.unreadCount}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          /* Estado Vacío */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 m-4 rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
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