"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const SuiteSection: React.FC = () => {
  const t = useTranslations('Suite');

  const suiteProducts = [
    {
      name: "QuHealthy",
      description: t('products.quhealthy.description'),
      icon: Lightbulb,
      themeColor: "text-teal-600 dark:text-teal-400",
      bgClass: "bg-teal-50 dark:bg-teal-900/10",
      features: [
        t('products.quhealthy.features.0'),
        t('products.quhealthy.features.1'),
        t('products.quhealthy.features.2'),
        t('products.quhealthy.features.3'),
      ],
      explore: t('products.quhealthy.explore'),
    },
    {
      name: "QuMarket",
      description: t('products.qumarket.description'),
      icon: ShoppingBag,
      themeColor: "text-medical-600 dark:text-medical-400",
      bgClass: "bg-medical-50 dark:bg-medical-900/10",
      features: [
        t('products.qumarket.features.0'),
        t('products.qumarket.features.1'),
        t('products.qumarket.features.2'),
        t('products.qumarket.features.3'),
      ],
      explore: t('products.qumarket.explore'),
    },
    {
      name: "QuBlocks",
      description: t('products.qublocks.description'),
      icon: BookOpen,
      themeColor: "text-indigo-600 dark:text-indigo-400",
      bgClass: "bg-indigo-50 dark:bg-indigo-900/10",
      features: [
        t('products.qublocks.features.0'),
        t('products.qublocks.features.1'),
        t('products.qublocks.features.2'),
        t('products.qublocks.features.3'),
      ],
      explore: t('products.qublocks.explore'),
    }
  ];

  // Imágenes representativas para cada producto de la suite
  const suiteImages = [
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop", // QuHealthy: Doctor / Clínica
    "https://images.unsplash.com/photo-1576091160550-2173eff3e8fc?q=80&w=1200&auto=format&fit=crop", // QuMarket: Productos/Marketplace salud
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop"  // QuBlocks: Educación/Academia
  ];

  return (
    <section id="suite" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">

        {/* Header - Minimalist Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <span className="inline-block border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase mb-6">
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
                    TEXT CONTENT (Editorial)
                    ==================== */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("space-y-8 lg:max-w-xl", !isEven ? "lg:col-start-2" : "")}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={cn("p-3 rounded-2xl", product.bgClass, product.themeColor)}>
                      <product.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    {product.description}
                  </p>

                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 w-full max-w-sm my-8" />

                  <ul className="space-y-5">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className={cn("w-5 h-5 flex-shrink-0 mt-0.5", product.themeColor)} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-8">
                    <a href="#" className="group inline-flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-lg hover:opacity-80 transition-all">
                      <span className="border-b-2 border-slate-900 dark:border-white pb-0.5">{product.explore}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </a>
                  </div>
                </motion.div>

                {/* ====================
                    VISUAL CONTENT (Authentic Photography)
                    ==================== */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("relative w-full aspect-[4/5] lg:aspect-square rounded-[2rem] overflow-hidden", !isEven ? "lg:col-start-1 lg:row-start-1" : "")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={suiteImages[index]}
                    alt={`Ilustración de uso para ${product.name}`}
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-[2s] ease-out"
                  />

                  {/* Overlay gradiente muy sutil para asegurar contraste si se colocan elementos encima en el futuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent mix-blend-multiply" />
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