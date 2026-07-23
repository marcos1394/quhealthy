"use client";

/* eslint-disable deslop/unused-export */

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const logos = [
  { name: "Google", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" }, 
  { name: "PayPal", url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
  { name: "Amazon", url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Samsung", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "IBM", url: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "Microsoft", url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
];

export const LogoCarousel: React.FC = () => {
  return (
    <div className="w-full mt-20 mb-8 pt-10 border-t border-gray-100 dark:border-gray-800 font-sans">
      
      {/* ── HEADER CON BADGE Y LÍNEA DE SEPARACIÓN ──────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shrink-0 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Infraestructura & Aliados Tecnológicos</span>
        </span>
        <div className="h-px bg-gray-100 dark:border-gray-800 w-full rounded-full" />
      </div>

      {/* ── CAROUSEL CONTENEDOR FLOTANTE ────────────────────────────────── */}
      <div className="relative flex overflow-hidden w-full group py-2">
        
        {/* Máscaras de Degradado Suavizadas */}
        <div className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-gray-50/80 dark:from-[#050505] via-gray-50/40 dark:via-[#050505]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-gray-50/80 dark:from-[#050505] via-gray-50/40 dark:via-[#050505]/40 to-transparent z-10 pointer-events-none" />

        {/* Tira en movimiento infinito */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-5 md:gap-8 px-4"
        >
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center shrink-0 px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-[#0a0a0a]/80 border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 group/card"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-5 md:h-6 object-contain filter grayscale dark:invert opacity-60 group-hover/card:grayscale-0 dark:group-hover/card:invert-0 group-hover/card:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
};

export default LogoCarousel;