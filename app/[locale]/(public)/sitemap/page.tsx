"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */;
import React from 'react';
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function SitemapPage() {
    const t = useTranslations('Legal.Sitemap');
    const footerT = useTranslations('Footer.columns');

    const links = [
        {
            title: t('categories.platform'),
            items: [
                { name: footerT('platform.links.discover'), href: "/discover" },
                { name: footerT('platform.links.market'), href: "/market" },
                { name: footerT('platform.links.academy'), href: "/academy" },
                { name: footerT('platform.links.doctors'), href: "/business" }
            ]
        },
        {
            title: t('categories.company'),
            items: [
                { name: footerT('company.links.about'), href: "/about" },
                { name: footerT('company.links.blog'), href: "/blog" },
                { name: footerT('company.links.careers'), href: "/careers" },
                { name: footerT('company.links.contact'), href: "/contact" }
            ]
        },
        {
            title: t('categories.legal'),
            items: [
                { name: footerT('legal.links.terms'), href: "/terms" },
                { name: footerT('legal.links.privacy'), href: "/privacy" },
                { name: footerT('legal.links.cookies'), href: "/cookies" },
                { name: "Sitemap", href: "/sitemap" }
            ]
        }
    ];

    // Variantes de animación para la entrada en cascada
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-medical-500/30 selection:text-medical-900">
            
            {/* Header: Alineado con el estilo editorial de TermsPage */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
                            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-black dark:text-white">Sitemap</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-tight text-center md:text-left">
                            {t('title')}
                        </h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-normal text-center md:text-left max-w-2xl">
                            {t('description')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content: Estructura arquitectónica limpia */}
            <section className="py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
                    >
                        {links.map((category, idx) => (
                            <motion.div key={idx} variants={itemVariants} className="flex flex-col">
                                {/* Encabezado de categoría minimalista */}
                                <div className="border-b border-black dark:border-white pb-4 mb-6">
                                    <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest">
                                        {category.title}
                                    </h2>
                                </div>
                                
                                {/* Lista de enlaces con microinteracciones refinadas */}
                                <ul className="space-y-1">
                                    {category.items.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="group flex items-center py-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300"
                                            >
                                                <span className="relative font-medium text-base">
                                                    {link.name}
                                                    {/* Línea animada inferior al hacer hover */}
                                                    <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></span>
                                                </span>
                                                <ArrowRight className="w-4 h-4 ml-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
            
        </div>
    );
}