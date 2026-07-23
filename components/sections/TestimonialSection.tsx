"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquareQuote, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TestimonialsSection: React.FC = () => {
  const t = useTranslations("Testimonials");

  const testimonials = [
    {
      name: t("items.1.name"),
      role: t("items.1.role"),
      text: t("items.1.text"),
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      name: t("items.2.name"),
      role: t("items.2.role"),
      text: t("items.2.text"),
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      name: t("items.3.name"),
      role: t("items.3.role"),
      text: t("items.3.text"),
      avatar:
        "https://images.unsplash.com/photo-1594824432258-293e5066c06a?auto=format&fit=crop&q=80&w=150&h=150",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 border-t border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30"
    >
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO PRINCIPAL ────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <MessageSquareQuote className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("badge", { defaultValue: "Experiencias Reales" })}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t("title_start")}{" "}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl pt-1">
            {t("description")}
          </p>
        </div>

        {/* ── GRILLA DE TESTIMONIOS (TARJETAS SUAVIZADAS) ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-7 md:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4 flex-1 flex flex-col">
                
                {/* Comilla Decorativa */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <MessageSquareQuote className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {/* Rating Estrellas */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Texto del Testimonio */}
                <blockquote className="text-xs sm:text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed flex-1 pt-2">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
              </div>

              {/* Autor Info */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-3.5 mt-6">
                <div className="w-11 h-11 rounded-full border-2 border-emerald-100 dark:border-emerald-900/40 overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                    {testimonial.role}
                  </p>
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