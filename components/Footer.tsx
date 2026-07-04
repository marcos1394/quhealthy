"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */;

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useTranslations } from "next-intl";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
 <footer className="bg-white dark:bg-[#0a0a0a] text-gray-500 dark:text-gray-400 pt-24 pb-12 transition-colors duration-300 border-t border-gray-200 dark:border-gray-800 selection:bg-gray-200 dark:selection:bg-white/20">

 <div className="container mx-auto px-6 md:px-12 xl:px-24">
 <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-y-16 gap-x-8">

 {/* Columna 1: Marca y Propuesta */}
 <div className="md:col-span-4 lg:col-span-2 space-y-8 pr-0 lg:pr-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 >
 <Link href="/" className="inline-block group mb-6">
 <span className="text-3xl font-serif italic tracking-tight text-black dark:text-white">
 QuHealthy.
 </span>
 </Link>
 <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm font-light">
 {t('brand_description')}
 </p>

 <div className="mt-8 flex items-center gap-2">
 {socialLinks.map((social) => {
 const Icon = social.icon;
 return (
 <a
 key={social.name}
 href={social.href}
 target="_blank"
 rel="noopener noreferrer"
 className="w-10 h-10 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors duration-300"
 aria-label={`Visítanos en ${social.name}`}
 >
 <Icon size={16} strokeWidth={1.5} />
 </a>
 );
 })}
 </div>
 </motion.div>
 </div>

 {/* Columnas de Enlaces (Arquitectura limpia) */}
 {footerLinks.map((column, columnIndex) => (
 <div key={column.title} className="lg:col-span-1">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
 >
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-8">
 {column.title}
 </h3>
 <ul className="space-y-4">
 {column.links.map((link) => (
 <li key={link.name}>
 <Link
 href={link.href}
 className="text-sm font-light hover:text-black dark:hover:text-white transition-colors"
 >
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
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-8">
 {t('contact.title')}
 </h3>
 <ul className="space-y-6 text-sm font-light">
 <li>
 <a href="mailto:founders@quhealthy.org" className="flex items-center gap-4 hover:text-black dark:hover:text-white transition-colors group">
 <div className="w-8 h-8 border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition-colors">
 <Mail size={14} />
 </div>
 <span>founders@quhealthy.org</span>
 </a>
 </li>

 <li className="flex items-center gap-4 group">
 <div className="w-8 h-8 border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-colors">
 <MapPin size={14} />
 </div>
 <span>Los Mochis, Sinaloa, México</span>
 </li>
 </ul>
 </motion.div>
 </div>
 </div>

 {/* Blueprint Footer / Copyright */}
 <div className="mt-24 pt-8 border-t border-gray-200 dark:border-gray-800">
 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
 
 <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
 &copy; {currentYear} QUHEALTHY.
 <span className="hidden md:inline mx-2">|</span>
 <span className="block md:inline mt-1 md:mt-0 font-light tracking-normal lowercase">
 Operado por Marcos Sandoval Ruiz.
 </span>
 </p>
 </div>

 <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
 <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
 {t('copyright.links.privacy')}
 </Link>
 <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
 {t('copyright.links.terms')}
 </Link>
 <button 
 onClick={() => window.dispatchEvent(new Event("open_cookie_preferences"))}
 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
 >
 Cookies
 </button>
 </div>

 </div>

 <div className="mt-8 flex items-center justify-center md:justify-start gap-2">
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
 {t('copyright.made_with')}
 </span>
 <Heart className="w-3 h-3 text-black dark:text-white fill-current" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
 {t('copyright.in')}
 </span>
 </div>
 </div>
 </div>
 </footer>
 );
};

export default Footer;