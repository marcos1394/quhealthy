"use client";
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Crown,
  Video,
  Sparkles,
  Info,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  UploadCloud,
  RefreshCw,
  Trash2,
  Check,
} from "lucide-react";

import { toast } from "react-toastify";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PublicInfoSettings {
  description: string;
  videoUrl?: string;
}

interface PublicInfoSectionProps {
  settings: PublicInfoSettings;
  onChange: (key: keyof PublicInfoSettings, value: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  onVideoUpload?: (file: File) => Promise<void>;
  onVideoDelete?: () => void;
}

export function PublicInfoSection({
  settings,
  onChange,
  isPremium = false,
  onUpgrade,
  onVideoDelete,
  onVideoUpload,
}: PublicInfoSectionProps) {
  const [showPreviewTips, setShowPreviewTips] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const charCount = settings.description.length;
  const charLimit = 500;
  const charPercent = (charCount / charLimit) * 100;

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.warning(
        "Por favor selecciona un archivo de video válido (MP4 o WebM)",
      );
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.warning("El archivo de video es muy pesado (máximo 20MB)");
      e.target.value = "";
      return;
    }

    setIsUploadingVideo(true);
    if (onVideoUpload) {
      await onVideoUpload(file);
    }
    setIsUploadingVideo(false);
    e.target.value = "";
  };

  // Helper para color de contador
  const getCharCountColor = () => {
    if (charPercent >= 90) return "text-red-500 dark:text-red-400";
    if (charPercent >= 75) return "text-amber-500 dark:text-amber-400";
    return "text-gray-500";
  };

  const getProgressColor = () => {
    if (charPercent >= 90) return "bg-red-500";
    if (charPercent >= 75) return "bg-amber-500";
    if (charPercent >= 50) return "bg-black dark:bg-white";
    return "bg-gray-400 dark:bg-gray-600";
  };

  // Writing quality score
  const getQualityScore = () => {
    let score = 0;
    const desc = settings.description;

    if (desc.length > 100) score += 25;
    if (desc.length > 200) score += 25;
    if (desc.includes(".") || desc.includes("!")) score += 25;
    if (desc.split(" ").length > 30) score += 25;

    return score;
  };

  const qualityScore = getQualityScore();

  return (
    <div className="flex flex-col bg-transparent">
      {/* Header Interior */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] rounded-t-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <FileText
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Información Pública
              </h2>
              <p className="text-sm font-medium text-gray-500">
                Biografía y Video de Bienvenida
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowPreviewTips(!showPreviewTips)}
            className="rounded-xl border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors h-10 px-6"
          >
            <Eye className="w-4 h-4 mr-2" strokeWidth={2} />
            {showPreviewTips ? "Ocultar Tips" : "Ver Tips de Bio"}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12 bg-white dark:bg-[#0a0a0a] rounded-b-3xl">
        {/* Writing Tips */}
        <AnimatePresence>
          {showPreviewTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 mb-8 flex gap-4 shadow-sm">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-4">
                    Estructura Recomendada
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>Comienza con tu especialidad principal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>Menciona experiencia y certificaciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>Habla de tu enfoque de atención</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span>Usa un tono cercano y profesional</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Descripción Pública */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Biografía / Reseña Profesional
            </Label>
            <div className="flex items-center gap-4">
              {/* Quality Score */}
              {charCount > 50 && (
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                    qualityScore >= 75
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : qualityScore >= 50
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  )}
                >
                  {qualityScore >= 75
                    ? "Calidad: Óptima"
                    : qualityScore >= 50
                      ? "Calidad: Buena"
                      : "Calidad: Básica"}
                </span>
              )}

              {/* Character Counter */}
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  getCharCountColor(),
                )}
              >
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Strict Progress Line */}
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 relative rounded-full overflow-hidden">
            <motion.div
              className={cn("absolute top-0 left-0 h-full rounded-full", getProgressColor())}
              initial={{ width: 0 }}
              animate={{ width: `${charPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <Textarea
            placeholder="Ejemplo: Hola, soy el Dr. Marcos López, médico cirujano con 10 años de experiencia en medicina general y preventiva. Me apasiona brindar atención integral y personalizada..."
            rows={6}
            value={settings.description}
            onChange={(e) => onChange("description", e.target.value)}
            maxLength={charLimit}
            className={cn(
              "rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 p-5 text-sm font-medium focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors resize-none leading-relaxed text-gray-900 dark:text-white shadow-sm",
              charPercent >= 90
                ? "border-red-300 dark:border-red-500/50 ring-1 ring-red-500/20"
                : "",
            )}
          />
          <p className="text-xs text-gray-500 font-medium">
            Información visible en la cabecera de tu perfil público y resultados de búsqueda.
          </p>
        </div>

        {/* Video de Bienvenida */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
                <Video
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-900 dark:text-white block mb-0.5">
                  Video Pitch / Presentación
                </Label>
                {isPremium && (
                  <span className="text-xs font-semibold text-gray-500">
                    Impacto directo en conversión
                  </span>
                )}
              </div>
            </div>

            {!isPremium ? (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm">
                <Crown className="w-4 h-4" strokeWidth={2} /> Feature Premium
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm">
                <Check className="w-4 h-4" strokeWidth={2} /> Activo
              </span>
            )}
          </div>

          {/* Video Upload UI */}
          <div className="space-y-4">
            {settings.videoUrl ? (
              <div className="relative group rounded-3xl border border-gray-200 dark:border-gray-800 bg-black aspect-video overflow-hidden shadow-sm">
                <video
                  src={settings.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => onVideoDelete && onVideoDelete()}
                    className="rounded-xl border border-white/20 bg-black/50 text-white hover:bg-red-500 hover:border-red-500 h-10 px-4 text-xs font-bold backdrop-blur-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Revocar Video
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => isPremium && videoInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl aspect-video md:aspect-[21/9] flex flex-col items-center justify-center transition-colors group",
                  isPremium
                    ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 cursor-pointer"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] cursor-not-allowed opacity-60",
                )}
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {isUploadingVideo ? (
                    <RefreshCw
                      className="w-8 h-8 text-emerald-600 animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    <UploadCloud
                      className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Subir Archivo de Video
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  MP4 o WebM • Máx 20MB
                </p>
              </div>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              disabled={!isPremium}
              onChange={handleVideoFileChange}
            />
          </div>

          {/* Info/Upgrade Section */}
          {!isPremium && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 p-5 bg-amber-50 dark:bg-amber-900/10 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" strokeWidth={2} /> Mejora tu Conversión
                </p>
                <ul className="space-y-2 text-sm text-amber-700/80 dark:text-amber-400/80 font-medium">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>
                      <strong>+40% conversión</strong> en reservas confirmadas
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>Transmite confianza visual antes de agendar</span>
                  </li>
                </ul>
              </div>

              {onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 h-12 px-6 text-sm font-bold transition-colors shrink-0 shadow-sm border-0"
                >
                  <Crown className="w-4 h-4 mr-2" strokeWidth={2} />
                  Upgrade Premium
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Success Examples */}
        <div className="pt-12 border-t border-gray-100 dark:border-gray-800 mt-12">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4" strokeWidth={2} /> Impacto de Expediente Completo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                +65%
              </p>
              <p className="text-xs font-semibold text-emerald-800/70 dark:text-emerald-400/70">
                Visualizaciones
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                +40%
              </p>
              <p className="text-xs font-semibold text-emerald-800/70 dark:text-emerald-400/70">
                Conversión
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
                +85%
              </p>
              <p className="text-xs font-semibold text-emerald-800/70 dark:text-emerald-400/70">
                Confianza Media
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
