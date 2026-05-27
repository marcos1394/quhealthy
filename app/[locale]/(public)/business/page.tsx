"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Activity, Calendar, ShieldCheck, CreditCard, Laptop, HeartPulse, Workflow, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function BusinessPage() {
  const t = useTranslations("PublicBusiness");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-medical-50/50 via-white to-white dark:from-medical-900/20 dark:via-slate-950 dark:to-slate-950 -z-10" />
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
                <Link href="/" className="hover:underline">QuHealthy</Link>
                <ChevronRight className="w-4 h-4" />
                <span>{t('breadcrumb')}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                {t('title_light')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500 italic font-serif">{t('title_highlight')}</span>{t('title_dark')}
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-10">
                {t('subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-14 px-8 text-base font-semibold shadow-lg hover:shadow-medical-600/25 transition-all">
                  {t('cta_primary')}
                </Button>
                <Button variant="outline" className="rounded-xl h-14 px-8 text-base font-semibold border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900">
                  {t('cta_secondary')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Dashboard Mockup (Hero Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl overflow-hidden aspect-[4/3] w-full group">
                <div className="absolute top-0 inset-x-0 h-10 bg-slate-800/50 flex items-center px-4 gap-2 border-b border-slate-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mt-10 h-full w-full bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col gap-4">
                  {/* Fake UI Elements */}
                  <div className="flex gap-4">
                    <div className="w-1/3 h-24 bg-slate-800/50 rounded-lg border border-slate-700/30 animate-pulse"></div>
                    <div className="w-1/3 h-24 bg-medical-900/20 rounded-lg border border-medical-800/30 animate-pulse"></div>
                    <div className="w-1/3 h-24 bg-slate-800/50 rounded-lg border border-slate-700/30 animate-pulse"></div>
                  </div>
                  <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/30"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4">{t('bento_title')}</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light">{t('bento_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 (Large) */}
            <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="w-12 h-12 rounded-xl bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">{t('bento.f1_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{t('bento.f1_desc')}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mb-6">
                <Laptop className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('bento.f2_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{t('bento.f2_desc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('bento.f3_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{t('bento.f3_desc')}</p>
            </div>

            {/* Feature 4 (Wide) */}
            <div className="md:col-span-2 bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">{t('bento.f4_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{t('bento.f4_desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4">{t('pricing_title')}</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Basic Plan */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 bg-slate-50 dark:bg-slate-900 flex flex-col">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('pricing.basic_title')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{t('pricing.basic_price')}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">{t('pricing.basic_period')}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-light mb-8 flex-1">{t('pricing.basic_desc')}</p>
              <Button variant="outline" className="w-full rounded-xl h-12 border-slate-300 dark:border-slate-700">{t('pricing.basic_btn')}</Button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-medical-500 dark:border-medical-500 rounded-[2rem] p-8 bg-white dark:bg-slate-950 flex flex-col relative shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-medical-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                Más Popular
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('pricing.pro_title')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{t('pricing.pro_price')}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">{t('pricing.pro_period')}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-light mb-8 flex-1">{t('pricing.pro_desc')}</p>
              <Button className="w-full bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-12">{t('pricing.pro_btn')}</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 bg-slate-50 dark:bg-slate-900 flex flex-col">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('pricing.ent_title')}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{t('pricing.ent_price')}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-light mb-8 flex-1">{t('pricing.ent_desc')}</p>
              <Button variant="outline" className="w-full rounded-xl h-12 border-slate-300 dark:border-slate-700">{t('pricing.ent_btn')}</Button>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}
