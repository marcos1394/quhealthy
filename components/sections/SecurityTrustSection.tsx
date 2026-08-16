"use client";

import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Award, 
  Server, 
  UserCheck, 
  CheckCircle2, 
  EyeOff,
  Building2
} from "lucide-react";
import { useTranslations } from "next-intl";

export const SecurityTrustSection: React.FC = () => {
  const t = useTranslations("SecurityTrust");

  const pillars = [
    {
      icon: FileCheck,
      title: t("pillars.nom.title"),
      subtitle: t("pillars.nom.subtitle"),
      desc: t("pillars.nom.desc"),
      badge: "NOM-004 / NOM-024",
    },
    {
      icon: Award,
      title: t("pillars.cofepris.title"),
      subtitle: t("pillars.cofepris.subtitle"),
      desc: t("pillars.cofepris.desc"),
      badge: "COFEPRIS",
    },
    {
      icon: UserCheck,
      title: t("pillars.sep.title"),
      subtitle: t("pillars.sep.subtitle"),
      desc: t("pillars.sep.desc"),
      badge: "Cédula SEP",
    },
    {
      icon: Lock,
      title: t("pillars.encryption.title"),
      subtitle: t("pillars.encryption.subtitle"),
      desc: t("pillars.encryption.desc"),
      badge: "AES-256 E2E",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#080808] border-b border-gray-100 dark:border-gray-800 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────────── */}
        <div className="max-w-3xl mb-14 md:mb-18 mx-auto text-center flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t("title_start")}{" "}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl mx-auto pt-1">
            {t("description")}
          </p>
        </div>

        {/* ── GRILLA DE 4 PILARES NORMATIVOS ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-gray-50/70 dark:bg-[#0c0c0c] border border-gray-100 dark:border-gray-800 flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all shadow-xs group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                      {pillar.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium pt-1">
                      {pillar.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200/50 dark:border-gray-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certificación 100% Activa</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BANNER DE PROTECCIÓN DE DATOS PERSONALES (LFPDPPP) ─────────── */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/5 border border-emerald-200/50 dark:border-emerald-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <EyeOff className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("privacy_banner.title")}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl font-medium leading-relaxed">
                {t("privacy_banner.desc")}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111] text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-800 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>INAI / LFPDPPP Cumplido</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
