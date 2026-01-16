"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductPillProps {
  name: string;
  color: string; // Espera clases completas de Tailwind ej: "bg-purple-500"
  delay?: number;
  className?: string;
}

const ProductPill: React.FC<ProductPillProps> = ({ name, color, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300, 
        damping: 15,
        delay 
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      // Usamos cn() para fusionar la clase de color con el diseño base
      className={cn(
        "px-4 py-1.5 rounded-full text-white text-sm font-medium shadow-md inline-block cursor-default border border-white/10 backdrop-blur-sm",
        color, 
        className
      )}
    >
      {name}
    </motion.div>
  );
};

export default ProductPill;