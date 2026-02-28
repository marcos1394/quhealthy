"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useTranslations } from "next-intl";

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
        { name: t('columns.platform.links.doctors'), href: "/business" }
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
    { icon: Instagram, href: "https://instagram.com/quhealthy", name: "Instagram", color: "hover:text-pink-500 dark:hover:text-pink-400" },
    { icon: Twitter, href: "https://twitter.com/quhealthy", name: "Twitter", color: "hover:text-blue-500 dark:hover:text-blue-400" },
    { icon: Facebook, href: "https://facebook.com/quhealthy", name: "Facebook", color: "hover:text-blue-600 dark:hover:text-blue-500" }
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 font-sans transition-colors duration-300 border-t border-slate-200 dark:border-slate-800">

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-10">

          {/* Columna 1: Marca y Propuesta (Ocupa 4 espacios en MD y 2 en LG) */}
          <div className="md:col-span-4 lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="inline-block group">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-medical-600 via-teal-500 to-indigo-500 dark:from-medical-400 dark:via-teal-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  QuHealthy
                </span>
              </Link>
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm transition-colors duration-300">
                {t('brand_description')}
              </p>

              <div className="mt-6 flex items-center space-x-5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:border-gray-300 dark:hover:border-gray-700`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Visítanos en ${social.name}`}
                    >
                      <Icon size={18} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Columnas de Enlaces (Iteración limpia) */}
          {footerLinks.map((column, columnIndex) => (
            <div key={column.title} className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
              >
                <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6 transition-colors duration-300">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-medical-500 dark:hover:text-medical-400 transition-colors flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden bg-medical-500 h-[2px] mr-0 group-hover:mr-2"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          {/* Columna de Contacto */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6 transition-colors duration-300">
                {t('contact.title')}
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start group">
                  <div className="w-8 h-8 rounded-lg bg-medical-100 dark:bg-medical-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-medical-200 dark:group-hover:bg-medical-500/20 transition-colors duration-200">
                    <Mail size={16} className="text-medical-600 dark:text-medical-400 transition-colors" />
                  </div>
                  <a href="mailto:hola@quhealthy.com" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    hola@quhealthy.com
                  </a>
                </li>
                <li className="flex items-start group">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-500/20 transition-colors duration-200">
                    <Phone size={16} className="text-teal-600 dark:text-teal-400 transition-colors" />
                  </div>
                  <a href="tel:+525512345678" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    +52 (55) 1234 5678
                  </a>
                </li>
                <li className="flex items-start group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors duration-200">
                    <MapPin size={16} className="text-emerald-600 dark:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">{t('contact.location')}</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-900 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-600 gap-4">
            <div className="flex items-center gap-2">
              <p>{t('copyright.rights', { year: currentYear })}</p>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                {t('copyright.made_with')} <Heart className="w-3 h-3 text-red-500 fill-current" /> {t('copyright.in')}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">{t('copyright.links.privacy')}</Link>
              <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">{t('copyright.links.terms')}</Link>
              <Link href="/sitemap" className="hover:text-gray-700 dark:hover:text-gray-400 transition-colors">{t('copyright.links.sitemap')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;