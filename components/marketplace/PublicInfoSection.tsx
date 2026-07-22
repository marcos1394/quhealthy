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
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      {/* Header Interior */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
              <FileText
                className="w-5 h-5 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                Información Pública
              </h2>
              <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
                Biografía y Video de Bienvenida
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowPreviewTips(!showPreviewTips)}
            className="rounded-none border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors h-10 px-6"
          >
            <Eye className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
            {showPreviewTips ? "Ocultar Tips" : "Ver Tips de Bio"}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12">
        {/* Writing Tips (Margin Note Format) */}
        <AnimatePresence>
          {showPreviewTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505] mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" strokeWidth={1.5} /> Estructura
                  Recomendada
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 font-light">
                  <div className="flex items-center gap-3">
                    <Check
                      className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                      strokeWidth={2}
                    />
                    <span>Comienza con tu especialidad principal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check
                      className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                      strokeWidth={2}
                    />
                    <span>Menciona años de experiencia y certificaciones</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check
                      className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                      strokeWidth={2}
                    />
                    <span>Habla de tu enfoque o filosofía de atención</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check
                      className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                      strokeWidth={2}
                    />
                    <span>Usa un tono cercano y profesional</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Descripción Pública */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Biografía / Reseña Profesional
            </Label>
            <div className="flex items-center gap-4">
              {/* Quality Score */}
              {charCount > 50 && (
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5",
                    qualityScore >= 75
                      ? "border-black dark:border-white text-black dark:text-white"
                      : qualityScore >= 50
                        ? "border-gray-400 text-gray-500"
                        : "border-amber-500 text-amber-600",
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
                  "text-[9px] font-bold uppercase tracking-widest",
                  getCharCountColor(),
                )}
              >
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Strict Progress Line */}
          <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
            <motion.div
              className={cn("absolute top-0 left-0 h-full", getProgressColor())}
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
              "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 p-4 text-sm font-light focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors resize-none leading-relaxed text-black dark:text-white",
              charPercent >= 90
                ? "border-red-500 focus-visible:border-red-500"
                : "",
            )}
          />
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
            Información visible en la cabecera de tu perfil público y resultados
            de búsqueda.
          </p>
        </div>

        {/* Video de Bienvenida */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black shrink-0">
                <Video
                  className="w-4 h-4 text-black dark:text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block mb-0.5">
                  Video Pitch / Presentación
                </Label>
                {isPremium && (
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
                    Impacto directo en conversión
                  </span>
                )}
              </div>
            </div>

            {!isPremium ? (
              <span className="border border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Crown className="w-3 h-3" strokeWidth={2} /> Feature Premium
              </span>
            ) : (
              <span className="border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Check className="w-3 h-3" strokeWidth={2} /> Activo
              </span>
            )}
          </div>

          {/* Video Upload UI */}
          <div className="space-y-4">
            {settings.videoUrl ? (
              <div className="relative group border border-gray-200 dark:border-gray-800 bg-black aspect-video overflow-hidden">
                <video
                  src={settings.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => onVideoDelete && onVideoDelete()}
                    className="rounded-none border border-red-500 bg-black/50 text-red-500 hover:bg-red-500 hover:text-white h-10 px-4 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Revocar Video
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => isPremium && videoInputRef.current?.click()}
                className={cn(
                  "border border-dashed aspect-video md:aspect-[21/9] flex flex-col items-center justify-center transition-colors group",
                  isPremium
                    ? "border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] cursor-pointer"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] cursor-not-allowed opacity-60",
                )}
              >
                <div className="w-14 h-14 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                  {isUploadingVideo ? (
                    <RefreshCw
                      className="w-6 h-6 text-black dark:text-white animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <UploadCloud
                      className="w-6 h-6 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                  Subir Archivo de Video
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
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
            <div className="border-l-2 border-amber-500 pl-6 py-4 bg-amber-50 dark:bg-amber-900/10 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} /> Mejora tu
                  Conversión
                </p>
                <ul className="space-y-2 text-xs text-amber-800/80 dark:text-amber-300/80 font-light">
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span>
                      <strong>+40% conversión</strong> en reservas confirmadas
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span>Transmite confianza visual antes de agendar</span>
                  </li>
                </ul>
              </div>

              {onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  className="rounded-none bg-amber-500 text-white hover:bg-amber-600 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors shrink-0"
                >
                  <Crown className="w-4 h-4 mr-2" strokeWidth={2} />
                  Upgrade Premium
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Success Examples (Blueprint Grid) */}
        <div className="pt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> Impacto de
            Expediente Completo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold tracking-tighter text-black dark:text-white mb-1">
                +65%
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Visualizaciones
              </p>
            </div>
            <div className="p-6 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold tracking-tighter text-black dark:text-white mb-1">
                +40%
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Conversión
              </p>
            </div>
            <div className="p-6 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-semibold tracking-tighter text-black dark:text-white mb-1">
                +85%
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Confianza Media
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
