"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Navigation, AlertCircle, RefreshCw } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { LocationPickerProps } from "@/types/location";

const loadingStages = [
  { id: 1, label: "Inicializando motor de mapas...", duration: 1000 },
  { id: 2, label: "Sincronizando con Google Maps...", duration: 1500 },
  { id: 3, label: "Preparando vista interactiva...", duration: 500 },
];

const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

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
  }, []);

  return (
    <div className="space-y-4 font-sans">
      {/* Container de Carga Mapa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-72 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] relative overflow-hidden shadow-sm"
      >
        {/* Sutil Grid de Fondo */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xs p-6 text-center">
          {/* Icon Box Esmeralda */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <MapPin className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {loadingStages[currentStage]?.label || "Cargando mapa..."}
              </p>
            </div>
            <p className="text-[11px] font-medium text-gray-400">
              Estableciendo coordenadas geográficas
            </p>
          </div>

          {/* Barra de Progreso Suavizada */}
          <div className="w-full max-w-[220px] h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Input Skeleton */}
      <div className="h-11 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center px-4 gap-3 shadow-sm">
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
  const [hasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 shadow-sm font-sans space-y-6 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 mx-auto shadow-sm">
          <AlertCircle className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Error de Conexión
          </h3>
          <p className="text-xs font-medium text-gray-500">
            No fue posible conectar con los servicios de cartografía e imágenes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          <span>Reintentar Conexión</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-4 font-sans", className)}>
      <div className="relative z-0 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-sm">
        <MapEngine
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
        />
      </div>
    </div>
  );
}

export type { LocationPickerProps };