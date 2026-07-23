"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  ShoppingBag, 
  BookOpen, 
  ArrowRight, 
  Calendar, 
  User, 
  CreditCard, 
  PlayCircle, 
  Award, 
  Package, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

// ── MOCKUPS CONCEPTUALES EN ESTILO GLASSMORPHISM & ESMERALDA ───────────────

const AbstractQuHealthyMockup = () => (
  <div className="w-full h-full relative flex items-center justify-center p-8 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md group">
    {/* Grid de Fondo Suave */}
    <div 
      className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none" 
      style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
    />
    
    {/* Glow Ambient Effect */}
    <div className="absolute w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

    {/* Tarjeta de Agenda Clínica */}
    <motion.div 
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 w-full max-w-[290px] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-lg space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Calendar className="w-4.5 h-4.5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-20 bg-gray-900 dark:bg-white rounded-full" />
            <div className="h-1.5 w-12 bg-emerald-600 dark:text-emerald-400 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 hover:border-emerald-500/30 transition-all cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-1.5 w-2/3 bg-gray-100 dark:bg-gray-900 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Elemento Flotante: Perfil de Paciente */}
    <motion.div 
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute right-6 bottom-10 w-48 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-xl z-20 space-y-2"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
          <User className="w-4 h-4" strokeWidth={2} />
        </div>
        <div className="space-y-1 flex-1">
          <div className="h-2 w-16 bg-gray-900 dark:bg-white rounded-full" />
          <div className="h-1.5 w-10 bg-emerald-600 dark:text-emerald-400 rounded-full" />
        </div>
      </div>
    </motion.div>
  </div>
);

const AbstractQuMarketMockup = () => (
  <div className="w-full h-full relative flex items-center justify-center p-8 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md group">
    {/* Dot Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" 
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '16px 16px' }} 
    />

    <div className="flex gap-4 items-end relative z-10 w-full max-w-[320px]">
      {/* Tarjeta de Producto */}
      <motion.div 
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-1 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-lg space-y-3"
      >
        <div className="aspect-square rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <Package className="w-7 h-7" strokeWidth={2} />
        </div>
        <div className="h-2 w-3/4 bg-gray-900 dark:bg-white rounded-full" />
        <div className="h-1.5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">$499</span>
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>

      {/* Tarjeta de Checkout / Pago */}
      <motion.div 
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="flex-1 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xl mb-4 space-y-3"
      >
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Seguro</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-2 w-4/5 bg-gray-100 dark:bg-gray-900 rounded-full" />
        </div>
        <div className="h-8 w-full rounded-xl bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
          <span>Pago Rápido</span>
        </div>
      </motion.div>
    </div>
  </div>
);

const AbstractQuBlocksMockup = () => (
  <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md group">
    {/* Diagonal Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 40%)', backgroundSize: '16px 16px' }} 
    />

    {/* Reproductor de Video Educativo */}
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative z-10 w-full max-w-[300px] aspect-video rounded-2xl bg-gray-900 text-white border border-gray-800 mb-6 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer"
    >
      <div className="w-11 h-11 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-md backdrop-blur-xs group-hover:scale-110 transition-transform">
        <PlayCircle className="w-6 h-6" strokeWidth={2} />
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-800">
        <div className="h-full w-2/5 bg-emerald-500 rounded-r-full" />
      </div>
    </motion.div>

    {/* Certificado / Reconocimiento */}
    <motion.div 
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-20 w-full max-w-[270px] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xl"
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
        <Award className="w-4.5 h-4.5" strokeWidth={2} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="h-2 w-3/4 bg-gray-900 dark:bg-white rounded-full" />
        <div className="h-1.5 w-1/2 bg-emerald-600 dark:text-emerald-400 rounded-full" />
      </div>
    </motion.div>
  </div>
);

// ── COMPONENTE PRINCIPAL SECCIÓN SUITE ──────────────────────────────────────

const SuiteSection: React.FC = () => {
  const t = useTranslations('Suite');

  const suiteProducts = [
    {
      name: "QuHealthy",
      description: t('products.quhealthy.description'),
      icon: Lightbulb,
      features: [
        t('products.quhealthy.features.0'),
        t('products.quhealthy.features.1'),
        t('products.quhealthy.features.2'),
        t('products.quhealthy.features.3'),
      ],
      explore: t('products.quhealthy.explore'),
      Mockup: AbstractQuHealthyMockup
    },
    {
      name: "QuMarket",
      description: t('products.qumarket.description'),
      icon: ShoppingBag,
      features: [
        t('products.qumarket.features.0'),
        t('products.qumarket.features.1'),
        t('products.qumarket.features.2'),
        t('products.qumarket.features.3'),
      ],
      explore: t('products.qumarket.explore'),
      Mockup: AbstractQuMarketMockup
    },
    {
      name: "QuBlocks",
      description: t('products.qublocks.description'),
      icon: BookOpen,
      features: [
        t('products.qublocks.features.0'),
        t('products.qublocks.features.1'),
        t('products.qublocks.features.2'),
        t('products.qublocks.features.3'),
      ],
      explore: t('products.qublocks.explore'),
      Mockup: AbstractQuBlocksMockup
    }
  ];

  return (
    <section id="suite" className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">

        {/* ── ENCABEZADO PRINCIPAL ────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 md:mb-28 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <Layers className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t('badge', { defaultValue: "Ecosistema Integrado" })}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t('title')}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl pt-1">
            {t('description')}
          </p>
        </div>

        {/* ── DESGLOSE DE PRODUCTOS DEL ECOSISTEMA ─────────────────────────── */}
        <div className="space-y-24 md:space-y-32 border-t border-gray-100 dark:border-gray-800 pt-20">
          {suiteProducts.map((product, index) => {
            const isEven = index % 2 === 0;

            return (
              <div 
                key={product.name} 
                className={cn(
                  "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                )}
              >

                {/* COLUMNA TEXTO */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn("space-y-6 lg:max-w-xl", !isEven && "lg:order-2")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <product.icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80 my-6" />

                  {/* Lista de Atributos Clave */}
                  <ul className="space-y-3">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Link Explorar */}
                  <div className="pt-4">
                    <Link 
                      href="/discover" 
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:bg-emerald-50/50 hover:border-emerald-500/30 dark:hover:bg-emerald-950/20 transition-all shadow-xs group"
                    >
                      <span>{product.explore}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                    </Link>
                  </div>
                </motion.div>

                {/* COLUMNA MOCKUP CONCEPTUAL */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn("relative w-full aspect-square lg:aspect-[4/3]", !isEven && "lg:order-1")}
                >
                  <product.Mockup />
                </motion.div>

              </div>
            );
          })}
        </div>

        {/* ── FOOTER DE LA SECCIÓN ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-24 pt-8 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400">
          <p>
            {t('footer', { defaultValue: "Todos los módulos operan de manera sincronizada e interoperable." })}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
            <span className="w-2 h-2 rounded-full bg-emerald-300 opacity-30" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default SuiteSection;