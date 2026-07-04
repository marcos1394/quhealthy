"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, ShoppingBag, BookOpen, ArrowRight, Calendar, User, CreditCard, PlayCircle, Award, Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

// --- Architectural Blueprint Mockups ---

const AbstractQuHealthyMockup = () => (
 <div className="w-full h-full relative flex items-center justify-center p-8 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 overflow-hidden group">
 {/* Architectural Grid */}
 <div 
 className="absolute inset-0 opacity-20 dark:opacity-20 pointer-events-none" 
 style={{ backgroundImage: 'linear-gradient(to right, #9ca3af 1px, transparent 1px), linear-gradient(to bottom, #9ca3af 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
 />
 
 {/* Wireframe Panel */}
 <motion.div 
 animate={{ y: [0, -5, 0] }}
 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
 className="relative z-10 w-full max-w-[280px] bg-white dark:bg-black border border-black dark:border-white p-6"
 >
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
 <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center">
 <Calendar className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div className="space-y-1">
 <div className="h-1.5 w-16 bg-black dark:bg-white" />
 <div className="h-1.5 w-10 bg-gray-300 dark:bg-gray-700 ml-auto" />
 </div>
 </div>
 
 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="flex items-start gap-4 p-3 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer">
 <div className="w-1.5 h-1.5 bg-black dark:bg-white mt-1" />
 <div className="flex-1 space-y-2">
 <div className="h-1.5 w-full bg-gray-300 dark:bg-gray-700" />
 <div className="h-1.5 w-2/3 bg-gray-200 dark:bg-gray-800" />
 </div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Floating Element */}
 <motion.div 
 animate={{ y: [0, 5, 0] }}
 transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
 className="absolute right-4 bottom-12 w-48 bg-black dark:bg-white border border-white dark:border-black p-5 z-20"
 >
 <div className="flex items-center gap-3 mb-4">
 <div className="w-6 h-6 border border-white dark:border-black flex items-center justify-center">
 <User className="w-3 h-3 text-white dark:text-black" />
 </div>
 <div className="h-1.5 w-16 bg-gray-500 dark:bg-gray-400" />
 </div>
 <div className="space-y-2">
 <div className="h-1.5 w-full bg-gray-600 dark:bg-gray-300" />
 <div className="h-1.5 w-4/5 bg-gray-600 dark:bg-gray-300" />
 </div>
 </motion.div>
 </div>
);

const AbstractQuMarketMockup = () => (
 <div className="w-full h-full relative flex items-center justify-center p-8 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 overflow-hidden group">
 {/* Dot Grid */}
 <div 
 className="absolute inset-0 opacity-30 dark:opacity-20" 
 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #9ca3af 1px, transparent 0)', backgroundSize: '16px 16px' }} 
 />

 <div className="flex gap-6 items-end relative z-10 w-full max-w-[340px]">
 {/* Wireframe Product Card */}
 <motion.div 
 animate={{ y: [0, -5, 0] }}
 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
 className="flex-1 bg-white dark:bg-black border border-black dark:border-white p-4"
 >
 <div className="aspect-square border border-gray-200 dark:border-gray-800 mb-4 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
 <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <div className="h-2 w-3/4 bg-black dark:bg-white mb-2" />
 <div className="h-1.5 w-1/2 bg-gray-300 dark:bg-gray-700 mb-6" />
 <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-4">
 <div className="h-3 w-12 bg-black dark:bg-white" />
 <div className="w-6 h-6 border border-black dark:border-white flex items-center justify-center">
 <Plus className="w-3 h-3" />
 </div>
 </div>
 </motion.div>

 {/* Wireframe Checkout Card */}
 <motion.div 
 animate={{ y: [0, 5, 0] }}
 transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
 className="flex-1 bg-black dark:bg-white p-5 mb-8 border border-white dark:border-black"
 >
 <div className="flex justify-between items-center mb-6 border-b border-gray-800 dark:border-gray-200 pb-4">
 <CreditCard className="w-5 h-5 text-white dark:text-black" strokeWidth={1.5} />
 <div className="h-1.5 w-8 bg-gray-500 dark:bg-gray-400" />
 </div>
 <div className="space-y-3 mb-8">
 <div className="h-1.5 w-full bg-gray-700 dark:bg-gray-200" />
 <div className="h-1.5 w-4/5 bg-gray-700 dark:bg-gray-200" />
 </div>
 <div className="h-8 w-full bg-white dark:bg-black flex items-center justify-center">
 <div className="h-1.5 w-1/3 bg-black dark:bg-white" />
 </div>
 </motion.div>
 </div>
 </div>
);

const AbstractQuBlocksMockup = () => (
 <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 overflow-hidden group">
 {/* Diagonal Stripes Grid */}
 <div 
 className="absolute inset-0 opacity-10 dark:opacity-10 pointer-events-none" 
 style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} 
 />

 {/* Wireframe Video Player */}
 <motion.div 
 whileHover={{ scale: 1.02 }}
 className="relative z-10 w-full max-w-[320px] aspect-video bg-black dark:bg-white border border-black dark:border-white mb-8 flex items-center justify-center cursor-pointer"
 >
 <div className="w-12 h-12 border border-white dark:border-black flex items-center justify-center group-hover:bg-white dark:group-hover:bg-black transition-colors duration-300">
 <PlayCircle className="w-5 h-5 text-white dark:text-black group-hover:text-black dark:group-hover:text-white transition-colors" strokeWidth={1} />
 </div>
 
 {/* Strict Progress Bar */}
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 dark:bg-gray-200">
 <div className="h-full w-1/3 bg-white dark:bg-black" />
 </div>
 </motion.div>

 {/* Wireframe Certificate/Award */}
 <motion.div 
 animate={{ y: [0, -5, 0] }}
 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
 className="relative z-20 w-full max-w-[280px] bg-white dark:bg-black border border-black dark:border-white p-4 flex items-center gap-5"
 >
 <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
 <Award className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div className="flex-1 space-y-2 border-l border-gray-200 dark:border-gray-800 pl-4">
 <div className="h-1.5 w-3/4 bg-black dark:bg-white" />
 <div className="h-1.5 w-1/2 bg-gray-400 dark:bg-gray-600" />
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
 <section id="suite" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="container mx-auto px-6 md:px-12 xl:px-24">

 {/* Editorial Header */}
 <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-24 md:mb-32">
 <div className="border border-black dark:border-white px-4 py-1.5 mb-8">
 <span className="text-[10px] font-bold tracking-widest uppercase text-black dark:text-white">
 {t('badge')}
 </span>
 </div>
 <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-black dark:text-white tracking-tight leading-[1.1] mb-6">
 {t('title')}
 </h2>
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
 {t('description')}
 </p>
 </div>

 <div className="space-y-32 border-t border-gray-200 dark:border-gray-800 pt-32">
 {suiteProducts.map((product, index) => {
 const isEven = index % 2 === 0;

 return (
 <div key={product.name} className={cn("grid lg:grid-cols-2 gap-12 lg:gap-24 items-center", !isEven ? "lg:flex-row-reverse" : "")}>

 {/* ====================
 TEXT CONTENT (Editorial Rigor)
 ==================== */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 className={cn("space-y-8 lg:max-w-xl", !isEven ? "lg:col-start-2" : "")}
 >
 <div className="flex items-center gap-6 mb-8">
 <div className="w-14 h-14 border border-black dark:border-white flex items-center justify-center">
 <product.icon className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h3 className="text-4xl lg:text-5xl font-semibold text-black dark:text-white tracking-tight">
 {product.name}
 </h3>
 </div>

 <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-light">
 {product.description}
 </p>

 <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-10" />

 <ul className="space-y-6">
 {product.features.map((feature, i) => (
 <li key={i} className="flex items-start gap-5 group">
 <div className="w-1.5 h-1.5 bg-black dark:bg-white mt-2 group-hover:scale-150 transition-transform" />
 <span className="text-black dark:text-gray-300 font-light text-base leading-relaxed tracking-wide">
 {feature}
 </span>
 </li>
 ))}
 </ul>

 <div className="pt-12">
 <Link 
 href="/discover" 
 className="group inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors pb-1"
 >
 {product.explore}
 <ArrowRight className="w-3 h-3 ml-3 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </motion.div>

 {/* ====================
 VISUAL CONTENT (Architectural Wireframes)
 ==================== */}
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 className={cn("relative w-full aspect-square lg:aspect-[4/5]", !isEven ? "lg:col-start-1 lg:row-start-1" : "")}
 >
 <product.Mockup />
 </motion.div>

 </div>
 );
 })}
 </div>

 {/* Blueprint Footer */}
 <div className="flex justify-between items-center mt-32 pt-8 border-t border-gray-200 dark:border-gray-800">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
 {t('footer')}
 </p>
 <div className="flex gap-1">
 <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700" />
 <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700" />
 <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700" />
 </div>
 </div>
 </div>
 </section>
 );
};

export default SuiteSection;