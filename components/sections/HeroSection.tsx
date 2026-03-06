"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Check, ShieldCheck, Star, Activity, Heart, Calendar, Sparkles, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const TypewriterWords = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="relative inline-block overflow-hidden h-14 md:h-16 lg:h-20 min-w-[200px] align-bottom">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 text-medical-600 dark:text-medical-400 font-serif italic text-left"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const t = useTranslations('Hero');
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const metrics = [
    { label: t('metrics.m1'), icon: ShieldCheck },
    { label: t('metrics.m2'), icon: Check },
    { label: t('metrics.m3'), icon: Star },
  ];

  // Palabras dinámicas basadas en el diccionario i18n
  const dynamicWords = [
    t('dynamic_words.0'),
    t('dynamic_words.1'),
    t('dynamic_words.2'),
    t('dynamic_words.3'),
  ];

  // UI elements derived from translations
  const widgetT = {
    analysis: t('widgets.health_analysis'),
    updated: t('widgets.updated'),
    appointment: t('widgets.appointment'),
    specialty: t('widgets.specialty'),
    reviews: t('widgets.reviews'),
  };

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
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-medical-500" />
                {t('badge')}
              </span>
            </div>

            {/* Editorial Headline with Typewriter */}
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-slate-900 dark:text-white leading-[1.05] relative z-10 flex flex-wrap items-baseline gap-x-3">
              <span>{t('title_start')}</span>
              <TypewriterWords words={dynamicWords} />
              <span>{t('title_end')}</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-light">
              {t('description')}
            </p>

            {/* Search Form - Minimalist Line Art Style */}
            <div className="w-full max-w-2xl mt-4 relative z-20">
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
                  className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-8 py-6 h-auto text-base font-medium shadow-none transition-colors group"
                >
                  <span className="group-hover:translate-x-1 transition-transform inline-block">
                    {t('search_button')}
                  </span>
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
              Columna Derecha: Dynamic UI 
              ======================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden md:block z-0"
          >
            {/* Dynamic UI Container - Replaces Static Image */}
            <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">

              {/* Dynamic Animated Background Patterns */}
              <div className="absolute inset-0 bg-gradient-to-tr from-medical-50/50 via-transparent to-medical-50/20 dark:from-medical-900/10 dark:via-transparent dark:to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              {/* Floating Dynamic Element 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-700 mb-6 backdrop-blur-md relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-medical-50 dark:bg-medical-900/40 flex items-center justify-center shadow-inner">
                      <Activity className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{widgetT.analysis}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{widgetT.updated}</p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
                {/* Progress Bar with pulse effect */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
                    className="h-full bg-gradient-to-r from-medical-400 to-medical-600 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Floating Dynamic Element 2 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-sm ml-12 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-700 mb-6 backdrop-blur-md relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shadow-inner">
                        <Heart className="w-5 h-5 text-rose-500" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700"
                      >
                        <UserPlus className="w-2.5 h-2.5 text-medical-500" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{widgetT.appointment}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{widgetT.specialty}</p>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </motion.div>

              {/* Minimalist Floating Card - Clean, Bottom Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700 p-4 rounded-2xl shadow-[0_15px_40px_-5px_rgb(0,0,0,0.1)] dark:shadow-none flex items-center justify-between"
              >
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                  {[1, 2, 3, 4].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.1 }}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.pravatar.cc/100?img=${40 + i}`}
                        alt="Avatar paciente"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">+2.5k</span> {widgetT.reviews}
                  </p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;