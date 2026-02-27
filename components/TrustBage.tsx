"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * TrustBadge Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. PRINCIPIO DE AUTORIDAD
 *    - Shield icon = símbolo universal de confianza y seguridad
 *    - "Verificados" establece credibilidad institucional
 * 
 * 2. PRUEBA SOCIAL
 *    - "2,500+ profesionales" = número específico (más creíble que "muchos")
 *    - Rating 4.9★ = validación de otros usuarios
 *    - Cantidad concreta genera confianza
 * 
 * 3. HEURÍSTICA DE DISPONIBILIDAD
 *    - Información presentada upfront elimina dudas
 *    - No requiere búsqueda adicional
 * 
 * 4. PRINCIPIO DE RECIPROCIDAD
 *    - Mostrar valor antes de pedir acción
 *    - Genera confianza para siguiente paso (CTA)
 * 
 * 5. REGIÓN COMÚN (Gestalt)
 *    - Todo el contenido dentro de un contenedor
 *    - Border y background crean agrupación visual
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Una sola idea: "Somos confiables"
 *    - Iconos reducen necesidad de leer todo
 */

export const TrustBadge: React.FC = () => {
  const t = useTranslations('TrustBadge');
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-md group hover:border-medical-300 dark:hover:border-medical-500/40 hover:shadow-lg hover:shadow-medical-500/10 transition-all duration-300"
    >
      {/* Shield Icon - AUTORIDAD visual */}
      <div className="relative">
        {/* Glow effect en hover - ATENCIÓN */}
        <div className="absolute inset-0 bg-medical-500/10 rounded-full blur-md group-hover:bg-medical-500/20 transition-all duration-300" />
        <Shield className="relative w-5 h-5 text-medical-600 dark:text-medical-400 group-hover:scale-110 transition-all duration-300" />
      </div>

      {/* Contenido principal - CHUNKING de información */}
      <div className="flex items-center gap-3">
        {/* Texto principal con icono - RECONOCIMIENTO vs RECUPERACIÓN */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-colors" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
            {t('text')}
          </span>
        </div>

        {/* Rating - PRUEBA SOCIAL inmediata */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors duration-300">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">4.9</span>
        </div>
      </div>

      {/* Subtle shine effect - Atracción visual */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </motion.div>
  );
};