"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShoppingCart, Stethoscope, Cpu, Pill, Syringe, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function MarketPage() {
  const t = useTranslations("PublicMarket");

  const categories = [
    { icon: Stethoscope, label: t('categories.c1') },
    { icon: Cpu, label: t('categories.c2') },
    { icon: Pill, label: t('categories.c3') },
    { icon: Syringe, label: t('categories.c4') }
  ];

  const products = [
    { id: "p1", title: t('products.p1_title'), brand: t('products.p1_brand'), price: t('products.p1_price'), rating: 4.9 },
    { id: "p2", title: t('products.p2_title'), brand: t('products.p2_brand'), price: t('products.p2_price'), rating: 4.8 },
    { id: "p3", title: t('products.p3_title'), brand: t('products.p3_brand'), price: t('products.p3_price'), rating: 4.7 },
    { id: "p4", title: t('products.p4_title'), brand: t('products.p4_brand'), price: t('products.p4_price'), rating: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:w-3/5"
            >
              <span className="inline-block border border-medical-200 dark:border-medical-800 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
                {t('breadcrumb')}
              </span>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                {t('title_light')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500 italic font-serif">{t('title_highlight')}</span>{t('title_dark')}
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-10 max-w-xl">
                {t('subtitle')}
              </p>

              <div className="relative group max-w-lg">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder={t('search_ph')}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-medical-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl h-14 pl-12 pr-6 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:shadow-md"
                />
              </div>
            </motion.div>

            {/* Illustration / Graphic for Market */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-2/5 w-full flex justify-center"
            >
              <div className="relative w-full aspect-square max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-medical-100 to-teal-50 dark:from-medical-900/30 dark:to-teal-900/20 rounded-full blur-3xl opacity-60"></div>
                <div className="relative h-full w-full bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl p-8 flex flex-col gap-4 overflow-hidden">
                  <div className="w-full h-1/2 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="w-16 h-16 text-medical-300 dark:text-medical-700" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-3/4 h-4 bg-slate-100 dark:bg-slate-900 rounded-full"></div>
                    <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-900 rounded-full"></div>
                    <div className="w-full h-10 bg-medical-50 dark:bg-medical-900/30 rounded-xl mt-4"></div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-medical-500 hover:shadow-sm cursor-pointer transition-all group">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-medical-50 dark:group-hover:bg-medical-900/30 transition-colors">
                  <cat.icon className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-medical-600 dark:group-hover:text-medical-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('trending_title')}</h2>
            <Link href="#" className="hidden md:flex items-center gap-2 text-medical-600 dark:text-medical-400 font-medium hover:underline">
              Ver todo el catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-medical-900/10 transition-all flex flex-col group"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-950 relative p-4 flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{product.rating}</span>
                  </div>
                  {/* Placeholder Image */}
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-inner opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{product.brand}</span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight">{product.title}</h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{product.price}</span>
                    <Button size="icon" className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full w-10 h-10 shadow-md">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
