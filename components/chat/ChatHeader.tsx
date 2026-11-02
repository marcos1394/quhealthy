"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Phone, Video, ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";

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

  const isProvider = user?.role === "ROLE_PROVIDER" || user?.role === "ROLE_STAFF";
  const fallbackName = isProvider ? t("patient_label") : t("specialist");
  const providerName =
    conversation.provider?.name ||
    conversation.otherParticipantName ||
    fallbackName;

  // Presencia de usuario en tiempo real
  const isOnline =
    conversation.otherParticipantOnline ?? conversation.provider?.online;
  const lastSeenLabel = formatLastSeen(conversation.otherParticipantLastSeenAt);

  return (
    <div className="px-4 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between shrink-0 font-sans transition-colors select-none z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Botón de Regresar (Mobile) */}
        <Button
          type="button"
          variant="ghost"
          className="md:hidden shrink-0 rounded-full w-9 h-9 p-0 flex items-center justify-center text-gray-600 dark:text-[#aebac1] hover:bg-gray-200/60 dark:hover:bg-[#374248]"
          onClick={onBack}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </Button>

        {/* Avatar Circular del Participante */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-[#00a884] font-bold text-sm overflow-hidden shadow-xs">
            {conversation.provider?.image || conversation.otherParticipantImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={conversation.provider?.image || conversation.otherParticipantImage}
                alt={providerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{providerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {/* Indicador de Conexión en el Avatar */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#f0f2f5] dark:border-[#202c33] shadow-xs" />
          )}
        </div>

        {/* Nombre y Estado En Línea WhatsApp-Style */}
        <div className="min-w-0 flex flex-col justify-center">
          <p className="font-bold text-sm text-gray-900 dark:text-[#e9edef] truncate leading-tight">
            {providerName}
          </p>
          <p className="text-[11px] font-medium text-gray-500 dark:text-[#8696a0] flex items-center gap-1.5 leading-none mt-0.5 truncate">
            {isOnline ? (
              <span className="text-emerald-600 dark:text-[#00a884] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("online")}</span>
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

      {/* Botones de Acción (Llamada, Video, y Expediente Clínico) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Acceso Rápido al Expediente Clínico del Paciente */}
        {isProvider && conversation.patientId ? (
          <Link
            href={`/provider/dashboard/patients?patientId=${conversation.patientId}`}
            title={t("patient_file")}
            className="w-9 h-9 rounded-full bg-transparent hover:bg-gray-200/60 dark:hover:bg-[#374248] text-gray-600 dark:text-[#aebac1] hover:text-emerald-600 dark:hover:text-[#00a884] flex items-center justify-center transition-colors"
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
          </Link>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          onClick={onVoiceCall}
          title={t("btn_voice_call")}
          aria-label={t("btn_voice_call")}
          className="rounded-full w-9 h-9 p-0 flex items-center justify-center text-gray-600 dark:text-[#aebac1] hover:bg-gray-200/60 dark:hover:bg-[#374248] hover:text-emerald-600 dark:hover:text-[#00a884] transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onVideoCall}
          title={t("btn_video_call")}
          aria-label={t("btn_video_call")}
          className="rounded-full w-9 h-9 p-0 flex items-center justify-center text-gray-600 dark:text-[#aebac1] hover:bg-gray-200/60 dark:hover:bg-[#374248] hover:text-emerald-600 dark:hover:text-[#00a884] transition-colors cursor-pointer"
        >
          <Video className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
