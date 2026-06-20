"use client";
import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Calendar, Map, Search, MessageSquare, Star, ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/constants";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mapeo seguro de los iconos que vienen de constants.ts
const iconMap: Record<string, React.ElementType> = {
  UserCheck, Calendar, Map, Search, MessageSquare, Star
};

const FeaturesSection = () => {
  const t = useTranslations('Features');

  // Variantes de animación arquitectónica
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section id="features" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 border-b border-gray-200 dark:border-gray-800 selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">

        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-24">
          <div className="max-w-3xl">
            {/* Pill Badge Arquitectónico */}
            <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {t('badge')}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-black dark:text-white tracking-tight leading-[1.1] mb-6">
              {t('title_start')}
              <br className="hidden md:block" />
              <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light pr-2">
                {t('title_highlight')}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-xl leading-relaxed">
              {t('description')}
            </p>
          </div>

          <div className="hidden md:block pb-2">
             <Link 
              href="/discover" 
              className="group inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors pb-1"
            >
              {t('cta_button')} <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Architectural Grid (Blueprint Style) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800"
        >
          {FEATURES.map((feature: any, index: number) => {
            // Buscamos el icono basado en el nombre del componente en constants (o pasamos fallback)
            const IconComponent = feature.icon || UserCheck;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative p-10 lg:p-12 border-b border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-500"
              >
                {/* Icon Container (Arquitectónico) */}
                <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center mb-10 group-hover:border-black dark:group-hover:border-white transition-colors duration-500">
                  <IconComponent className="w-5 h-5 text-black dark:text-white opacity-60 group-hover:opacity-100 transition-opacity duration-500" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700">
                      0{index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-black dark:text-white tracking-tight leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all">
                      {t(`items.${index}.title`)}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light mb-8 flex-grow">
                    {t(`items.${index}.description`)}
                  </p>

                  <div className="mt-auto">
                    <Link 
                      href="/discover" 
                      className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors"
                    >
                      {t('explore')}
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer CTA Minimalist (Mobile Only, since Desktop has it on top) */}
        <div className="mt-12 md:hidden flex justify-center">
          <Link 
            href="/discover"
            className="w-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all group border-0"
          >
            {t('cta_button')}
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;