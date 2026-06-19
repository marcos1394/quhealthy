"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck, Lock, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("PublicPrivacy");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t('s1_title') },
    { id: "data", title: t('s2_title') },
    { id: "usage", title: t('s3_title') },
    { id: "sharing", title: t('s4_title') },
    { id: "security", title: t('s5_title') },
    { id: "transfers", title: t('s6_title') },
    { id: "rights", title: t('s7_title') },
    { id: "minors", title: t('s8_title') },
  ];

  // UX Improvement: ScrollSpy (Detecta qué sección está en pantalla)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" } 
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [t]);

  // UX Improvement: Smooth Scroll con compensación
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-medical-500/30 selection:text-medical-900">
      
      {/* Header: Alto contraste y tipografía limpia */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
              <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black dark:text-white">{t('breadcrumb')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-3xl leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges: Rediseñadas al estilo editorial (Líneas finas, sin cajas pesadas) */}
      <section className="border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl py-12 md:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            <div className="border-t border-black dark:border-white pt-6">
              <ShieldCheck className="w-6 h-6 text-black dark:text-white mb-5" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-3">
                {t('badges.b1_title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">
                {t('badges.b1_desc')}
              </p>
            </div>
            <div className="border-t border-black dark:border-white pt-6">
              <Lock className="w-6 h-6 text-black dark:text-white mb-5" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-3">
                {t('badges.b2_title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">
                {t('badges.b2_desc')}
              </p>
            </div>
            <div className="border-t border-black dark:border-white pt-6">
              <EyeOff className="w-6 h-6 text-black dark:text-white mb-5" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-3">
                {t('badges.b3_title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">
                {t('badges.b3_desc')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Sidebar Navigation: ScrollSpy Activo */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-64 shrink-0 md:sticky md:top-32"
            >
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">
                {t('toc')}
              </h3>
              <nav className="flex flex-col space-y-1 relative border-l border-gray-200 dark:border-gray-800">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a 
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`relative pl-5 py-2 text-sm transition-all duration-300 ${
                        isActive 
                          ? "text-black dark:text-white font-medium" 
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-normal"
                      }`}
                    >
                      {/* Indicador activo animado */}
                      {isActive && (
                        <motion.div
                          layoutId="activePrivacySection"
                          className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-black dark:bg-white"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {sec.title}
                    </a>
                  );
                })}
              </nav>
            </motion.aside>

            {/* Document Body: Jerarquía tipográfica mejorada */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 prose prose-gray dark:prose-invert prose-lg max-w-none 
                         prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white 
                         prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-light
                         prose-strong:text-black dark:prose-strong:text-white prose-strong:font-medium
                         prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-ul:font-light prose-li:marker:text-black dark:prose-li:marker:text-white"
            >
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-16 font-light leading-relaxed">
                {t('intro')}
              </p>

              <h2 id="intro" className="text-2xl mt-0 mb-6 scroll-mt-32">{t('s1_title')}</h2>
              <p>{t('s1_desc')}</p>

              <h2 id="data" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s2_title')}</h2>
              <p>{t('s2_desc')}</p>
              <ul className="space-y-3 mt-6">
                <li><strong>{t('s2_l1').split(':')[0]}:</strong> {t('s2_l1').split(':').slice(1).join(':')}</li>
                <li><strong>{t('s2_l2').split(':')[0]}:</strong> {t('s2_l2').split(':').slice(1).join(':')}</li>
                <li><strong>{t('s2_l3').split(':')[0]}:</strong> {t('s2_l3').split(':').slice(1).join(':')}</li>
              </ul>

              <h2 id="usage" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s3_title')}</h2>
              <p>{t('s3_desc')}</p>

              <h2 id="sharing" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s4_title')}</h2>
              <p>{t('s4_desc')}</p>

              <h2 id="security" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s5_title')}</h2>
              <p>{t('s5_desc')}</p>

              <h2 id="transfers" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s6_title')}</h2>
              <p>{t('s6_desc')}</p>

              <h2 id="rights" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s7_title')}</h2>
              <p>{t('s7_desc')}</p>
              <ul className="space-y-3 mt-6">
                <li>{t('s7_l1')}</li>
                <li>{t('s7_l2')}</li>
                <li>{t('s7_l3')}</li>
                <li>{t('s7_l4')}</li>
              </ul>
              <p className="mt-6 italic text-gray-500 dark:text-gray-400">{t('s7_note')}</p>

              <h2 id="minors" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('s8_title')}</h2>
              <p>{t('s8_desc')}</p>
              
              {/* Footer Section: Limpio y profesional */}
              <div className="mt-24 pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 m-0 flex items-start gap-3">
                  <span className="block">{t('contact')}</span>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-1 text-black dark:text-white font-medium border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors no-underline"
                  >
                    Contactar soporte <ArrowRight className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            </motion.article>

          </div>
        </div>
      </section>
    </div>
  );
}