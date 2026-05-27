"use client";

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
    <div className="w-full mt-24 mb-4 lg:col-span-12">
      <p className="text-center text-xs md:text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">
        Nuestros Partners Tecnológicos
      </p>
      
      <div className="relative flex overflow-hidden w-full group">
        {/* Gradient Masks for fading edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-16 md:gap-24 px-8"
        >
          {/* Double the logos to create the infinite scroll effect smoothly */}
          {[...logos, ...logos].map((logo, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img 
                src={logo.url} 
                alt={logo.name} 
                className="h-6 md:h-8 object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LogoCarousel;
