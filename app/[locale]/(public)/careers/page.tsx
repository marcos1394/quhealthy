"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */;
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Briefcase, Laptop, HeartPulse, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

// Interfaz esperada del backend
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  tag?: string;
  applyUrl?: string;
}

const fetcher = (url: string) => axiosInstance.get<JobOpening[]>(url).then(res => res.data);
const CAREERS_EMAIL = "careers@quhealthy.com";

function buildMailto(subject: string) {
  return `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function CareersPage() {
  const t = useTranslations("PublicCareers");
  const { data: jobOpenings, isLoading, error, mutate } = useSWR<JobOpening[]>(
    "/api/careers/openings",
    fetcher,
    { revalidateOnFocus: false }
  );

  const benefits = [
    { icon: Laptop, title: t('benefits.b1_title'), desc: t('benefits.b1_desc') },
    { icon: HeartPulse, title: t('benefits.b2_title'), desc: t('benefits.b2_desc') },
    { icon: Briefcase, title: t('benefits.b3_title'), desc: t('benefits.b3_desc') }
  ];

  const handleApply = (job: JobOpening) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = buildMailto(`${t('apply')}: ${job.title}`);
    }
  };

  const handleOpenApplication = () => {
    window.location.href = buildMailto(t('open_app_title'));
  };

  // Variantes de animación
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* Hero Section Editorial */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
              <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer">QuHealthy</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black dark:text-white">{t('breadcrumb')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-8 leading-[1.1]">
              {t('title_light')}
              {/* Contraste tipográfico: Serif + Cursiva para un look de revista */}
              <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light px-2">
                {t('title_highlight')}
              </span>
              {t('title_dark')}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl leading-relaxed mb-12">
              {t('subtitle')}
            </p>
            
            <Button
              onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-8 text-xs font-bold uppercase tracking-widest transition-all group"
            >
              {t('view_openings')} 
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Estilo "Trust Badges" limpios */}
      <section className="py-20 md:py-28 border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-4">
              {t('why_title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-light">
              {t('why_subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-black dark:border-white pt-6"
                >
                  <Icon className="w-6 h-6 text-black dark:text-white mb-6" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm font-light">
                    {benefit.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Openings Section - Directorio Minimalista */}
      <section id="openings" className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] scroll-mt-10">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight mb-2">
                {t('openings_title')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-light">
                {t('openings_subtitle')}
              </p>
            </div>
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {jobOpenings?.length || 0} Posiciones
            </div>
          </div>

          <div className="border-t border-black dark:border-white">
            {/* Loading State */}
            {isLoading && (
              <div className="py-16 text-center text-gray-400 dark:text-gray-500 font-light">
                <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                {t('loading')}
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="py-16 text-center">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{t('error_title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-light mb-6">{t('error_desc')}</p>
                <Button 
                  variant="outline" 
                  onClick={() => mutate()} 
                  className="rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black uppercase text-xs tracking-widest"
                >
                  {t('retry_btn')}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!jobOpenings || jobOpenings.length === 0) && (
              <div className="py-16 text-center">
                <Briefcase className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-4" strokeWidth={1} />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{t('empty_title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-light max-w-md mx-auto">
                  {t('empty_desc')}
                </p>
              </div>
            )}

            {/* Jobs List */}
            {!isLoading && !error && jobOpenings && (
              <motion.div variants={listVariants} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {jobOpenings.map((job, idx) => (
                  <motion.div 
                    variants={itemVariants}
                    key={job.id || idx}
                    onClick={() => handleApply(job)}
                    className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-2xl font-semibold text-black dark:text-white group-hover:underline decoration-1 underline-offset-4 transition-all">
                          {job.title}
                        </h3>
                        {job.tag && (
                          <span className="border border-black dark:border-white text-black dark:text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                            {job.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                        <span>{job.department}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:flex items-center text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('apply')} <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* General Application (Stark Minimalist Box) */}
          <div className="mt-24 border border-black dark:border-white p-10 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">{t('open_app_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-light max-w-xl">{t('open_app_desc')}</p>
            </div>
            <Button 
              onClick={handleOpenApplication} 
              className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-8 text-xs font-bold uppercase tracking-widest shrink-0 transition-all"
            >
              {t('open_app_btn')}
            </Button>
          </div>

          {/* EEO Statement */}
          <div className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-3xl font-light leading-relaxed">
              {t('eeo_statement')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}