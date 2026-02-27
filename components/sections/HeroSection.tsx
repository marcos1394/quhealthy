"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Check, ShieldCheck, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  const t = useTranslations('Hero');
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const metrics = [
    { label: t('metrics.m1'), icon: ShieldCheck },
    { label: t('metrics.m2'), icon: Check },
    { label: t('metrics.m3'), icon: Star },
  ];

  return (
    <section className="relative w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] pt-32 pb-20 lg:pt-40 lg:pb-32 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* =======================
              Columna Izquierda: Editorial Typography & Search
              ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth ease out
            className="lg:col-span-7 flex flex-col items-start text-left space-y-10"
          >
            {/* Pill Badge Minimalista */}
            <div className="inline-block border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                {t('badge')}
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              {t('title_start')}
              <span className="text-medical-600 dark:text-medical-400 font-serif italic">
                {t('title_highlight')}
              </span>
              {t('title_end')}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-light">
              {t('description')}
            </p>

            {/* Search Form - Minimalist Line Art Style */}
            <div className="w-full max-w-2xl mt-4">
              <div className="flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-2 gap-2">

                <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-light"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1 flex items-center px-4 py-3 md:py-0">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={t('location_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-light"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-8 py-6 h-auto text-base font-medium shadow-none transition-colors"
                >
                  {t('search_button')}
                </Button>
              </div>
            </div>

            {/* Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 w-full max-w-2xl">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <metric.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</span>
                </div>
              ))}
            </div>

          </motion.div>

          {/* =======================
              Columna Derecha: Authentic Imagery 
              ======================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden md:block"
          >
            {/* Main Image Container */}
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero_medical_lifestyle.png"
                alt="Médica empática en consultorio, transmitiendo confianza y modernidad"
                className="w-full h-full object-cover object-center"
              />
              {/* Subtle Overlay to make image pop gently */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/20 to-transparent mix-blend-multiply" />
            </div>

            {/* Minimalist Floating Card - Clean, no crazy shadows */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -bottom-6 -left-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-none flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.pravatar.cc/100?img=${40 + i}`}
                      alt="Avatar paciente"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="ml-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Reseñas de pacientes reales
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;