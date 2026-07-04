"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/js-hoist-intl */
/* eslint-disable react-doctor/no-giant-component */;
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Sparkles, Compass, Fingerprint, Earth, BadgeCheck, UserRound, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePublicStats } from "@/hooks/usePublicStats";

export default function AboutPage() {
 const t = useTranslations("PublicAbout");
 const locale = useLocale();

 const { stats, isLoading: statsLoading } = usePublicStats();

 const numberFormatter = new Intl.NumberFormat(locale);

 const rawStats: { key: string; value: number; label: string; isRating?: boolean }[] = [];
 if (stats?.patients != null) rawStats.push({ key: "patients", value: stats.patients, label: t("stats.patients") });
 if (stats?.professionals != null) rawStats.push({ key: "professionals", value: stats.professionals, label: t("stats.professionals") });

 const statCards = rawStats.map((s) => ({
 key: s.key,
 label: s.label,
 value: s.isRating ? `${s.value.toFixed(1)} ★` : numberFormatter.format(s.value),
 }));

 const values = [
 { icon: HeartHandshake, title: t("values.v1_title"), description: t("values.v1_desc") },
 { icon: Sparkles, title: t("values.v2_title"), description: t("values.v2_desc") },
 { icon: Compass, title: t("values.v3_title"), description: t("values.v3_desc") },
 ];

 const trustPillars = [
 { icon: Fingerprint, title: t("trust.t1_title"), description: t("trust.t1_desc") },
 { icon: Earth, title: t("trust.t2_title"), description: t("trust.t2_desc") },
 { icon: BadgeCheck, title: t("trust.t3_title"), description: t("trust.t3_desc") },
 ];

 // Variantes de animación
 const containerVariants = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: { staggerChildren: 0.1 }
 }
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
 };

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
 
 {/* Hero Section Editorial */}
 <section className="pt-32 pb-20 md:pt-40 md:pb-24 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 >
 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
 <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
 <ChevronRight className="w-3 h-3" />
 <span className="text-black dark:text-white">{t('breadcrumb')}</span>
 </div>
 
 <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-8 leading-[1.1] max-w-5xl">
 {t('title_light')}
 <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light px-2">
 {t('title_highlight')}
 </span>
 {t('title_dark')}
 </h1>
 
 <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-light max-w-3xl leading-relaxed">
 {t('subtitle')}
 </p>
 </motion.div>
 </div>
 </section>

 {/* Stats Section — Tipografía Masiva (Estilo Periódico) */}
 {!statsLoading && statCards.length > 0 && (
 <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a]">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl">
 <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-12 flex items-center gap-4">
 <span>{t('stats_section_title')}</span>
 <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
 </div>
 
 <motion.div 
 variants={containerVariants}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, margin: "-100px" }}
 className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16"
 >
 {statCards.map((stat) => (
 <motion.div key={stat.key} variants={itemVariants} className="flex flex-col">
 <div className="text-5xl md:text-6xl lg:text-7xl font-semibold text-black dark:text-white tracking-tighter mb-4">
 {stat.value}
 </div>
 <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
 {stat.label}
 </div>
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>
 )}

 {/* Mission Section (Statement) */}
 <section className="py-24 md:py-32 bg-gray-50/50 dark:bg-gray-900/20 border-y border-gray-200 dark:border-white/10">
 <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 >
 <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">Nuestro Manifiesto</h2>
 <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-black dark:text-white mb-8 leading-[1.2]">
 {t('mission_title')}
 </h3>
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
 {t('mission_desc')}
 </p>
 </motion.div>
 </div>
 </section>

 {/* Values Section (Arquitectónico a Corte Vivo) */}
 <section className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a]">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl">
 <div className="mb-20 md:w-2/3">
 <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white mb-6">
 {t('values_title')}
 </h2>
 <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
 {t('values_subtitle')}
 </p>
 </div>

 <motion.div 
 variants={containerVariants}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, margin: "-100px" }}
 className="grid md:grid-cols-3 gap-12 lg:gap-16"
 >
 {values.map((val, idx) => {
 const Icon = val.icon;
 return (
 <motion.div
 key={idx}
 variants={itemVariants}
 className="border-t border-black dark:border-white pt-8 group"
 >
 <Icon className="w-8 h-8 text-black dark:text-white mb-8 opacity-50 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1.5} />
 <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
 {val.title}
 </h3>
 <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light">
 {val.description}
 </p>
 </motion.div>
 );
 })}
 </motion.div>
 </div>
 </section>

 {/* Trust & Security Section */}
 <section className="py-24 md:py-32 bg-gray-50/50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl">
 <div className="mb-20 md:w-2/3">
 <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white mb-6">
 {t('trust_title')}
 </h2>
 <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
 {t('trust_subtitle')}
 </p>
 </div>

 <motion.div 
 variants={containerVariants}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, margin: "-100px" }}
 className="grid md:grid-cols-3 gap-12 lg:gap-16 border-b border-gray-200 dark:border-gray-800 pb-20"
 >
 {trustPillars.map((pillar, idx) => {
 const Icon = pillar.icon;
 return (
 <motion.div
 key={idx}
 variants={itemVariants}
 className="flex flex-col group"
 >
 <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center mb-8 group-hover:border-black dark:group-hover:border-white transition-colors duration-300">
 <Icon className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-4">
 {pillar.title}
 </h3>
 <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-sm">
 {pillar.description}
 </p>
 </motion.div>
 );
 })}
 </motion.div>

 {/* Legal Links */}
 <div className="flex flex-wrap items-center gap-8 mt-10">
 <Link 
 href="/privacy" 
 className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
 >
 {t('trust_cta_privacy')}
 <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
 </Link>
 <Link 
 href="/cookies" 
 className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
 >
 {t('trust_cta_cookies')}
 <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
 </Link>
 </div>
 </div>
 </section>

 {/* Team Section */}
 <section className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl">
 <div className="mb-20">
 <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white mb-6">
 {t('team_title')}
 </h2>
 <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl">
 {t('team_subtitle')}
 </p>
 </div>

 <motion.div 
 variants={containerVariants}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, margin: "-100px" }}
 className="grid md:grid-cols-3 gap-16"
 >
 {/* Founder card */}
 <motion.div variants={itemVariants} className="group">
 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-8 border border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors duration-300">
 <UserRound className="w-6 h-6 text-black dark:text-white" strokeWidth={1} />
 </div>
 <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">{t('team_founder_name')}</h3>
 <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">{t('team_founder_role')}</p>
 <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-sm">{t('team_founder_bio')}</p>
 </motion.div>

 {/* Partner 1 */}
 <motion.div variants={itemVariants} className="group">
 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-8 border border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors duration-300">
 <UserRound className="w-6 h-6 text-black dark:text-white" strokeWidth={1} />
 </div>
 <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">{t('team_partner_fausto_name')}</h3>
 <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">{t('team_partner_fausto_role')}</p>
 <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-sm">{t('team_partner_fausto_bio')}</p>
 </motion.div>

 {/* Partner 2 */}
 <motion.div variants={itemVariants} className="group">
 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-8 border border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors duration-300">
 <UserRound className="w-6 h-6 text-black dark:text-white" strokeWidth={1} />
 </div>
 <h3 className="text-2xl font-semibold text-black dark:text-white mb-2">{t('team_partner_pedro_name')}</h3>
 <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">{t('team_partner_pedro_role')}</p>
 <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-sm">{t('team_partner_pedro_bio')}</p>
 </motion.div>
 </motion.div>
 </div>
 </section>

 {/* Closing CTA (Alto Contraste) */}
 <section className="py-24 md:py-32 bg-black dark:bg-white selection:bg-white/30 dark:selection:bg-black/30">
 <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
 <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white dark:text-black mb-8 leading-[1.1]">
 {t('cta_title')}
 </h2>
 <p className="text-lg md:text-xl text-gray-400 dark:text-gray-600 font-light mb-12 max-w-2xl mx-auto">
 {t('cta_desc')}
 </p>
 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
 <Link
 href="/provider/register"
 className="group inline-flex items-center justify-center bg-white dark:bg-black text-black dark:text-white px-8 h-14 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
 >
 {t('cta_provider_btn')} 
 <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
 </Link>
 <Link
 href="/contact"
 className="group inline-flex items-center justify-center border border-white/30 dark:border-black/30 text-white dark:text-black px-8 h-14 rounded-none text-xs font-bold uppercase tracking-widest hover:border-white dark:hover:border-black transition-colors"
 >
 {t('cta_contact_btn')}
 </Link>
 </div>
 </div>
 </section>
 
 </div>
 );
}