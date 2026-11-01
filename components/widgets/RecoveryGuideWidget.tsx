"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from "react";
import {
  RecoveryGuideWidget as RecoveryGuideWidgetType,
  RecoveryGuideSection,
} from "@quhealthy/health-os-contract";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  HeartPulse,
  Coffee,
  Copy,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  widget: RecoveryGuideWidgetType;
  onAction?: (action: any) => void;
}

export const RecoveryGuideWidget: React.FC<Props> = ({ widget }) => {
  const data = widget.data;
  const sections: RecoveryGuideSection[] = data.sections || [];

  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || "diagnostico"
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(
    data.totalDurationSeconds || 120
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (data.audioBase64) {
      try {
        const audio = new Audio(
          `data:${data.format || "audio/wav"};base64,${data.audioBase64}`
        );
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            setDuration(Math.round(audio.duration));
          }
        };

        audio.ontimeupdate = () => {
          setCurrentTime(Math.round(audio.currentTime));
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };

        return () => {
          audio.pause();
          audioRef.current = null;
        };
      } catch (e) {
        console.warn("Error initializing Audio element:", e);
      }
    }
  }, [data.audioBase64, data.format]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio playback error:", err);
          setIsPlaying(false);
        });
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleRateChange = () => {
    if (!audioRef.current) return;
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const activeSection =
    sections.find((s) => s.id === activeSectionId) || sections[0];

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "DIAGNOSIS":
        return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      case "MEDICATIONS":
        return <Pill className="w-4 h-4 text-blue-500" />;
      case "CARE":
        return <Coffee className="w-4 h-4 text-indigo-500" />;
      case "WARNING_SIGNS":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />;
    }
  };

  const cleanVocalTokens = (str: string) => {
    if (!str) return "";
    return str
      .replace(/<short pause>/gi, "… ")
      .replace(/<breath>/gi, " ")
      .replace(/<sigh>/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const copyGuideToClipboard = () => {
    const textToCopy = `📋 ${data.guideTitle}\n\n` +
      sections
        .map(
          (s) =>
            `• ${s.title}:\n${cleanVocalTokens(s.spokenText || s.summary)}`
        )
        .join("\n\n");
    navigator.clipboard.writeText(textToCopy);
    toast.success("Guía de recuperación copiada al portapapeles");
  };

  return (
    <Card className="w-full max-w-full min-w-0 p-4 sm:p-5 border border-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/20 dark:from-[#111111] dark:to-[#0a120e] shadow-lg rounded-[24px] overflow-hidden space-y-4 font-sans">
      {/* ── ENCABEZADO PRINCIPAL ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-500/15 text-[#1D9E75] dark:text-[#5DCAA5] border border-emerald-500/30 text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1D9E75]" />
              Gemini 3.8 Flash TTS
            </Badge>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full">
              Formato Extendido • Alta Estabilidad
            </Badge>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
            {data.guideTitle || "Audio-Guía de Recuperación y Cuidados"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.patientName ? `Paciente: ${data.patientName}` : "Guía clínica personalizada"}{" "}
            • {data.diagnosis || "Plan post-consulta"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyGuideToClipboard}
          className="h-8 px-2.5 text-xs text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-emerald-500/10 shrink-0 self-start sm:self-auto rounded-full"
          title="Copiar guía completa"
        >
          <Copy className="w-3.5 h-3.5 mr-1" />
          Copiar
        </Button>
      </div>

      {/* ── REPRODUCTOR DE AUDIO PRINCIPAL ─────────────── */}
      <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#181818]/80 border border-gray-200/60 dark:border-gray-800 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!data.audioBase64}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all cursor-pointer",
                isPlaying
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-[#1D9E75] hover:bg-[#178563]"
              )}
              title={isPlaying ? "Pausar narración" : "Reproducir narración"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!data.audioBase64}
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Reiniciar audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 ml-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatSeconds(currentTime)}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{formatSeconds(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRateChange}
              className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
              title="Velocidad de reproducción"
            >
              {playbackRate}x
            </button>
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold gap-1">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Barra de progreso interactiva */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden relative cursor-pointer">
          <div
            className="bg-gradient-to-r from-[#1D9E75] to-[#5DCAA5] h-full transition-all duration-150"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* ── SELECTOR DE CAPÍTULOS DE LA GUÍA ───────────── */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Capítulos Clínicos de la Guía
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sections.map((section) => {
            const isSelected = section.id === activeSectionId;
            const isWarning = section.category === "WARNING_SIGNS";
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer",
                  isSelected
                    ? isWarning
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-xs"
                      : "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-xs"
                    : isWarning
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 text-rose-900 dark:text-rose-200 hover:bg-rose-100/50"
                    : "bg-gray-50/70 dark:bg-[#161616] border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                )}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {getCategoryIcon(section.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">
                      {section.title}
                    </p>
                    <p className="text-[10px] opacity-75 truncate mt-0.5">
                      {section.summary || "Ver detalles clínicos"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform mt-0.5",
                    isSelected ? "translate-x-0.5 text-emerald-600" : "text-gray-400"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DETALLE DEL CAPÍTULO ACTIVO ────────────────── */}
      {activeSection && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2",
            activeSection.category === "WARNING_SIGNS"
              ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 text-rose-900 dark:text-rose-100"
              : "bg-gray-50 dark:bg-[#141414] border-gray-200/70 dark:border-gray-800 text-gray-800 dark:text-gray-200"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-200/50 dark:border-gray-800/60 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {getCategoryIcon(activeSection.category)}
              <span>{activeSection.title}</span>
            </div>
            {activeSection.estimatedSeconds && (
              <span className="text-[10px] font-semibold opacity-70">
                ~{activeSection.estimatedSeconds}s narración
              </span>
            )}
          </div>

          <p className="whitespace-pre-wrap text-xs sm:text-sm font-normal">
            {cleanVocalTokens(activeSection.spokenText || activeSection.summary)}
          </p>
        </div>
      )}
    </Card>
  );
};
