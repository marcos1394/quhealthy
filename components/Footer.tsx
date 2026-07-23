"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, MapPin, Heart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: t('columns.platform.title'),
      links: [
        { name: t('columns.platform.links.discover'), href: "/discover" },
        { name: t('columns.platform.links.market'), href: "/market" },
        { name: t('columns.platform.links.academy'), href: "/academy" },
        { name: t('columns.platform.links.doctors'), href: "/business" },
        { name: t('columns.platform.links.intelligence'), href: "/intelligence" },
        { name: t('columns.platform.links.quscore'), href: "/como-funciona-el-quscore" }
      ]
    },
    {
      title: t('columns.company.title'),
      links: [
        { name: t('columns.company.links.about'), href: "/about" },
        { name: t('columns.company.links.blog'), href: "/blog" },
        { name: t('columns.company.links.careers'), href: "/careers" },
        { name: t('columns.company.links.contact'), href: "/contact" }
      ]
    },
    {
      title: t('columns.legal.title'),
      links: [
        { name: t('columns.legal.links.terms'), href: "/terms" },
        { name: t('columns.legal.links.privacy'), href: "/privacy" },
        { name: t('columns.legal.links.cookies'), href: "/cookies" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/quhealthyorg/", name: "Instagram" },
    { icon: Twitter, href: "https://x.com/suimcafee", name: "X (Twitter)" },
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61590877116503", name: "Facebook" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@quhealthy", name: "TikTok" }
  ];

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] text-gray-500 dark:text-gray-400 pt-20 pb-12 transition-colors duration-500 border-t border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">

      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-12 gap-x-8">

          {/* ── COLUMNA 1: MARCA Y PROPUESTA DE VALOR ───────────────────── */}
          <div className="md:col-span-2 lg:col-span-2 space-y-5 pr-0 lg:pr-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              <Link href="/" className="inline-flex items-center gap-1 group">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  QuHealthy
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">.</span>
              </Link>

              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                {t('brand_description')}
              </p>

              {/* Botones de Redes Sociales */}
              <div className="pt-2 flex items-center gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all duration-300 shadow-2xs"
                      aria-label={`Visítanos en ${social.name}`}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── COLUMNAS DE NAVEGACIÓN ───────────────────────────────────── */}
          {footerLinks.map((column, columnIndex) => (
            <div key={column.title} className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: columnIndex * 0.08, ease: "easeOut" }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          {/* ── COLUMNA DE CONTACTO Y UBICACIÓN ─────────────────────────── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t('contact.title')}
              </h3>

              <ul className="space-y-3 text-xs font-semibold">
                <li>
                  <a 
                    href="mailto:founders@quhealthy.org" 
                    className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Mail size={14} strokeWidth={2} />
                    </div>
                    <span className="truncate">founders@quhealthy.org</span>
                  </a>
                </li>

                <li className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                    <MapPin size={14} strokeWidth={2} />
                  </div>
                  <span>Los Mochis, Sinaloa, México</span>
                </li>
              </ul>
            </motion.div>
          </div>

        </div>

        {/* ── FOOTER INFERIOR / COPYRIGHT ─────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            
            {/* Información Legal Corta */}
            <div className="text-xs font-medium text-gray-400">
              <p>
                &copy; {currentYear} <strong className="text-gray-700 dark:text-gray-200">QUHEALTHY</strong>. Todos los derechos reservados.
                <span className="hidden md:inline mx-2">•</span>
                <span className="block md:inline mt-1 md:mt-0">
                  Operado por Marcos Sandoval Ruiz.
                </span>
              </p>
            </div>

            {/* Enlaces Legales Rápidos */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400">
              <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {t('copyright.links.privacy')}
              </Link>
              <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {t('copyright.links.terms')}
              </Link>
              <button 
                type="button"
                onClick={() => window.dispatchEvent(new Event("open_cookie_preferences"))}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Preferencias de Cookies
              </button>
            </div>

          </div>

          {/* Sello de Elaboración */}
          <div className="mt-6 flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-semibold text-gray-400">
            <span>{t('copyright.made_with')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{t('copyright.in')}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;