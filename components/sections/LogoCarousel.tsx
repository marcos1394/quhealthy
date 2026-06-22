"use client"
/* eslint-disable deslop/unused-export */;

import React from "react";
import { motion } from "framer-motion";

const logos = [
  { name: "Acme Corp", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" }, 
  { name: "Global Health", url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
  { name: "CarePlus", url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "WellnessCo", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "DocNetwork", url: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "LifeLine", url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
];

export const LogoCarousel: React.FC = () => {
  return (
    <div className="w-full mt-32 mb-10 lg:col-span-12 border-t border-gray-200 dark:border-gray-800 pt-12">
      <div className="flex items-center gap-4 mb-12">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
          Nuestros Partners Tecnológicos
        </span>
        <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>
      </div>
      
      <div className="relative flex overflow-hidden w-full group">
        {/* Gradient Masks (Harder edges) */}
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-20 md:gap-32 px-8"
        >
          {[...logos, ...logos].map((logo, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center shrink-0 opacity-30 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <img 
                src={logo.url} 
                alt={logo.name} 
                className="h-6 md:h-7 object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LogoCarousel;