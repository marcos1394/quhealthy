"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen, CheckCircle2, ArrowRight, Calendar, User, CreditCard, PlayCircle, Award, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

// --- Abstract UI Mockup Components ---

const AbstractQuHealthyMockup = () => (
  <div className="w-full h-full relative flex items-center justify-center p-8">
    {/* Fondo abstracto */}
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
    </div>
    
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 w-full max-w-[280px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-700/50 p-5 overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
          <div className="h-2 w-16 bg-slate-100 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <div className="flex-1">
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full mb-1.5" />
              <div className="h-1.5 w-2/3 bg-slate-100 dark:bg-slate-600 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    <motion.div 
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute right-4 bottom-12 w-40 bg-slate-900 dark:bg-white rounded-2xl p-4 shadow-2xl z-20 border border-slate-800 dark:border-slate-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
          <User className="w-4 h-4 text-white dark:text-slate-900" />
        </div>
        <div className="h-2 w-12 bg-slate-700 dark:bg-slate-200 rounded-full" />
      </div>
      <div className="h-2 w-full bg-slate-800 dark:bg-slate-100 rounded-full mb-2" />
      <div className="h-2 w-4/5 bg-slate-800 dark:bg-slate-100 rounded-full" />
    </motion.div>
  </div>
);

const AbstractQuMarketMockup = () => (
  <div className="w-full h-full relative flex items-center justify-center p-8">
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#cbd5e1_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,#475569_1px,transparent_0)] bg-[size:20px_20px] opacity-30" />
    </div>

    <div className="flex gap-4 items-end relative z-10 w-full max-w-[340px]">
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4"
      >
        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-900/50 mb-4 flex items-center justify-center">
          <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
        <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-600 rounded-full mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-12 bg-slate-900 dark:bg-white rounded-md" />
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="flex-1 bg-slate-900 dark:bg-white rounded-2xl shadow-2xl p-4 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <CreditCard className="w-5 h-5 text-white dark:text-slate-900" />
          <div className="h-2 w-8 bg-slate-700 dark:bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-1.5 w-full bg-slate-800 dark:bg-slate-100 rounded-full" />
          <div className="h-1.5 w-4/5 bg-slate-800 dark:bg-slate-100 rounded-full" />
        </div>
        <div className="h-8 w-full rounded-lg bg-white dark:bg-slate-900" />
      </motion.div>
    </div>
  </div>
);

const AbstractQuBlocksMockup = () => (
  <div className="w-full h-full relative flex flex-col items-center justify-center p-8">
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem]">
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-200/50 to-transparent dark:from-slate-800/50" />
    </div>

    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative z-10 w-full max-w-[320px] aspect-video bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-6 flex items-center justify-center group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 opacity-50" />
      <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white transition-colors group-hover:scale-110 duration-300 relative z-10" />
      
      {/* ProgressBar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full w-1/3 bg-white" />
      </div>
    </motion.div>

    <motion.div 
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-20 w-full max-w-[280px] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <Award className="w-5 h-5 text-slate-900 dark:text-white" />
      </div>
      <div className="flex-1">
        <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-600 rounded-full mb-2" />
        <div className="h-1.5 w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full" />
      </div>
    </motion.div>
  </div>
);


const SuiteSection: React.FC = () => {
  const t = useTranslations('Suite');

  const suiteProducts = [
    {
      name: "QuHealthy",
      description: t('products.quhealthy.description'),
      icon: Lightbulb,
      themeColor: "text-slate-900 dark:text-white",
      bgClass: "bg-slate-100 dark:bg-slate-800",
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
      themeColor: "text-slate-900 dark:text-white",
      bgClass: "bg-slate-100 dark:bg-slate-800",
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
      themeColor: "text-slate-900 dark:text-white",
      bgClass: "bg-slate-100 dark:bg-slate-800",
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
    <section id="suite" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">

        {/* Header - Minimalist Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <span className="inline-block border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {t('description')}
          </p>
        </div>

        <div className="space-y-32 md:space-y-40">
          {suiteProducts.map((product, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={product.name} className={cn("grid lg:grid-cols-2 gap-12 lg:gap-24 items-center", !isEven ? "lg:flex-row-reverse" : "")}>

                {/* ====================
                    TEXT CONTENT (Editorial Slate)
                    ==================== */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("space-y-8 lg:max-w-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group", !isEven ? "lg:col-start-2" : "")}
                >
                  <div className="flex items-center gap-4 mb-2 relative z-10">
                    <div className={cn("p-3.5 rounded-2xl relative shadow-sm border border-slate-100 dark:border-slate-700/50", product.bgClass, product.themeColor)}>
                      <product.icon className="w-6 h-6 relative z-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight relative z-10">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light relative z-10">
                    {product.description}
                  </p>

                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 w-full max-w-sm my-8" />

                  <ul className="space-y-5">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-900 dark:text-white" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-8">
                    <Link href="/discover" className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-lg hover:opacity-80 transition-all">
                      <span className="border-b-2 border-slate-900 dark:border-white pb-0.5">{product.explore}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                  </div>
                </motion.div>

                {/* ====================
                    VISUAL CONTENT (Abstract Mockups)
                    ==================== */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("relative w-full aspect-[4/5] lg:aspect-square group", !isEven ? "lg:col-start-1 lg:row-start-1" : "")}
                >
                  <product.Mockup />
                </motion.div>

              </div>
            );
          })}
        </div>

        <div className="text-center mt-32 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {t('footer')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SuiteSection;