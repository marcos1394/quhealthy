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

  // 🟢 NUEVO: el "otro" participante depende de quién soy yo.
  // Si yo soy PROVIDER, el otro es un PACIENTE (no un "especialista").
  const isProvider =
    role === "ROLE_PROVIDER" ||
    role === "ROLE_STAFF" ||
    user?.role === "ROLE_PROVIDER" ||
    user?.role === "ROLE_STAFF";
  const fallbackName = isProvider ? "Paciente" : "Especialista";

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("time_now", { defaultValue: "Ahora" });
    if (minutes < 60) return `${minutes}M`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}H`;
    return `${Math.floor(hours / 24)}D`;
  };

  const filtered = conversations.filter((c) =>
    (c.provider?.name || c.otherParticipantName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] h-full shrink-0">
      {/* Buscador Soft Health */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          Directorio de Mensajes
        </h2>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            strokeWidth={1.5}
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isProvider
                ? t("search_placeholder_provider", {
                    defaultValue: "Buscar Paciente...",
                  })
                : t("search_placeholder", {
                    defaultValue: "Buscar Especialista...",
                  })
            }
            className="pl-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 h-12 text-sm focus-visible:ring-2 focus-visible:ring-quhealthy-green/20 focus-visible:border-quhealthy-green transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filtered.length > 0 ? (
          filtered.map((convo) => {
            const providerName =
              convo.provider?.name ||
              convo.otherParticipantName ||
              fallbackName;
            const isSelected = selectedId === convo.id;

            // 🔧 FIX: el backend puebla `otherParticipantOnline`, no `provider.online`
            // (ese objeto `provider` aún no se llena en ningún lado). Mantenemos
            // el fallback a provider?.online por compatibilidad futura.
            const isOnline =
              convo.otherParticipantOnline ?? convo.provider?.online;

            return (
              <div
                key={convo.id}
                onClick={() => onSelect(convo)}
                className={cn(
                  "flex items-start gap-4 p-5 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800/50 group",
                  isSelected
                    ? "bg-quhealthy-green text-white dark:bg-emerald-700"
                    : "bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white hover:bg-gray-50 dark:hover:bg-[#111]",
                )}
              >
                {/* Avatar Redondo */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full overflow-hidden transition-all shadow-sm",
                      isSelected
                        ? "bg-white/20 dark:bg-black/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
                    )}
                  >
                    {convo.provider?.image || convo.otherParticipantImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          convo.provider?.image || convo.otherParticipantImage
                        }
                        alt={providerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-lg">
                        {providerName.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Indicador de conexión */}
                  {isOnline && (
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2",
                        isSelected
                          ? "bg-emerald-400 border-quhealthy-green dark:border-emerald-600"
                          : "bg-emerald-500 border-white dark:border-[#0a0a0a]",
                      )}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm truncate">{providerName}</p>
                    <span
                      className={cn(
                        "text-[10px] font-bold shrink-0 ml-2",
                        isSelected
                          ? "text-white/70 dark:text-white/70"
                          : "text-gray-400",
                      )}
                    >
                      {formatRelativeTime(convo.lastMessageAt)}
                    </span>
                  </div>
                  {/* 🔧 FIX: si soy PROVIDER, no tiene sentido mostrar "especialidad" 
 (el otro es un paciente, no tiene especialidad). Mostramos una 
 etiqueta de rol en su lugar. */}
                  <p
                    className={cn(
                      "text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium",
                    )}
                  >
                    {isProvider
                      ? t("patient_label")
                      : convo.provider?.specialty ||
                        convo.otherParticipantSpecialty ||
                        t("specialist")}
                  </p>
                  <p
                    className={cn(
                      "text-xs truncate font-medium",
                      convo.unreadCount && convo.unreadCount > 0
                        ? "text-gray-900 dark:text-white font-bold"
                        : isSelected
                          ? "text-white/80 dark:text-white/80"
                          : "text-gray-500",
                    )}
                  >
                    {convo.lastMessagePreview || t("new_conversation")}
                  </p>
                </div>

                {/* Unread Badge Estricto */}
                {convo.unreadCount && convo.unreadCount > 0 && (
                  <div
                    className={cn(
                      "min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm",
                      isSelected
                        ? "bg-white text-emerald-600 dark:bg-gray-800 dark:text-emerald-400"
                        : "bg-emerald-500 text-white",
                    )}
                  >
                    {convo.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty State Soft Health */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 dark:bg-gray-900/10 m-4 rounded-3xl">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mb-4 shadow-sm">
              <MessageSquare
                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t("no_conversations", { defaultValue: "Bandeja Vacía" })}
            </p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {t("no_conversations_desc", {
                defaultValue:
                  "No se han establecido canales de comunicación con este criterio.",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
