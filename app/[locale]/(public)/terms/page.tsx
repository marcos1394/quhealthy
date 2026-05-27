"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("PublicTerms");

  const sections = [
    { id: "intro", title: t('intro_title') },
    { id: "use", title: t('use_title') },
    { id: "cancel", title: t('cancel_title') },
    { id: "privacy", title: t('privacy_title') },
    { id: "liability", title: t('liability_title') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
              <Link href="/" className="hover:underline">QuHealthy</Link>
              <ChevronRight className="w-4 h-4" />
              <span>{t('breadcrumb')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light">
              {t('date')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
            
            {/* Sidebar Navigation */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-64 shrink-0 md:sticky md:top-32"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">{t('toc')}</h3>
              <ul className="space-y-4">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      className="text-slate-500 dark:text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 font-medium text-sm transition-colors"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.aside>

            {/* Document Body */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-300 font-light leading-relaxed"
            >
              <h2 id="intro" className="text-2xl font-semibold text-slate-900 dark:text-white mt-0 mb-6">{t('intro_title')}</h2>
              <p>{t('intro_desc')}</p>

              <h2 id="use" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('use_title')}</h2>
              <p>{t('use_desc')}</p>

              <h2 id="cancel" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('cancel_title')}</h2>
              <p>{t('cancel_desc')}</p>

              <h2 id="privacy" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('privacy_title')}</h2>
              <p>
                {t('privacy_desc')} <Link href="/privacy" className="text-medical-600 dark:text-medical-400 font-medium hover:underline">{t('privacy_link')}</Link>
              </p>

              <h2 id="liability" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('liability_title')}</h2>
              <p>{t('liability_desc')}</p>
              
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm">
                {t('contact')}
              </div>
            </motion.article>

          </div>
        </div>
      </section>
    </div>
  );
}
