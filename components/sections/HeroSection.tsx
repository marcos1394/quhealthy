"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Star, 
  Activity, 
  Heart, 
  Calendar, 
  UserPlus, 
  TrendingUp, 
  Zap, 
  Navigation,
  Sparkles,
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  Truck,
  Lock
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LogoCarousel } from "@/components/sections/LogoCarousel";
import { cn } from "@/lib/utils";

const TypewriterWords = ({ words, suffix = "" }: { words: string[]; suffix?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="relative inline-block h-12 sm:h-16 md:h-20 lg:h-[90px] min-w-[140px] sm:min-w-[200px] md:min-w-[300px] align-bottom overflow-visible px-1">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 text-emerald-600 dark:text-emerald-400 font-serif italic text-left whitespace-nowrap"
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
    { label: t('metrics.m3'), icon: Lock },
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
  };

  return (
    <section className="relative w-full bg-gray-50/50 dark:bg-[#050505] pt-28 pb-16 md:pt-36 md:pb-24 transition-colors duration-500 overflow-hidden font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">

      <div className="container mx-auto px-6 md:px-12 xl:px-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── COLUMNA IZQUIERDA: MENSAJE PRINCIPAL & BÚSQUEDA ─────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left relative z-10 space-y-6"
          >
            {/* Pill Badge Esmeralda */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm">
              <Zap className="w-3.5 h-3.5 animate-pulse shrink-0" strokeWidth={2} />
              <span>{t('badge')}</span>
            </div>

            {/* Headline Dinámico */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] flex flex-wrap items-end gap-x-2.5 w-full">
              <span>{t('title_start')}</span>
              <TypewriterWords words={dynamicWords} suffix={t('title_end')} />
            </h1>

            {/* Descripción */}
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl font-medium leading-relaxed pt-1">
              {t('description')}
            </p>

            {/* Búsqueda Avanzada Estilo Flotante */}
            <div className="w-full max-w-2xl relative z-30 pt-2">
              <div className="p-2 rounded-3xl sm:rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col sm:flex-row items-center gap-2 transition-all">

                {/* Input Consulta */}
                <div className="flex-1 flex items-center px-4 py-2 sm:py-0 w-full group/input">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Ej. Nutriólogo, Pediatra en Reforma..."
                    className="w-full bg-transparent border-none outline-none px-3 text-gray-900 dark:text-white placeholder:text-gray-400 font-semibold text-xs sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-gray-100 dark:bg-gray-800 shrink-0" />

                {/* Input Ubicación */}
                <div className="flex-1 flex items-center px-4 py-2 sm:py-0 w-full group/location relative">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder={t('location_placeholder')}
                    className="w-full bg-transparent border-none outline-none px-3 pr-8 text-gray-900 dark:text-white placeholder:text-gray-400 font-semibold text-xs sm:text-sm"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleGeolocation}
                    title="Usar mi ubicación actual"
                    className="absolute right-3 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
                  >
                    <Navigation className={cn("w-3.5 h-3.5", isLocating && "animate-pulse text-emerald-600 dark:text-emerald-400")} strokeWidth={2} />
                  </button>
                </div>

                {/* Botón Buscar */}
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchQuery) params.append("q", searchQuery);
                    if (locationQuery) params.append("loc", locationQuery);
                    const query = params.toString();
                    router.push(`/discover${query ? `?${query}` : ""}`);
                  }}
                  className="w-full sm:w-auto h-12 px-7 rounded-2xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <span>{t('search_button')}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>

              </div>
            </div>

            {/* Acceso Rápido por Rol */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shadow-2xs group"
              >
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>{t("quick_patient", { defaultValue: "Pacientes" })}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/business"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shadow-2xs group"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("quick_provider", { defaultValue: "Médicos & Clínicas" })}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/foundations"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:border-rose-500/50 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all shadow-2xs group"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                <span>{t("quick_foundation", { defaultValue: "Fundaciones & ONGs" })}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/suppliers"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all shadow-2xs group"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{t("quick_supplier", { defaultValue: "Proveedores B2B" })}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Micro-Métricas Pill */}
            <div className="flex flex-wrap items-center gap-4 pt-2 relative z-20">
              {metrics.map((metric, idx) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                    <MetricIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{metric.label}</span>
                  </div>
                );
              })}
            </div>

          </motion.div>

          {/* ── COLUMNA DERECHA: MOCKUPS DE PLATAFORMA (GLASSMORPHISM) ───── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative hidden lg:block z-0"
          >
            <div className="relative w-full aspect-[4/5] rounded-3xl bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent border border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-between overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-none backdrop-blur-md">

              {/* Glowing Ambient Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Card 1: Health Analysis */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-[310px] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-lg space-y-4 relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Activity className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs tracking-tight">
                      {widgetT.analysis}
                    </h3>
                    <p className="text-[10px] font-semibold text-gray-400">
                      {widgetT.updated}
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                    <span>Estado Metabólico</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">85% Óptimo</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-emerald-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2: Mini Stat (Copiloto IA) */}
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-6 top-16 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-lg z-20 space-y-2 min-w-[135px]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">IA Clínica</span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">Notas SOAP</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Automatizadas</p>
                </div>
              </motion.div>

              {/* Floating Card 3: Appointment Booking */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-[270px] ml-6 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-lg relative z-20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
                      <Heart className="w-5 h-5" strokeWidth={2} />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center border border-white">
                        <UserPlus className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xs">{widgetT.appointment}</h3>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{widgetT.specialty}</p>
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </div>
              </motion.div>

              {/* Floating Footer: Acreditación Oficial & Seguridad Normativa */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm relative z-30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-none">
                      Expediente & Receta Digital
                    </p>
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      NOM-004-SSA3 • Firma SEP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-3 border-l border-gray-100 dark:border-gray-800 text-right">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">
                      Validación DGP
                    </p>
                    <p className="text-[9px] font-medium text-gray-400">
                      Cifrado AES-256
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>

        {/* Logo Carousel Section */}
        <div className="pt-12">
          <LogoCarousel />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;