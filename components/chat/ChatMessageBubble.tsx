"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, Check, CheckCheck, FileText, ArrowRight, Volume2, Square } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChatMessage } from "@/types/chat";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { healthOSService } from "@/services/healthOS.service";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  providerInitial: string;
}

export function ChatMessageBubble({
  message,
  isOwn,
  providerInitial,
}: ChatMessageBubbleProps) {
  const t = useTranslations("PatientMessages");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cachedAudioBase64 = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleTogglePlayAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (!message.content) return;

    if (cachedAudioBase64.current) {
      const audio = new Audio(
        `data:audio/wav;base64,${cachedAudioBase64.current}`
      );
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        fallbackSpeechSynthesis(message.content);
      };
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn("Audio play error, using fallback:", e);
        fallbackSpeechSynthesis(message.content);
      }
      return;
    }

    setIsSynthesizing(true);
    try {
      const response = await healthOSService.synthesizeMultiSpeaker({
        speakers: [
          { speaker: isOwn ? "Usuario" : "Especialista", voice: isOwn ? "Puck" : "Sulafat" },
        ],
        turns: [
          {
            speaker: isOwn ? "Usuario" : "Especialista",
            text: message.content,
            style: isOwn ? "natural, conversational" : "warm, empathetic, professional",
          },
        ],
      });

      if (response && response.audioBase64) {
        cachedAudioBase64.current = response.audioBase64;
        const audio = new Audio(
          `data:${response.format || "audio/wav"};base64,${response.audioBase64}`
        );
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          fallbackSpeechSynthesis(message.content);
        };
        await audio.play();
        setIsPlaying(true);
      } else {
        fallbackSpeechSynthesis(message.content);
      }
    } catch (err) {
      console.warn("Error sintetizando audio con TTS, usando síntesis local:", err);
      fallbackSpeechSynthesis(message.content);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Formatear hora (ej. 14:30)
  const timeString = message.createdAt
    ? format(new Date(message.createdAt), "HH:mm")
    : "";

  // Iconos de estado de entrega estilo WhatsApp
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    if (message.isRead || message.status === "read") {
      // Leído (doble check azul WhatsApp)
      return (
        <CheckCheck className="w-4 h-4 text-[#53bdeb]" strokeWidth={2.5} />
      );
    }
    if (message.status === "sending") {
      // Enviando (reloj)
      return (
        <Clock className="w-3 h-3 text-[#667781] dark:text-[#8696a0]" strokeWidth={2} />
      );
    }
    if (message.status === "delivered") {
      // Entregado (doble check gris)
      return (
        <CheckCheck className="w-4 h-4 text-[#667781] dark:text-[#8696a0]" strokeWidth={2} />
      );
    }
    // Enviado (un solo check gris)
    return <Check className="w-4 h-4 text-[#667781] dark:text-[#8696a0]" strokeWidth={2} />;
  };

  // Limpiar el texto del adjunto removiendo el prefijo
  const cleanDocumentName = message.content
    .replace(t("attached_doc_prefix"), "")
    .replace("Adjunto documento clínico: ", "");

  return (
    <div
      className={cn(
        "flex items-end gap-2 w-full font-sans transition-colors group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar del otro participante */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-[#e9edef] dark:bg-[#374248] text-[#54656f] dark:text-[#aebac1] hidden md:flex items-center justify-center shrink-0 font-bold text-xs select-none shadow-xs mb-1">
          <span>{providerInitial.toUpperCase()}</span>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[65%] px-3.5 py-2 relative flex flex-col shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] text-[13.5px] leading-relaxed break-words whitespace-pre-wrap transition-all",
          isOwn
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tr-xs"
            : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl rounded-tl-xs"
        )}
      >
        {/* Adjunto tipo Bóveda (Documento Clínico) */}
        {message.messageType === "VAULT_DOCUMENT" ? (
          <div className="flex flex-col gap-1.5 my-0.5">
            <div
              className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-xl transition-all border",
                isOwn
                  ? "bg-black/[0.04] dark:bg-black/20 border-black/5 dark:border-white/5"
                  : "bg-gray-50 dark:bg-[#182229] border-gray-100 dark:border-gray-800"
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-5 h-5" strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-snug text-[#111b21] dark:text-[#e9edef]">
                  {cleanDocumentName}
                </p>
                <Link
                  href={`/patient/dashboard/vault?docId=${message.vaultDocumentId}`}
                  className="text-[11px] font-bold inline-flex items-center gap-1 mt-1 text-emerald-700 dark:text-emerald-400 hover:underline transition-colors"
                >
                  <span>{t("view_record")}</span>
                  <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <span className="font-normal select-text">{message.content}</span>
        )}

        {/* Metadata flotante: Botón Escuchar TTS + Hora + Estado de Entrega */}
        <div className="flex items-center justify-between gap-2 mt-0.5 pt-0.5 shrink-0 select-none">
          {message.content && message.messageType !== "VAULT_DOCUMENT" ? (
            <button
              type="button"
              onClick={handleTogglePlayAudio}
              disabled={isSynthesizing}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md transition-colors cursor-pointer",
                isOwn
                  ? "text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5"
                  : "text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5"
              )}
              title={isPlaying ? "Detener reproducción" : "Escuchar con Gemini 3.8 Flash TTS"}
            >
              {isSynthesizing ? (
                <QhSpinner size="sm" className="w-3 h-3 text-current" />
              ) : isPlaying ? (
                <Square className="w-2.5 h-2.5 fill-current text-amber-500 animate-pulse" />
              ) : (
                <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {isPlaying ? t("audio_playing") : t("listen_audio")}
              </span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10.5px] font-normal text-[#667781] dark:text-[#8696a0]">
              {timeString}
            </span>
            {renderStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}