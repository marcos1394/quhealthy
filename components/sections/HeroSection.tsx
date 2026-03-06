"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Check, ShieldCheck, Star, Activity, Heart, Calendar, Sparkles, UserPlus, TrendingUp, Zap } from "lucide-react";
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
    <div className="relative inline-block h-16 md:h-20 lg:h-24 min-w-[280px] md:min-w-[350px] align-bottom overflow-visible">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-2 text-medical-600 dark:text-medical-400 font-serif italic text-left pr-4 whitespace-nowrap"
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

      {/* Background Decorative Blob */}
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-medical-500/5 dark:bg-medical-500/10 rounded-full blur-[100px] opacity-70 translate-x-1/3 -translate-y-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 xl:px-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* =======================
              Columna Izquierda: Editorial Typography & Search
              ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth ease out
            className="lg:col-span-7 flex flex-col items-start text-left space-y-10 relative z-10"
          >
            {/* Pill Badge Minimalista */}
            <div className="inline-block border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-medical-500 animate-pulse" />
                {t('badge')}
              </span>
            </div>

            {/* Editorial Headline with Typewriter */}
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-slate-900 dark:text-white leading-[1.1] md:leading-[1.05] relative z-20 flex flex-wrap items-end gap-x-3 w-full">
              <span>{t('title_start')}</span>
              <TypewriterWords words={dynamicWords} />
              <span className="self-end pb-2 md:pb-4">{t('title_end')}</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-light">
              {t('description')}
            </p>

            {/* Search Form - Minimalist Line Art Style */}
            <div className="w-full max-w-2xl mt-4 relative z-30">
              <div className="absolute -inset-1 bg-gradient-to-r from-medical-500/20 to-teal-500/20 rounded-[1.25rem] blur-lg opacity-50 dark:opacity-30"></div>
              <div className="relative flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 p-2 gap-2">

                <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 group">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-medical-500 transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-light"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1 flex items-center px-4 py-3 md:py-0 group">
                  <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-medical-500 transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder={t('location_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-light"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-8 py-6 h-auto text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 shadow-slate-900/10 dark:shadow-none transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative group-hover:translate-x-1 transition-transform inline-block">
                    {t('search_button')}
                  </span>
                </Button>
              </div>
            </div>

            {/* Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 w-full max-w-2xl relative z-20">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2 group cursor-default">
                  <metric.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</span>
                </div>
              ))}
            </div>

          </motion.div>

          {/* =======================
              Columna Derecha: UI Dinámica & Abstracta
              ======================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden lg:block z-0"
          >
            {/* Dynamic UI Container */}
            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center justify-center p-8 shadow-2xl shadow-medical-500/5 dark:shadow-none transition-all duration-500 hover:shadow-medical-500/10 hover:border-medical-500/20">

              {/* Dynamic Animated Background Patterns */}
              <div className="absolute inset-0 bg-gradient-to-tr from-medical-50/80 via-transparent to-teal-50/40 dark:from-medical-900/20 dark:via-transparent dark:to-teal-900/10 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/assets/noise.png")' }} />
              <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              {/* Floating Dynamic Element 1: Health Analysis */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, -1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-[320px] bg-white/90 dark:bg-slate-800/90 rounded-2xl p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border border-white dark:border-slate-700/50 mb-6 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-medical-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl bg-medical-50 dark:bg-medical-900/40 flex items-center justify-center shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-medical-400/20 animate-pulse" />
                      <Activity className="w-5 h-5 text-medical-600 dark:text-medical-400 relative z-10" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{widgetT.analysis}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {widgetT.updated}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Progress Bar with pulse effect */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
                    className="h-full bg-gradient-to-r from-medical-500 to-teal-400 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Dynamic Element 2: Mini Stat Card (New) */}
              <motion.div
                animate={{ x: [0, 15, 0], y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-4 top-12 w-36 bg-white/90 dark:bg-slate-800/90 rounded-[1.25rem] p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white dark:border-slate-700/50 backdrop-blur-xl z-10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">+24%</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">14.2k</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Consultas</p>
              </motion.div>

              {/* Floating Dynamic Element 3: Appointment */}
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-[280px] -ml-16 bg-white/90 dark:bg-slate-800/90 rounded-2xl p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border border-white dark:border-slate-700/50 mb-8 backdrop-blur-xl relative z-20 group hover:-translate-y-1 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-5 h-5 text-rose-500 group-hover:fill-rose-500 transition-colors" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-slate-50 dark:border-slate-900 shadow-sm"
                      >
                        <UserPlus className="w-2.5 h-2.5 text-medical-500" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{widgetT.appointment}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{widgetT.specialty}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center group-hover:bg-medical-50 dark:group-hover:bg-medical-900/30 transition-colors">
                    <Calendar className="w-5 h-5 text-slate-400 group-hover:text-medical-500 transition-colors" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Dynamic Element 4: Fast Connect (New) */}
              <motion.div
                animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute left-6 bottom-32 bg-medical-600 dark:bg-medical-500 text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg shadow-medical-500/30 z-30"
              >
                <Zap className="w-3.5 h-3.5 fill-white animate-pulse" />
                <span className="text-xs font-semibold tracking-wide">Conexión 24/7</span>
              </motion.div>

              {/* Minimalist Floating Card - Clean, Bottom Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, type: "spring", stiffness: 100 }}
                className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/80 p-4 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-none flex items-center justify-between z-20"
              >
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-sm relative"
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
                <div className="text-right pl-4">
                  <div className="flex items-center justify-end gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white text-sm space-x-1">
                      <span>+2.5k</span>
                    </span> {widgetT.reviews}
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