"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * HeroParticle Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. ATENCIÓN SELECTIVA
 *    - Movimiento sutil captura atención periférica
 *    - Opacidad baja (0.2-0.5) no distrae del contenido principal
 * 
 * 2. FIGURA/FONDO (Gestalt)
 *    - Partículas crean profundidad sin competir con contenido
 *    - Blur sutil mantiene jerarquía visual
 * 
 * 3. MINIMIZAR CARGA COGNITIVA
 *    - Animaciones suaves y predecibles
 *    - No requieren procesamiento consciente
 * 
 * 4. AFFORDANCE VISUAL
 *    - Movimiento indica que la página está "viva"
 *    - Sugiere interactividad sin ser intrusivo
 * 
 * 5. PROCESAMIENTO AUTOMÁTICO
 *    - Animaciones en segundo plano
 *    - Cerebro las procesa sin esfuerzo consciente
 * 
 * Optimizaciones de Performance:
 * - pointer-events-none: No bloquea interacciones
 * - will-change: transform, opacity (GPU acceleration)
 * - aria-hidden: No interfiere con screen readers
 * - Generación determinística: Evita hydration errors en SSR
 */

interface HeroParticleProps {
  left: string;
  top: string;
  color?: string;
  size?: string;
  animationDuration?: number;
  className?: string;
  blur?: boolean;
}

const HeroParticle: React.FC<HeroParticleProps> = ({ 
  left, 
  top, 
  color = "bg-purple-400",
  size = "w-1.5 h-1.5",
  animationDuration = 4,
  className,
  blur = false
}) => {
  return (
    <motion.div
      // Animación sutil - ATENCIÓN SELECTIVA
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.2, 0.5, 0.2], // Opacidad controlada para no distraer
        y: [-10, 10, -10], // Movimiento vertical sutil
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: Math.random() * 2, // Delay aleatorio para efecto natural
      }}
      className={cn(
        // Base styles - Performance optimizado
        "absolute rounded-full pointer-events-none z-0",
        // GPU acceleration
        "will-change-[transform,opacity]",
        // Blur opcional para profundidad
        blur ? "blur-[1px]" : "",
        size, 
        color,
        className ?? ""
      )}
      style={{ 
        left, 
        top,
        // Optimización adicional para transform
        transform: "translateZ(0)",
      }}
      aria-hidden="true" // Accesibilidad
    />
  );
};

/**
 * Algoritmo determinístico para generar partículas
 * 
 * Por qué es importante:
 * 1. CONSISTENCIA (UX): Misma experiencia en cada carga
 * 2. SSR SAFE: Evita hydration errors en Next.js
 * 3. PERFORMANCE: No requiere re-cálculo en cada render
 * 
 * @param count - Número de partículas (recomendado: 10-20)
 * @param offsetX - Desplazamiento horizontal (opcional)
 * @param offsetY - Desplazamiento vertical (opcional)
 * @returns Array de posiciones determinísticas
 */
export const generateDeterministicParticles = (
  count: number, 
  offsetX = 0, 
  offsetY = 0
): Array<{ left: string; top: string }> => {
  return Array.from({ length: count }).map((_, index) => {
    // Números primos para distribución pseudo-aleatoria uniforme
    const primeX = 31;
    const primeY = 57;
    
    // Generación determinística
    const leftPercent = ((index * primeX) % 100) + offsetX;
    const topPercent = ((index * primeY) % 100) + offsetY;
    
    // Asegurar que estén dentro del viewport
    const clampedLeft = Math.max(0, Math.min(100, leftPercent));
    const clampedTop = Math.max(0, Math.min(100, topPercent));
    
    return {
      left: `${clampedLeft}%`,
      top: `${clampedTop}%`,
    };
  });
};

/**
 * Variante optimizada para áreas específicas
 * Útil para concentrar partículas en ciertas zonas
 */
export const generateParticlesInArea = (
  count: number,
  area: {
    left: number;  // 0-100
    right: number; // 0-100
    top: number;   // 0-100
    bottom: number; // 0-100
  }
): Array<{ left: string; top: string }> => {
  const width = area.right - area.left;
  const height = area.bottom - area.top;
  
  return Array.from({ length: count }).map((_, index) => {
    const primeX = 37;
    const primeY = 73;
    
    const leftPercent = area.left + ((index * primeX) % width);
    const topPercent = area.top + ((index * primeY) % height);
    
    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
    };
  });
};

/**
 * Hook para generar partículas con configuración avanzada
 * Útil para casos de uso complejos
 */
export const useParticleConfig = (
  baseCount: number = 15
) => {
  const baseParticles = React.useMemo(
    () => generateDeterministicParticles(baseCount),
    [baseCount]
  );
  
  const accentParticles = React.useMemo(
    () => generateDeterministicParticles(Math.floor(baseCount / 3), 10, 10),
    [baseCount]
  );
  
  return {
    baseParticles,
    accentParticles,
    total: baseParticles.length + accentParticles.length
  };
};

export default HeroParticle;