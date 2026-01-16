"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroParticleProps {
  left: string;
  top: string;
  color?: string;
  size?: string;
  animationDuration?: number;
  className?: string;
}

const HeroParticle: React.FC<HeroParticleProps> = ({ 
  left, 
  top, 
  color = "bg-purple-400",
  size = "w-1.5 h-1.5",
  animationDuration = 4,
  className
}) => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [0.3, 0.6, 0.3], // Aumenté un poco la opacidad máxima para que luzcan más
    }}
    transition={{
      duration: animationDuration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
    // Agregamos 'pointer-events-none' para que las partículas no bloqueen clics en botones
    className={cn(
      "absolute rounded-full pointer-events-none z-0", 
      size, 
      color,
      className ?? ""
    )}
    style={{ left, top }}
    aria-hidden="true"
  />
);

// Algoritmo determinístico para evitar errores de Hidratación en Next.js
export const generateDeterministicParticles = (
  count: number, 
  offsetX = 0, 
  offsetY = 0
) => {
  return Array.from({ length: count }).map((_, index) => ({
    // Usamos números primos (31, 57) para simular aleatoriedad sin ser aleatorios
    left: `${((index * 31) % 100) + offsetX}%`,
    top: `${((index * 57) % 100) + offsetY}%`,
  }));
};

export default HeroParticle;