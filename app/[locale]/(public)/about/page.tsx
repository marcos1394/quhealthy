"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Sparkles, Compass, Fingerprint, Earth, BadgeCheck, UserRound } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-medical-50/50 via-white to-white dark:from-medical-900/20 dark:via-slate-950 dark:to-slate-950 -z-10" />
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
            <Link href="/" className="hover:underline">QuHealthy</Link>
            <ArrowRight className="w-4 h-4" />
            <span>{t('breadcrumb')}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            {t('title_light')} <span className="text-medical-600 dark:text-medical-400 italic font-serif">{t('title_highlight')}</span> {t('title_dark')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Stats Section — only renders once real data has loaded. Never shows
          placeholder or fabricated numbers; hides itself if the backend
          endpoint isn't available yet. */}
      {!statsLoading && statCards.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-12">
              {t('stats_section_title')}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {statCards.map((stat, idx) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-8">{t('mission_title')}</h2>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">{t('mission_desc')}</p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">{t('values_title')}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
              {t('values_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-10">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col gap-6 p-8 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-950 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{val.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{val.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Security Section — every claim here links to a real,
          published policy. This is the "enterprise-grade" section: built
          on what already exists, not on borrowed certifications. */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">{t('trust_title')}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
              {t('trust_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trustPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-300 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{pillar.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{pillar.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm font-medium">
            <Link href="/privacy" className="text-medical-600 dark:text-medical-400 hover:underline">
              {t('trust_cta_privacy')}
            </Link>
            <Link href="/cookies" className="text-medical-600 dark:text-medical-400 hover:underline">
              {t('trust_cta_cookies')}
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">{t('team_title')}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
              {t('team_subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Founder card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-slate-800 dark:bg-slate-800 text-white flex items-center justify-center text-lg font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserRound className="w-7 h-7 text-slate-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('team_founder_name')}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{t('team_founder_role')}</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{t('team_founder_bio')}</p>
            </div>

            {/* Partner 1: Fausto Acuña */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-slate-700 dark:bg-slate-800 text-white flex items-center justify-center text-lg font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserRound className="w-7 h-7 text-slate-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('team_partner_fausto_name')}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{t('team_partner_fausto_role')}</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{t('team_partner_fausto_bio')}</p>
            </div>

            {/* Partner 2: Pedro Ordoñez */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-slate-700 dark:bg-slate-800 text-white flex items-center justify-center text-lg font-semibold mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserRound className="w-7 h-7 text-slate-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('team_partner_pedro_name')}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{t('team_partner_pedro_role')}</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{t('team_partner_pedro_bio')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 md:py-32 bg-slate-900 dark:bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white dark:text-slate-900 mb-6">{t('cta_title')}</h2>
          <p className="text-lg text-slate-300 dark:text-slate-600 font-light mb-10 max-w-2xl mx-auto">{t('cta_desc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* TODO: point these at your real provider-signup and contact routes */}
            <Link
              href="/provider/register"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cta_provider_btn')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-slate-700 dark:border-slate-300 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              {t('cta_contact_btn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}