"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeroParticleProps {
  left: string;
  top: string;
  color?: string;
  size?: string;
  animationDuration?: number;
}

const HeroParticle: React.FC<HeroParticleProps> = ({ 
  left, 
  top, 
  color = "bg-purple-400",
  size = "w-1.5 h-1.5",
  animationDuration = 4
}) => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [0.3, 0, 0.3],
    }}
    transition={{
      duration: animationDuration,
      repeat: Infinity,
      repeatType: "reverse",
    }}
    className={`absolute ${size} ${color} rounded-full`}
    style={{ left, top }}
    aria-hidden="true"
  />
);

export const generateDeterministicParticles = (
  count: number, 
  offsetX = 0, 
  offsetY = 0
) => {
  return Array.from({ length: count }).map((_, index) => ({
    left: `${((index * 31) % 100) + offsetX}%`,
    top: `${((index * 57) % 100) + offsetY}%`,
  }));
};

export default HeroParticle;