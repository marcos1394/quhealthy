"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FileText,
  Crown,
  Video,
  Sparkles,
  Info,
  TrendingUp,
  Eye,
  Check,
  Zap,
  UploadCloud,
  Trash2,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
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
  const t = useTranslations("PublicInfoSection");

  const [showPreviewTips, setShowPreviewTips] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const charCount = settings.description.length;
  const charLimit = 500;
  const charPercent = (charCount / charLimit) * 100;

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.warning(t("toast_invalid_format"));
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.warning(t("toast_file_too_large"));
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

  // Color de indicador de contador de caracteres
  const getCharCountColor = () => {
    if (charPercent >= 90) return "text-rose-500 dark:text-rose-400";
    if (charPercent >= 75) return "text-amber-500 dark:text-amber-400";
    return "text-gray-400 dark:text-gray-500";
  };

  const getProgressColor = () => {
    if (charPercent >= 90) return "bg-rose-500";
    if (charPercent >= 75) return "bg-amber-500";
    return "bg-emerald-600 dark:bg-emerald-400";
  };

  // Puntuación de calidad de redacción
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
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA INTERIOR ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
              <FileText className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("header_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("header_subtitle")}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewTips(!showPreviewTips)}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold h-10 px-5 shadow-2xs cursor-pointer"
          >
            <Eye className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{showPreviewTips ? t("hide_tips") : t("show_tips")}</span>
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10">
        {/* ── CONSEJOS DE REDACCIÓN (TIPS) ────────────────────────────── */}
        <AnimatePresence>
          {showPreviewTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-5 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs flex gap-3.5">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    {t("tips_title")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-emerald-800/80 dark:text-emerald-400/80 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                      <span>{t("tip_1")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                      <span>{t("tip_2")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                      <span>{t("tip_3")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                      <span>{t("tip_4")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DESCRIPCIÓN PÚBLICA / BIOGRAFÍA ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("bio_label")}
            </Label>

            <div className="flex items-center gap-3">
              {/* Score de Calidad */}
              {charCount > 50 && (
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs",
                    qualityScore >= 75
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                      : qualityScore >= 50
                      ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                  )}
                >
                  {qualityScore >= 75
                    ? t("quality_optimal")
                    : qualityScore >= 50
                    ? t("quality_good")
                    : t("quality_basic")}
                </span>
              )}

              {/* Contador de Caracteres */}
              <span className={cn("text-[10px] font-bold font-mono", getCharCountColor())}>
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 relative rounded-full overflow-hidden">
            <motion.div
              className={cn("absolute top-0 left-0 h-full rounded-full", getProgressColor())}
              initial={{ width: 0 }}
              animate={{ width: `${charPercent}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>

          <Textarea
            placeholder={t("bio_placeholder")}
            rows={5}
            value={settings.description}
            onChange={(e) => onChange("description", e.target.value)}
            maxLength={charLimit}
            className={cn(
              "rounded-2xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 p-4 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-none leading-relaxed shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
              charPercent >= 90
                ? "border-rose-300 dark:border-rose-900/50 ring-2 ring-rose-500/20"
                : ""
            )}
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {t("bio_hint")}
          </p>
        </div>

        {/* ── VIDEO DE BIENVENIDA / PRESENTACIÓN ─────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-[#050505] text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Video className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <Label className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block">
                  {t("video_title")}
                </Label>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {t("video_subtitle")}
                </p>
              </div>
            </div>

            {!isPremium ? (
              <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit shadow-2xs">
                <Crown className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("premium_badge")}</span>
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit shadow-2xs">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("active_badge")}</span>
              </span>
            )}
          </div>

          {/* Área de Carga / Reproductor de Video */}
          <div className="space-y-4">
            {settings.videoUrl ? (
              <div className="relative group rounded-3xl border border-gray-200 dark:border-gray-800 bg-black aspect-video overflow-hidden shadow-2xs">
                <video
                  src={settings.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    onClick={() => onVideoDelete && onVideoDelete()}
                    className="rounded-xl border border-white/20 bg-black/60 text-white hover:bg-rose-600 hover:border-rose-600 h-9 px-4 text-xs font-bold backdrop-blur-md transition-all shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" strokeWidth={2} />
                    <span>{t("delete_video")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => isPremium && videoInputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && isPremium) {
                    videoInputRef.current?.click();
                  }
                }}
                className={cn(
                  "border-2 border-dashed rounded-3xl aspect-video md:aspect-[21/9] flex flex-col items-center justify-center transition-all group p-6 text-center shadow-2xs",
                  isPremium
                    ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/20 cursor-pointer"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] cursor-not-allowed opacity-60"
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  {isUploadingVideo ? (
                    <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <UploadCloud
                      className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("upload_video_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                  {t("upload_video_desc")}
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

          {/* Banner de Upgrade Premium */}
          {!isPremium && (
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 p-5 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                  <span>{t("upgrade_banner_title")}</span>
                </p>

                <ul className="space-y-1 text-xs font-medium text-amber-800/80 dark:text-amber-400/80">
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                    <span>{t("upgrade_banner_item1")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                    <span>{t("upgrade_banner_item2")}</span>
                  </li>
                </ul>
              </div>

              {onUpgrade && (
                <Button
                  type="button"
                  onClick={onUpgrade}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white h-10 px-5 text-xs font-bold transition-all shrink-0 shadow-xs border-0 cursor-pointer"
                >
                  <Crown className="w-4 h-4 mr-1.5" strokeWidth={2} />
                  <span>{t("btn_upgrade")}</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── ESTADÍSTICAS DE IMPACTO DEL EXPEDIENTE ──────────────────── */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 tracking-tight">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("impact_title")}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center text-center shadow-2xs space-y-0.5">
              <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {t("stat_views_num")}
              </p>
              <p className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300">
                {t("stat_views_desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center text-center shadow-2xs space-y-0.5">
              <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {t("stat_conversion_num")}
              </p>
              <p className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300">
                {t("stat_conversion_desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center text-center shadow-2xs space-y-0.5">
              <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {t("stat_trust_num")}
              </p>
              <p className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300">
                {t("stat_trust_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}