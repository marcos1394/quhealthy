"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck, Lock, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("PublicPrivacy");
  const sections = [
    { id: "intro", title: t('s1_title') },
    { id: "data", title: t('s2_title') },
    { id: "usage", title: t('s3_title') },
    { id: "sharing", title: t('s4_title') },
    { id: "security", title: t('s5_title') },
    { id: "rights", title: t('s6_title') },
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
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-medical-600 dark:text-medical-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('badges.b1_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('badges.b1_desc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
              <Lock className="w-8 h-8 text-medical-600 dark:text-medical-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('badges.b2_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('badges.b2_desc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
              <EyeOff className="w-8 h-8 text-medical-600 dark:text-medical-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('badges.b3_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('badges.b3_desc')}</p>
            </div>
          </div>
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Contenido</h3>
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
              <p className="lead text-xl text-slate-500 dark:text-slate-400 mb-12">
                {t('intro')}
              </p>

              <h2 id="intro" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s1_title')}</h2>
              <p>{t('s1_desc')}</p>

              <h2 id="data" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s2_title')}</h2>
              <p>{t('s2_desc')}</p>
              <ul>
                <li><strong>{t('s2_l1').split(':')[0]}:</strong> {t('s2_l1').split(':')[1]}</li>
                <li><strong>{t('s2_l2').split(':')[0]}:</strong> {t('s2_l2').split(':')[1]}</li>
                <li><strong>{t('s2_l3').split(':')[0]}:</strong> {t('s2_l3').split(':')[1]}</li>
              </ul>

              <h2 id="usage" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s3_title')}</h2>
              <p>{t('s3_desc')}</p>

              <h2 id="sharing" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s4_title')}</h2>
              <p>{t('s4_desc')}</p>

              <h2 id="security" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s5_title')}</h2>
              <p>{t('s5_desc')}</p>

              <h2 id="rights" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('s6_title')}</h2>
              <p>{t('s6_desc')}</p>
              <ul>
                <li>{t('s6_l1')}</li>
                <li>{t('s6_l2')}</li>
                <li>{t('s6_l3')}</li>
                <li>{t('s6_l4')}</li>
              </ul>
              
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm bg-medical-50 dark:bg-medical-900/10 p-6 rounded-2xl">
                {t('contact')}
              </div>
            </motion.article>

          </div>
        </div>
      </section>
    </div>
  );
}
