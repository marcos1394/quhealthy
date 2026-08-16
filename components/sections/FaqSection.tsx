"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  ChevronDown, 
  User, 
  Stethoscope, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Link from "next/link";

type FaqRole = "patient" | "provider";

export const FaqSection: React.FC = () => {
  const t = useTranslations("FAQ");
  const [activeRole, setActiveRole] = useState<FaqRole>("patient");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const patientFaqs = [
    { q: t("patient.q1"), a: t("patient.a1") },
    { q: t("patient.q2"), a: t("patient.a2") },
    { q: t("patient.q3"), a: t("patient.a3") },
    { q: t("patient.q4"), a: t("patient.a4") },
    { q: t("patient.q5"), a: t("patient.a5") },
  ];

  const providerFaqs = [
    { q: t("provider.q1"), a: t("provider.a1") },
    { q: t("provider.q2"), a: t("provider.a2") },
    { q: t("provider.q3"), a: t("provider.a3") },
    { q: t("provider.q4"), a: t("provider.a4") },
    { q: t("provider.q5"), a: t("provider.a5") },
  ];

  const currentFaqs = activeRole === "patient" ? patientFaqs : providerFaqs;

  return (
    <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-5xl">
        
        {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────────── */}
        <div className="max-w-3xl mb-12 mx-auto text-center flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t("title_start")}{" "}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl mx-auto pt-1">
            {t("description")}
          </p>
        </div>

        {/* ── SWITCH PACIENTE / MÉDICO ─────────────────────────────────────── */}
        <div className="flex justify-center mb-10">
          <div className="p-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 flex items-center gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setActiveRole("patient");
                setOpenIndex(0);
              }}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "patient"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t("switch_patient")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole("provider");
                setOpenIndex(0);
              }}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeRole === "provider"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t("switch_provider")}</span>
            </button>
          </div>
        </div>

        {/* ── ACORDEÓN INTERACTIVO ────────────────────────────────────────── */}
        <div className="space-y-3">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl transition-all border overflow-hidden",
                  isOpen
                    ? "bg-white dark:bg-[#0a0a0a] border-emerald-500/40 shadow-sm"
                    : "bg-white/80 dark:bg-[#0a0a0a]/80 border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform bg-gray-100 dark:bg-gray-800 text-gray-500",
                      isOpen && "rotate-180 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-100 dark:border-gray-800/60 mt-1">
                        <p className="pt-4">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER DE SOPORTE ───────────────────────────────────────────── */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("more_questions")}{" "}
            <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              {t("contact_us")}
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
};
