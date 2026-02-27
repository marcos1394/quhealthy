"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

const TestimonialsSection: React.FC = () => {
  const t = useTranslations('Testimonials');

  const testimonials = [
    {
      name: t('items.1.name'),
      role: t('items.1.role'),
      text: t('items.1.text'),
    },
    {
      name: t('items.2.name'),
      role: t('items.2.role'),
      text: t('items.2.text'),
    },
    {
      name: t('items.3.name'),
      role: t('items.3.role'),
      text: t('items.3.text'),
    }
  ];

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">

        {/* Header - Editorial Style */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <span className="inline-block border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase mb-6">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            {t('title_start')} <span className="text-medical-600 dark:text-medical-400 font-serif italic">{t('title_highlight')}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            {t('description')}
          </p>
        </div>

        {/* Grid de Testimonios - Clean and spacious */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col relative"
            >
              {/* Gran comilla decorativa editorial */}
              <div className="absolute -top-10 -left-6 text-9xl font-serif text-slate-100 dark:text-slate-800/50 leading-none h-12 mb-6 z-0 select-none">
                &ldquo;
              </div>

              {/* Testimonial text - Editorial */}
              <blockquote className="relative z-10 text-xl md:text-2xl text-slate-900 dark:text-slate-100 leading-relaxed font-light mb-12 flex-1">
                {testimonial.text}
              </blockquote>

              {/* Footer con autor - Limpio y tipográfico */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 tracking-wide uppercase font-semibold">
                      {testimonial.role}
                    </p>
                  </div>

                  {/* Rating visual */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-slate-900 dark:text-slate-100 fill-slate-900 dark:fill-slate-100"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;