"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Cookie, ShieldAlert, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
  const t = useTranslations("PublicCookies");

  const sections = [
    { id: "intro", title: t('intro_title') },
    { id: "tipos", title: t('types_title') },
    { id: "consentimiento", title: t('consent_title') },
    { id: "terceros", title: t('thirdparty_title') },
    { id: "contacto", title: t('contact_title') },
  ];

  const handleManagePreferences = () => {
    // Para mostrar el banner de nuevo, eliminamos la preferencia en localStorage y recargamos la página.
    if (typeof window !== "undefined") {
      localStorage.removeItem("quhealthy_cookie_consent");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
              <Link href="/" className="hover:underline">QuHealthy</Link>
              <ChevronRight className="w-4 h-4" />
              <span>{t('breadcrumb')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed mb-6">
              {t('subtitle')}
            </p>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t('date')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
            
            {/* Sidebar / Table of Contents */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-64 shrink-0 md:sticky md:top-32 h-fit"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">{t('toc')}</h3>
              <ul className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      className="block pl-4 py-1 text-slate-500 dark:text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:border-l-2 hover:-ml-[2px] hover:border-medical-600 transition-all font-medium text-sm"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.aside>

            {/* Main Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-300 font-light leading-relaxed"
            >
              <h2 id="intro" className="text-2xl font-semibold text-slate-900 dark:text-white mt-0 mb-6">{t('intro_title')}</h2>
              <p>{t('intro_desc')}</p>

              <h2 id="tipos" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('types_title')}</h2>
              
              <div className="space-y-8 my-8">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <ShieldAlert className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_essential')}</h3>
                    <p className="text-slate-500 text-base mt-2 m-0">{t('types_essential_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_analytics')}</h3>
                    <p className="text-slate-500 text-base mt-2 m-0">{t('types_analytics_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1">
                    <Cookie className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_marketing')}</h3>
                    <p className="text-slate-500 text-base mt-2 m-0">{t('types_marketing_desc')}</p>
                  </div>
                </div>
              </div>

              <h2 id="consentimiento" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('consent_title')}</h2>
              <p>{t('consent_desc')}</p>

              <div className="my-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-start gap-4">
                <Button 
                  onClick={handleManagePreferences}
                  className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl"
                >
                  {t('manage_btn')}
                </Button>
              </div>

              <h2 id="terceros" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('thirdparty_title')}</h2>
              <p>{t('thirdparty_desc')}</p>

              <h2 id="contacto" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('contact_title')}</h2>
              <p>{t('contact_desc')}</p>
              
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm">
                <a href={`mailto:${t('contact_link')}`} className="text-medical-600 dark:text-medical-400 font-medium hover:underline">
                  {t('contact_link')}
                </a>
              </div>
            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}
