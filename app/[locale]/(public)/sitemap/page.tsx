"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ArrowUpRight, 
  Map, 
  Layers, 
  Building2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function SitemapPage() {
  const t = useTranslations("Legal.Sitemap");
  const footerT = useTranslations("Footer.columns");

  const links = [
    {
      title: t("categories.platform", { defaultValue: "Plataforma" }),
      icon: Layers,
      items: [
        { name: footerT("platform.links.discover", { defaultValue: "Descubrir Servicios" }), href: "/discover" },
        { name: footerT("platform.links.market", { defaultValue: "Marketplace Médico" }), href: "/market" },
        { name: footerT("platform.links.academy", { defaultValue: "Academia Médica" }), href: "/academy" },
        { name: footerT("platform.links.doctors", { defaultValue: "Para Profesionales" }), href: "/business" },
      ],
    },
    {
      title: t("categories.company", { defaultValue: "Institución" }),
      icon: Building2,
      items: [
        { name: footerT("company.links.about", { defaultValue: "Acerca de Nosotros" }), href: "/about" },
        { name: footerT("company.links.blog", { defaultValue: "Blog & Editorial" }), href: "/blog" },
        { name: footerT("company.links.careers", { defaultValue: "Carreras & Talento" }), href: "/careers" },
        { name: footerT("company.links.contact", { defaultValue: "Contacto Directo" }), href: "/contact" },
      ],
    },
    {
      title: t("categories.legal", { defaultValue: "Legal & Normativa" }),
      icon: ShieldCheck,
      items: [
        { name: footerT("legal.links.terms", { defaultValue: "Términos del Servicio" }), href: "/terms" },
        { name: footerT("legal.links.privacy", { defaultValue: "Aviso de Privacidad" }), href: "/privacy" },
        { name: footerT("legal.links.cookies", { defaultValue: "Política de Cookies" }), href: "/cookies" },
        { name: "Mapa del Sitio (Sitemap)", href: "/sitemap" },
      ],
    },
  ];

  // Variantes de animación para la entrada en cascada
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                Sitemap
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <Map className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Navegación e Índice General</span>
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                {t("title", { defaultValue: "Mapa del Sitio Web" })}
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed pt-1">
                {t("description", { defaultValue: "Explora la estructura completa de páginas, servicios, recursos institucionales y avisos legales de QuHealthy." })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTENIDO DEL SITEMAP ─────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {links.map((category, idx) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-6">
                    {/* Header Categoría */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                        <CategoryIcon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h2>
                    </div>

                    {/* Enlaces de la Categoría */}
                    <ul className="space-y-2">
                      {category.items.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="group/link flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all"
                          >
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors">
                              {link.name}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all shrink-0" strokeWidth={2} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

    </div>
  );
}