"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShoppingBag, Stethoscope, Cpu, Pill, Syringe, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";

interface MarketProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  rating: number;
  thumbnailUrl: string;
}

export default function MarketPage() {
  const t = useTranslations("PublicMarket");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "equipment", icon: Stethoscope, label: t('categories.c1') },
    { id: "tech", icon: Cpu, label: t('categories.c2') },
    { id: "pharma", icon: Pill, label: t('categories.c3') },
    { id: "supplies", icon: Syringe, label: t('categories.c4') }
  ];

  const { data: products, isLoading } = useSWR<MarketProduct[]>(
    '/api/catalog/market/public/products/trending',
    (url) => axiosInstance.get(url).then(res => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* Editorial Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
                <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black dark:text-white">{t('breadcrumb')}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-[1.1]">
                {t('title_light')}
                <br />
                <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light pr-2">
                  {t('title_highlight')}
                </span>
                {t('title_dark')}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-12 max-w-lg">
                {t('subtitle')}
              </p>

              {/* Search Bar (Flush Design) */}
              <div className="max-w-md relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push('/market/search?q=' + encodeURIComponent(searchQuery.trim()));
                    }
                  }}
                  placeholder={t('search_ph')}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-4 pl-10 pr-6 text-lg font-light outline-none transition-all focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-gray-400"
                />
              </div>
            </motion.div>

            {/* Wireframe Graphic (Arquitectónico) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2 w-full flex justify-center lg:justify-end"
            >
              <div className="relative w-full aspect-[4/5] max-w-md bg-gray-100 dark:bg-gray-900 overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-3">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-800"></div>
                  <div className="w-8 h-2 bg-gray-200 dark:bg-gray-800"></div>
                </div>
                <div className="mt-16 h-full p-8 flex flex-col gap-6">
                  {/* Fake Image Container */}
                  <div className="w-full aspect-square border border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden">
                    <Stethoscope className="w-16 h-16 text-black dark:text-white opacity-20" strokeWidth={1} />
                  </div>
                  <div className="space-y-4">
                    <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-800"></div>
                    <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                  <div className="w-full h-12 bg-black dark:bg-white mt-auto flex items-center justify-center">
                     <div className="w-1/4 h-2 bg-white dark:bg-black opacity-50"></div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Categories (Fila Editorial) */}
      <section className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="py-10 md:py-12 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <cat.icon className="w-8 h-8 text-black dark:text-white opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products (Catálogo Minimalista) */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
              {t('trending_title')}
            </h2>
            <Link 
              href="#" 
              className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors pb-1"
            >
              Ver todo el catálogo <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
          >
            {isLoading ? (
              <div className="col-span-full py-20 flex justify-center items-center">
                <div className="animate-pulse flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                </div>
              </div>
            ) : (!products || products.length === 0) ? (
              <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400 font-light">
                No hay productos en tendencia por el momento.
              </div>
            ) : (
              products.map((product) => (
                <motion.div 
                  key={product.id}
                  variants={itemVariants}
                  className="group flex flex-col h-full cursor-pointer"
                >
                  {/* Product Image Area */}
                  <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-900 relative p-4 flex items-center justify-center mb-6 overflow-hidden">
                    <div className="absolute top-4 left-4 bg-black text-white dark:bg-white dark:text-black px-2 py-1 flex items-center gap-1 z-10">
                      <Star className="w-2.5 h-2.5 text-white dark:text-black fill-current" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{product.rating}</span>
                    </div>
                    <img 
                      src={product.thumbnailUrl || `/api/placeholder/400/500`}
                      alt={product.title}
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen opacity-80 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 dark:bg-white/90 text-white dark:text-black py-4 text-center text-xs font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Agregar al Carrito
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {product.brand}
                    </span>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2 leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-xl font-medium text-black dark:text-white">
                        ${product.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })} {product.currency || 'MXN'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
}