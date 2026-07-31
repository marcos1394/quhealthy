"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  BrainCircuit,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";
import { useTeleconsultationTimer } from "@/hooks/useTeleconsultationTimer";
import { teleconsultationService } from "@/services/teleconsultation.service";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface ConsultationRoomProps {
  onHangup?: () => void;
}

export const ConsultationRoom: React.FC<ConsultationRoomProps> = ({
  onHangup,
}) => {
  const t = useTranslations("TeleconsultationRoom");

  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    toggleAudioMuted,
    toggleVideoMuted,
    state,
    role,
    appointmentId,
    aiAgentActive,
    transcriptions,
  } = useTeleconsultationStore();

  const [isRevoking, setIsRevoking] = useState(false);

  const { formattedTime, isWarning, isCritical } = useTeleconsultationTimer();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleHangup = () => {
    if (onHangup) {
      onHangup();
    } else {
      window.location.href =
        role === "PATIENT" ? "/patient/dashboard" : "/provider/dashboard";
    }
  };

  const handleRevokeAiConsent = async () => {
    if (!appointmentId) return;
    try {
      setIsRevoking(true);
      await teleconsultationService.revokeAiConsent(appointmentId);
      toast.success(t("toast_ai_revoked"));
    } catch (error) {
      console.error("Error al revocar consentimiento de IA:", error);
      toast.error(t("toast_ai_error"));
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-white dark:bg-[#0a0a0a] font-sans select-none overflow-hidden">
      {/* ── VIDEO REMOTO (FONDO) ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center overflow-hidden">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-emerald-400 shadow-2xs">
              <Video className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {state === "CONNECTING"
                ? t("establishing_connection")
                : t("waiting_video")}
            </p>
          </div>
        )}
      </div>

      {/* ── CAPA DE CONTROLES SUPERIORES Y TIMERS ───────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none p-4 md:p-6">
        <div className="flex justify-between items-start w-full">
          {/* Indicador de Asistente IA */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {aiAgentActive && (
              <Badge className="bg-sky-500/90 backdrop-blur-md text-white border-0 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-md flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 animate-pulse" strokeWidth={2} />
                <span>{t("ai_active")}</span>
              </Badge>
            )}

            {aiAgentActive && role === "PATIENT" && (
              <button
                type="button"
                onClick={handleRevokeAiConsent}
                disabled={isRevoking}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isRevoking ? (
                  <QhSpinner size="sm" className="text-rose-600 dark:text-rose-400" />
                ) : (
                  <XCircle className="w-4 h-4" strokeWidth={2} />
                )}
                <span>{isRevoking ? t("revoking") : t("revoke_ai")}</span>
              </button>
            )}
          </div>

          {/* Temporizador de Consulta */}
          <div
            className={cn(
              "pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold border backdrop-blur-md shadow-md transition-all",
              isCritical
                ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                : isWarning
                ? "bg-amber-500 text-white border-amber-400"
                : "bg-white/90 dark:bg-[#0a0a0a]/90 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800"
            )}
          >
            <Clock className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* ── VIDEO LOCAL (MINIATURA) ──────────────────────────────── */}
        <div className="flex-1 w-full flex items-end justify-end pb-20 md:pb-0">
          <div className="pointer-events-auto w-32 md:w-44 aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 dark:border-gray-800 relative group">
            {localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover transform scale-x-[-1] transition-opacity",
                  isVideoMuted ? "opacity-30" : "opacity-100"
                )}
              />
            )}

            {isVideoMuted && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <VideoOff className="w-7 h-7 opacity-80" strokeWidth={2} />
              </div>
            )}

            {isAudioMuted && (
              <div className="absolute bottom-2 right-2 bg-rose-600 p-1.5 rounded-full border border-white/20 shadow-2xs">
                <MicOff className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SUBTÍTULOS / TRANSCRIPCIONES EN TIEMPO REAL ───────────── */}
      {transcriptions.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4 space-y-1.5">
          {transcriptions.map((tItem, idx) => (
            <div
              key={tItem.id + idx}
              className="bg-black/80 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border-l-4 border-emerald-500 max-w-xl w-full shadow-lg"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                {tItem.participantName}
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {tItem.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── BARRA INFERIOR DE ACCIONES Y MUTE ──────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md p-2 px-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl">
          {/* Mute Audio */}
          <button
            type="button"
            onClick={toggleAudioMuted}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs",
              isAudioMuted
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Mic className="w-5 h-5" strokeWidth={2} />
            )}
          </button>

          {/* Mute Video */}
          <button
            type="button"
            onClick={toggleVideoMuted}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs",
              isVideoMuted
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {isVideoMuted ? (
              <VideoOff className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Video className="w-5 h-5" strokeWidth={2} />
            )}
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

          {/* Colgar Llamada */}
          <button
            type="button"
            onClick={handleHangup}
            className="w-11 h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          >
            <PhoneOff className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};