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

  // Iconos de estado de entrega
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    if (message.isRead || message.status === "read") {
      // Leído (doble check destacado)
      return (
        <CheckCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
      );
    }
    if (message.status === "sending") {
      // Enviando (reloj)
      return (
        <Clock className="w-3 h-3 text-emerald-200/70" strokeWidth={2} />
      );
    }
    if (message.status === "delivered") {
      // Entregado (doble check suavizado)
      return (
        <CheckCheck className="w-3.5 h-3.5 text-emerald-200/80" strokeWidth={2} />
      );
    }
    // Enviado por defecto (un check)
    return <Check className="w-3.5 h-3.5 text-emerald-200/80" strokeWidth={2} />;
  };

  // Limpiar el texto del adjunto removiendo el prefijo
  const cleanDocumentName = message.content
    .replace(t("attached_doc_prefix"), "")
    .replace("Adjunto documento clínico: ", "");

  return (
    <div
      className={cn(
        "flex items-end gap-2.5 w-full font-sans transition-colors",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar del otro participante */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 hidden md:flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400 font-bold text-xs shadow-xs mb-0.5">
          <span>{providerInitial.toUpperCase()}</span>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-4 py-3 relative flex flex-col shadow-xs text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap transition-colors",
          isOwn
            ? "bg-emerald-600 text-white rounded-2xl rounded-tr-xs"
            : "bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-xs"
        )}
      >
        {/* Adjunto tipo Bóveda (Documento Clínico) */}
        {message.messageType === "VAULT_DOCUMENT" ? (
          <div className="flex flex-col gap-2">
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                isOwn
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-gray-50/80 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  isOwn
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                )}
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate leading-snug mb-1">
                  {cleanDocumentName}
                </p>
                <Link
                  href={`/patient/dashboard/vault?docId=${message.vaultDocumentId}`}
                  className={cn(
                    "text-[11px] font-bold flex items-center gap-1.5 transition-all w-fit",
                    isOwn
                      ? "text-emerald-100 hover:text-white"
                      : "text-emerald-600 dark:text-emerald-400 hover:underline"
                  )}
                >
                  <span>{t("view_record")}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <span>{message.content}</span>
        )}

        {/* Meta Data (Hora, Botón Escuchar TTS y Estado) */}
        <div
          className={cn(
            "flex items-center justify-between gap-2 mt-1.5 shrink-0 w-full pt-1 border-t",
            isOwn
              ? "border-emerald-500/40 text-emerald-100/90"
              : "border-gray-100 dark:border-gray-800/80 text-gray-400"
          )}
        >
          {message.content && message.messageType !== "VAULT_DOCUMENT" ? (
            <button
              type="button"
              onClick={handleTogglePlayAudio}
              disabled={isSynthesizing}
              className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors cursor-pointer",
                isOwn
                  ? "hover:bg-white/10 text-emerald-100"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
              title={isPlaying ? "Detener reproducción" : "Escuchar con Gemini 3.8 Flash TTS"}
            >
              {isSynthesizing ? (
                <QhSpinner size="sm" className="w-3 h-3 text-current" />
              ) : isPlaying ? (
                <Square className="w-2.5 h-2.5 fill-current text-amber-300 animate-pulse" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              <span>{isPlaying ? t("audio_playing") : t("listen_audio")}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] font-medium font-mono">
              {timeString}
            </span>
            {renderStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}