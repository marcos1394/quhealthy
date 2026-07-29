"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Phone, Video, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/chat";
import { useSessionStore } from "@/stores/SessionStore";
import { formatLastSeen } from "@/lib/formatMessageTime";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export function ChatHeader({
  conversation,
  onBack,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderProps) {
  const t = useTranslations("PatientMessages");
  const { user } = useSessionStore();

  const isProvider = user?.role === "ROLE_PROVIDER";
  const fallbackName = isProvider ? t("patient_label") : t("specialist");
  const providerName =
    conversation.provider?.name ||
    conversation.otherParticipantName ||
    fallbackName;

  // Presencia de usuario
  const isOnline =
    conversation.otherParticipantOnline ?? conversation.provider?.online;
  const lastSeenLabel = formatLastSeen(conversation.otherParticipantLastSeenAt);

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 font-sans transition-colors">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Botón de Regresar (Mobile) */}
        <Button
          type="button"
          variant="ghost"
          className="md:hidden shrink-0 rounded-2xl border border-gray-100 dark:border-gray-800 w-9 h-9 p-0 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111]"
          onClick={onBack}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </Button>

        {/* Avatar del Participante */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm overflow-hidden shadow-xs">
            {conversation.provider?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={conversation.provider.image}
                alt={providerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{providerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {/* Indicador flotante en el Avatar */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0a0a0a] ${
              isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        </div>

        {/* Info del Participante */}
        <div className="min-w-0 flex flex-col justify-center space-y-0.5">
          <p className="font-bold text-sm text-gray-900 dark:text-white truncate leading-snug">
            {providerName}
          </p>
          <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 leading-none truncate">
            {isOnline ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {t("online")}
              </span>
            ) : (
              <span>
                {t("offline")}
                {lastSeenLabel && ` • ${lastSeenLabel}`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Botones de Llamada */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onVoiceCall}
          title={t("btn_voice_call")}
          aria-label={t("btn_voice_call")}
          className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 w-10 h-10 p-0 flex items-center justify-center transition-all shadow-xs cursor-pointer"
        >
          <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onVideoCall}
          title={t("btn_video_call")}
          aria-label={t("btn_video_call")}
          className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 w-10 h-10 p-0 flex items-center justify-center transition-all shadow-xs cursor-pointer"
        >
          <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}