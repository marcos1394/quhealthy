"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/**
 * StatsCard Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CHUNKING (Memoria)
 *    - Solo 4 métricas (dentro del número mágico 7±2)
 *    - Cada stat es un "chunk" significativo y memorable
 * 
 * 2. PEAK-END EFFECT
 *    - Se muestra al final del Hero como momento memorable
 *    - Números impresionantes crean "peak" emocional
 * 
 * 3. JERARQUÍA VISUAL
 *    - Gradientes únicos por stat para reconocimiento rápido
 *    - Tamaño de fuente progresivo: valor > label
 * 
 * 4. PROXIMIDAD (Gestalt)
 *    - Stats relacionadas agrupadas en grid 2x2
 *    - Spacing consistente crea relación visual
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos visuales eliminan necesidad de memoria
 *    - No requiere recordar qué significa cada número
 * 
 * 6. FIGURA/FONDO (Gestalt)
 *    - Glassmorphism separa card del fondo
 *    - Corner accent añade profundidad
 */

export const StatsCard: React.FC = () => {
  const t = useTranslations('Stats');
  const stats = [
    {
      icon: Users,
      value: "2.5K+",
      label: t('professionals'),
      gradient: "from-medical-400 to-teal-400",
      iconColor: "text-medical-400",
      bgColor: "bg-medical-500/10",
      delay: 0
    },
    {
      icon: MapPin,
      value: "28",
      label: t('cities'),
      gradient: "from-teal-400 to-emerald-400",
      iconColor: "text-teal-400",
      bgColor: "bg-teal-500/10",
      delay: 0.1
    },
    {
      icon: Calendar,
      value: "15K+",
      label: t('appointments'),
      gradient: "from-emerald-400 to-cyan-400",
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      delay: 0.2
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: t('satisfaction'),
      gradient: "from-amber-400 to-orange-400",
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      delay: 0.3
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      {/* Glow effect externo - Principio de ATENCIÓN */}
      <div className="absolute -inset-2 bg-gradient-to-r from-medical-600/20 via-teal-600/20 to-medical-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card principal - Glassmorphism para FIGURA/FONDO */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">

        {/* Decorative corner accent - Profundidad visual */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-medical-500/20 to-transparent rounded-tr-2xl pointer-events-none" />

        {/* Grid de stats - Principio de PROXIMIDAD (Gestalt) */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.4 }}
                className="group/stat relative"
              >
                {/* Contenedor del icono - REGIÓN COMÚN (Gestalt) */}
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                  stat.bgColor,
                  "group-hover/stat:scale-110 group-hover/stat:shadow-lg"
                )}>
                  {/* Glow interno en hover - Feedback visual */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 blur-md",
                    stat.bgColor
                  )} />
                  <Icon className={cn("relative w-5 h-5", stat.iconColor)} />
                </div>

                {/* Valor - JERARQUÍA TIPOGRÁFICA */}
                <div className={cn(
                  "text-3xl font-black mb-1 tracking-tight",
                  "bg-gradient-to-r bg-clip-text text-transparent",
                  stat.gradient
                )}>
                  {stat.value}
                </div>

                {/* Label - Texto secundario, CHUNKING del significado */}
                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>

                {/* Indicador de hover - AFFORDANCE visual */}
                <div className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300",
                  "bg-gradient-to-r",
                  stat.gradient,
                  "group-hover/stat:w-full"
                )} />
              </motion.div>
            );
          })}
        </div>

        {/* Microinteracción - Mantiene ATENCIÓN sin ser intrusivo */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-medical-500/0 group-hover:border-medical-500/20 transition-colors duration-500"
          animate={{
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};