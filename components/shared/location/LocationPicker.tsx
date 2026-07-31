"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Navigation, AlertCircle, RefreshCw } from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocationPickerProps } from "@/types/location";

const MapLoadingSkeleton = () => {
  const t = useTranslations("LocationPicker");
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingStages = useMemo(
    () => [
      { id: 1, label: t("loading_stage_1"), duration: 1000 },
      { id: 2, label: t("loading_stage_2"), duration: 1500 },
      { id: 3, label: t("loading_stage_3"), duration: 500 },
    ],
    [t]
  );

  useEffect(() => {
    const interval = setInterval(
      () => setProgress((prev) => (prev >= 100 ? 100 : prev + 5)),
      100
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = loadingStages.map((_, index) => {
      const delay = loadingStages
        .slice(0, index)
        .reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [loadingStages]);

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ── CONTENEDOR DE CARGA DEL MAPA ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="h-72 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] relative overflow-hidden shadow-2xs"
      >
        {/* Cuadrícula de Fondo */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xs p-6 text-center">
          {/* Caja de Icono Esmeralda */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <MapPin className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-2">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {loadingStages[currentStage]?.label || t("loading_default")}
              </p>
            </div>

            <p className="text-[11px] font-medium text-gray-400">
              {t("loading_subtext")}
            </p>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full max-w-[220px] h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xs">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* ── SKELETON DEL CAMPO BÚSQUEDA ──────────────────────────────── */}
      <div className="h-11 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center px-4 gap-3 shadow-2xs">
        <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
        <div className="w-36 h-2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

const MapEngine = dynamic(() => import("./MapModal"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className,
}: LocationPickerProps) {
  const t = useTranslations("LocationPicker");
  const [hasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 rounded-3xl p-8 shadow-2xs font-sans transition-colors select-none space-y-6 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-2xs">
          <AlertCircle className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            {t("error_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
            {t("error_desc")}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_retry")}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-4 font-sans select-none", className)}>
      <div className="relative z-0 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-2xs">
        <MapEngine
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
        />
      </div>
    </div>
  );
}

export type { LocationPickerProps };