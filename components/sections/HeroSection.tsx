"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Check, ShieldCheck, Star, Activity, Heart, Calendar, UserPlus, TrendingUp, Zap, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogoCarousel } from "@/components/sections/LogoCarousel";

const TypewriterWords = ({ words, suffix = "" }: { words: string[]; suffix?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="relative inline-block h-12 sm:h-16 md:h-20 lg:h-[100px] min-w-[140px] sm:min-w-[200px] md:min-w-[300px] align-bottom overflow-visible px-2">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 bottom-0 text-gray-400 dark:text-gray-500 font-serif italic text-left whitespace-nowrap"
        >
          {words[index]}{suffix}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const t = useTranslations('Hero');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.state || "";
            if (city) {
              setLocationQuery(city);
            }
          } catch (error) {
            console.error("Error fetching location:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
        }
      );
    }
  };

  useEffect(() => {
    handleGeolocation();
  }, []);

  const metrics = [
    { label: t('metrics.m1'), icon: ShieldCheck },
    { label: t('metrics.m2'), icon: Check },
    { label: t('metrics.m3'), icon: Star },
  ];

  const dynamicWords = [
    t('dynamic_words.0'),
    t('dynamic_words.1'),
    t('dynamic_words.2'),
    t('dynamic_words.3'),
  ];

  const widgetT = {
    analysis: t('widgets.health_analysis'),
    updated: t('widgets.updated'),
    appointment: t('widgets.appointment'),
    specialty: t('widgets.specialty'),
    reviews: t('widgets.reviews'),
  };

  return (
    <section className="relative w-full bg-white dark:bg-[#0a0a0a] pt-32 pb-16 md:pt-40 md:pb-24 transition-colors duration-300 overflow-hidden font-sans selection:bg-gray-200 dark:selection:bg-white/20">

      <div className="container mx-auto px-6 md:px-12 xl:px-24">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* =======================
              Columna Izquierda: Editorial Typography & Search
              ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left relative z-10"
          >
            {/* Pill Badge Minimalista (Arquitectónico) */}
            <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <Zap className="w-3 h-3 animate-pulse" strokeWidth={2} />
                {t('badge')}
              </span>
            </div>

            {/* Editorial Headline with Typewriter */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight text-black dark:text-white leading-[1.05] mb-8 flex flex-wrap items-end gap-x-2 w-full">
              <span>{t('title_start')}</span>
              <TypewriterWords words={dynamicWords} suffix={t('title_end')} />
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed font-light mb-12">
              {t('description')}
            </p>

            {/* Search Form - Architect Style (Flush borders, no rounded corners) */}
            <div className="w-full max-w-2xl relative z-30 group">
              <div className="flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 transition-colors">

                <div className="flex-1 flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-800 group/input">
                  <Search className="w-4 h-4 text-gray-400 group-focus-within/input:text-black dark:group-focus-within/input:text-white transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder="Ej. Nutriólogo en Reforma..."
                    className="w-full bg-transparent border-none outline-none px-4 text-black dark:text-white placeholder:text-gray-400 font-light text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1 flex items-center px-6 py-4 md:py-0 group/location relative border-b md:border-b-0 border-gray-300 dark:border-gray-800">
                  <MapPin className="w-4 h-4 text-gray-400 group-focus-within/location:text-black dark:group-focus-within/location:text-white transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder={t('location_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-4 pr-10 text-black dark:text-white placeholder:text-gray-400 font-light text-sm"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                  <button 
                    onClick={handleGeolocation}
                    title="Usar mi ubicación actual"
                    className="absolute right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse text-black dark:text-white' : ''}`} />
                  </button>
                </div>

                <Button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchQuery) params.append("q", searchQuery);
                    if (locationQuery) params.append("loc", locationQuery);
                    const query = params.toString();
                    router.push(`/patient/discover${query ? `?${query}` : ""}`);
                  }}
                  className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none px-8 py-6 h-auto text-[10px] font-bold uppercase tracking-widest transition-all group/btn border-0"
                >
                  <span className="relative group-hover/btn:translate-x-1 transition-transform inline-block">
                    {t('search_button')}
                  </span>
                </Button>
              </div>
            </div>

            {/* Micro-Metrics (Minimalist) */}
            <div className="flex flex-wrap items-center gap-6 pt-6 w-full max-w-2xl relative z-20">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2 group cursor-default">
                  <metric.icon className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{metric.label}</span>
                </div>
              ))}
            </div>

          </motion.div>

          {/* =======================
              Columna Derecha: Blueprint / Architectural Wireframe
              ======================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden lg:block z-0"
          >
            {/* Blueprint Grid Container */}
            <div className="relative w-full aspect-[4/5] bg-gray-50/50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-center p-8 group">

              {/* Architectural Grid Background */}
              <div 
                className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none" 
                style={{ 
                  backgroundImage: 'linear-gradient(to right, #9ca3af 1px, transparent 1px), linear-gradient(to bottom, #9ca3af 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
                }} 
              />

              {/* Floating Blueprint Element 1: Health Analysis */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-[320px] bg-white dark:bg-black border border-black dark:border-white p-5 mb-8 relative z-10 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black dark:text-white text-sm tracking-tight">{widgetT.analysis}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        {widgetT.updated}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Minimalist Progress Bar */}
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
                    className="h-full bg-black dark:bg-white absolute top-0 left-0"
                  />
                </div>
              </motion.div>

              {/* Floating Blueprint Element 2: Mini Stat */}
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-8 top-20 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-4 z-20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-black dark:text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">+24%</span>
                </div>
                <p className="text-2xl font-semibold text-black dark:text-white mb-1">14.2k</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Consultas</p>
              </motion.div>

              {/* Floating Blueprint Element 3: Appointment */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-[280px] ml-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-5 relative z-20 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-gray-200 dark:border-gray-800 flex items-center justify-center relative">
                      <Heart className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                      <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                        <UserPlus className="w-2.5 h-2.5 text-black dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black dark:text-white text-sm tracking-tight">{widgetT.appointment}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{widgetT.specialty}</p>
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </div>
              </motion.div>

              {/* Floating Info Footer (Architect Style) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-0 left-0 w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 flex items-center justify-between z-30"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 border border-white dark:border-black bg-gray-200 dark:bg-gray-800 flex items-center justify-center grayscale"
                    >
                      <span className="text-[8px] font-bold text-gray-500">U{i}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 text-black dark:text-white fill-current" />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    <span className="text-black dark:text-white mr-1">+2.5K</span> 
                    {widgetT.reviews}
                  </p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
        
        {/* Logo Carousel */}
        <LogoCarousel />
      </div>
    </section>
  );
};

export default HeroSection;