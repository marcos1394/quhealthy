"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Star, Users } from "lucide-react";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 backdrop-blur-sm group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
    >
      {/* Shield Icon - AUTORIDAD visual */}
      <div className="relative">
        {/* Glow effect en hover - ATENCIÓN */}
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-500/30 transition-all duration-300" />
        <Shield className="relative w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
      </div>
      
      {/* Contenido principal - CHUNKING de información */}
      <div className="flex items-center gap-3">
        {/* Texto principal con icono - RECONOCIMIENTO vs RECUPERACIÓN */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-300" />
          <span className="text-sm font-semibold text-purple-300">
            +2,500 profesionales verificados
          </span>
        </div>
        
        {/* Rating - PRUEBA SOCIAL inmediata */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors duration-300">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-amber-300">4.9</span>
        </div>
      </div>

      {/* Subtle shine effect - Atracción visual */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </motion.div>
  );
};