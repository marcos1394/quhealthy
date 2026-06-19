"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("PublicTerms");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t('intro_title') },
    { id: "use", title: t('use_title') },
    { id: "cancel", title: t('cancel_title') },
    { id: "privacy", title: t('privacy_title') },
    { id: "liability", title: t('liability_title') },
    { id: "governing_law", title: t('governing_law_title') },
    { id: "changes", title: t('changes_title') },
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
      // Activa el cambio cuando el título llega al 20% superior de la pantalla
      { rootMargin: "-20% 0px -80% 0px" } 
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [t]); // Se re-ejecuta si cambian las traducciones

  // UX Improvement: Smooth Scroll con compensación para un diseño más limpio
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Espacio de respiro superior al hacer click
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-medical-500/30 selection:text-medical-900">
      
      {/* Header: Alto contraste, tipografía limpia y minimalista */}
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
            <p className="text-base text-gray-500 dark:text-gray-400 font-normal">
              {t('date')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Sidebar Navigation: Navegación pegajosa con indicadores activos */}
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
                      {/* Línea indicadora activa (alto contraste) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSectionIndicator"
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
                         prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-light"
            >
              <h2 id="intro" className="text-2xl mt-0 mb-6 scroll-mt-32">{t('intro_title')}</h2>
              <p>{t('intro_desc')}</p>

              <h2 id="use" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('use_title')}</h2>
              <p>{t('use_desc')}</p>

              <h2 id="cancel" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('cancel_title')}</h2>
              <p>{t('cancel_desc')}</p>

              <h2 id="privacy" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('privacy_title')}</h2>
              <p>
                {t('privacy_desc')}{' '}
                <Link 
                  href="/privacy" 
                  className="inline-flex items-center gap-1 text-black dark:text-white font-medium border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors no-underline"
                >
                  {t('privacy_link')} <ArrowRight className="w-3 h-3" />
                </Link>
              </p>

              <h2 id="liability" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('liability_title')}</h2>
              <p>{t('liability_desc')}</p>

              <h2 id="governing_law" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('governing_law_title')}</h2>
              <p>{t('governing_law_desc')}</p>

              <h2 id="changes" className="text-2xl mt-16 mb-6 scroll-mt-32">{t('changes_title')}</h2>
              <p>{t('changes_desc')}</p>
              
              {/* Footer Section */}
              <div className="mt-24 pt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 m-0">
                  {t('contact')}
                </p>
              </div>
            </motion.article>

          </div>
        </div>
      </section>
    </div>
  );
}