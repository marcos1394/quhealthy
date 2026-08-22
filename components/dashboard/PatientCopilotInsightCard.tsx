"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BrainCircuit, Sparkles, ArrowRight } from "lucide-react";

export function PatientCopilotInsightCard() {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.CopilotInsight");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/90 via-teal-950/80 to-[#041d15] text-white p-6 sm:p-7 border border-emerald-500/30 shadow-lg backdrop-blur-xl font-sans select-none transition-all hover:shadow-xl hover:border-emerald-400/50 group">
      {/* ── Ambient Radial Glows ────────────────────────────────────── */}
      <div className="absolute top-0 right-1/4 -mt-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute bottom-0 right-0 -mb-10 w-40 h-40 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-400/20 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-6 h-6" strokeWidth={2.2} />
          </div>

          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>{t("title")}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-emerald-100/90 leading-relaxed pt-1">
              {t("desc")}
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => router.push("/copilot")}
            className="w-full md:w-auto h-11 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0 group-hover:scale-102"
          >
            <span>{t("cta")}</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
