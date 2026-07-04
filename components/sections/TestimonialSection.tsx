"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TestimonialsSection: React.FC = () => {
 const t = useTranslations('Testimonials');

 const testimonials = [
 {
 name: t('items.1.name'),
 role: t('items.1.role'),
 text: t('items.1.text'),
 avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150"
 },
 {
 name: t('items.2.name'),
 role: t('items.2.role'),
 text: t('items.2.text'),
 avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150"
 },
 {
 name: t('items.3.name'),
 role: t('items.3.role'),
 text: t('items.3.text'),
 avatar: "https://images.unsplash.com/photo-1594824432258-293e5066c06a?auto=format&fit=crop&q=80&w=150&h=150"
 }
 ];

 return (
 <section id="testimonials" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 border-t border-gray-200 dark:border-gray-800 selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="container mx-auto px-6 md:px-12 xl:px-24">

 {/* Header - Editorial Style */}
 <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 md:mb-24">
 <div className="border border-black dark:border-white px-4 py-1.5 mb-8">
 <span className="text-[10px] font-bold tracking-widest uppercase text-black dark:text-white">
 {t('badge')}
 </span>
 </div>
 
 <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-black dark:text-white mb-6 tracking-tight leading-[1.05]">
 {t('title_start')} <br className="hidden md:block"/>
 <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light">
 {t('title_highlight')}
 </span>
 </h2>
 
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
 {t('description')}
 </p>
 </div>

 {/* Grid de Testimonios - Blueprint Matrix */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 w-full max-w-7xl mx-auto">
 {testimonials.map((testimonial, index) => (
 <motion.div
 key={`${testimonial.name}-${index}`}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-50px" }}
 transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
 className="group flex flex-col relative bg-white dark:bg-[#0a0a0a] p-8 md:p-10 border-b border-r border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors duration-500"
 >
 {/* Comilla tipográfica estricta */}
 <div className="text-4xl font-serif text-gray-300 dark:text-gray-700 leading-none mb-6">
 &ldquo;
 </div>

 {/* Testimonial text - Editorial */}
 <blockquote className="text-lg text-black dark:text-white leading-relaxed font-light mb-12 flex-1">
 {testimonial.text}
 </blockquote>

 {/* Footer con autor - Riguroso y cuadrado */}
 <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 mt-auto">
 <div className="flex items-center gap-4">
 {/* Avatar Cuadrado y Grayscale */}
 <div className="w-12 h-12 border border-black dark:border-white overflow-hidden shrink-0">
 <img 
 src={testimonial.avatar} 
 alt={testimonial.name} 
 className="w-full h-full object-cover transition-all duration-500" 
 />
 </div>
 <div>
 <h4 className="text-black dark:text-white font-bold text-xs uppercase tracking-wider mb-0.5">
 {testimonial.name}
 </h4>
 <p className="text-gray-500 dark:text-gray-400 text-[9px] tracking-widest uppercase font-bold">
 {testimonial.role}
 </p>
 </div>
 </div>

 {/* Rating visual (Estilo Arquitectónico) */}
 <div className="flex gap-1 shrink-0">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className="w-3.5 h-3.5 text-black dark:text-white fill-current"
 strokeWidth={1}
 />
 ))}
 </div>
 </div>
 </motion.div>
 ))}
 
 {/* Celdas vacías de relleno si alguna vez tienes menos de 3 (mantiene el plano arquitectónico intacto) */}
 {testimonials.length % 3 !== 0 && Array.from({ length: 3 - (testimonials.length % 3) }).map((_, idx) => (
 <div key={`empty-${idx}`} className="hidden md:block bg-transparent border-b border-r border-gray-200 dark:border-gray-800" />
 ))}
 </div>

 </div>
 </section>
 );
};

export default TestimonialsSection;