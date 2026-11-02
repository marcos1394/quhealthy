"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MedicalInfographicWidget as MedicalInfographicWidgetType,
  MedicalInfographicData,
  HealthOSAction,
} from "@quhealthy/health-os-contract";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Sparkles,
  Maximize2,
  X,
  Download,
  Share2,
  CheckCircle2,
  BookmarkPlus,
  Activity,
  HeartPulse,
  Shield,
  Stethoscope,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  widget: MedicalInfographicWidgetType;
  onAction?: (action: HealthOSAction) => void;
}

export const MedicalInfographicWidget: React.FC<Props> = ({ widget, onAction }) => {
  const data: MedicalInfographicData = widget.data;
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getCategoryConfig = (category?: string) => {
    switch (category?.toUpperCase()) {
      case "ANATOMY":
        return {
          label: "Anatomía y Biomecánica",
          badgeClass: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
          icon: <Activity className="w-3.5 h-3.5" />,
        };
      case "REHABILITATION":
        return {
          label: "Rehabilitación y Terapia",
          badgeClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          icon: <HeartPulse className="w-3.5 h-3.5" />,
        };
      case "PROCEDURE":
        return {
          label: "Procedimiento Clínico",
          badgeClass: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
          icon: <Stethoscope className="w-3.5 h-3.5" />,
        };
      case "PREVENTION":
        return {
          label: "Prevención y Cuidados",
          badgeClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          icon: <Shield className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: "Educación para el Paciente",
          badgeClass: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
          icon: <Sparkles className="w-3.5 h-3.5" />,
        };
    }
  };

  const categoryConfig = getCategoryConfig(data.category);
  const isSquare = data.aspectRatio === "1:1";

  const handleDownload = () => {
    if (!data.imageUrl) return;

    try {
      const link = document.createElement("a");
      link.href = data.imageUrl;
      link.download = `${(data.title || "infografia-medica").toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Descarga iniciada exitosamente");
    } catch {
      window.open(data.imageUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (!data.imageUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.summary,
          url: data.imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(data.imageUrl);
        toast.info("Enlace de la infografía copiado al portapapeles");
      }
    } catch {
      toast.info("Enlace copiado al portapapeles");
    }
  };

  const handleSaveToVault = () => {
    setIsSaved(true);
    if (onAction) {
      onAction({
        type: "save_vault",
        payload: {
          entityType: "infographic",
          title: data.title,
          medicalTopic: data.medicalTopic,
          category: data.category,
          imageUrl: data.imageUrl,
          summary: data.summary,
        },
      });
    }
    toast.success("Infografía guardada en tu Expediente Clínico (Vault)");
  };

  return (
    <>
      <Card className="p-4 sm:p-5 border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0c0c0c] shadow-sm rounded-2xl overflow-hidden font-sans space-y-4">
        {/* ── CABECERA ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5", categoryConfig.badgeClass)}
            >
              {categoryConfig.icon}
              <span>{categoryConfig.label}</span>
            </Badge>

            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Nano Banana 2.1
            </span>
          </div>

          <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
            QuHealthy Clinical Education
          </span>
        </div>

        {/* ── TÍTULO Y TEMA ───────────────────────────────────── */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
            {data.title}
          </h3>
          {data.medicalTopic && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {data.medicalTopic}
            </p>
          )}
        </div>

        {/* ── CONTENEDOR DE IMAGEN DE ALTA RESOLUCIÓN ─────────── */}
        {data.imageUrl && (
          <div
            className={cn(
              "relative w-full rounded-xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-gray-950/5 group cursor-pointer select-none",
              isSquare ? "aspect-square max-w-md mx-auto" : "aspect-video"
            )}
            onClick={() => setIsZoomOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setIsZoomOpen(true)}
          >
            <Image
              src={data.imageUrl}
              alt={data.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 800px"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow-md">
                <Maximize2 className="w-4 h-4" />
                Clic para ampliar en alta resolución
              </span>
              <span className="text-white/80 text-[10px] font-mono drop-shadow-md">
                2K / PBR Quality
              </span>
            </div>
          </div>
        )}

        {/* ── RESUMEN CLÍNICO ─────────────────────────────────── */}
        {data.summary && (
          <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#141414] border border-gray-100 dark:border-gray-800/60 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {data.summary}
          </div>
        )}

        {/* ── PUNTOS CLAVE Y RECOMENDACIONES ──────────────────── */}
        {data.keyPoints && data.keyPoints.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Puntos Clave y Recomendaciones del Especialista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-black/20 flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BARRA DE ACCIONES ───────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isSaved ? "secondary" : "default"}
              onClick={handleSaveToVault}
              className="h-8 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <BookmarkPlus className={cn("w-3.5 h-3.5", isSaved && "text-emerald-600")} />
              <span>{isSaved ? "Guardado en Expediente" : "Guardar en Expediente"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="h-8 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </Button>
        </div>

        {/* ── DISCLAIMER MÉDICO ───────────────────────────────── */}
        {data.disclaimer && (
          <div className="flex items-start gap-1.5 pt-1 text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
            <p>{data.disclaimer}</p>
          </div>
        )}
      </Card>

      {/* ── MODAL LIGHTBOX / FULLSCREEN ZOOM ─────────────────── */}
      {isZoomOpen && data.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-black/40 text-white">
              <div className="space-y-0.5 min-w-0 pr-4">
                <h3 className="font-bold text-sm sm:text-base truncate">{data.title}</h3>
                <p className="text-[11px] text-gray-400">
                  Ilustración médica de alta fidelidad • QuHealthy Clinical Education
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descargar</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsZoomOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[50vh] max-h-[78vh] flex items-center justify-center p-2 bg-[#050505]">
              <div className="relative w-full h-[65vh]">
                <Image
                  src={data.imageUrl}
                  alt={data.title}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
