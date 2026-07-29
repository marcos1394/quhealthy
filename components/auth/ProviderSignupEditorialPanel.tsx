"use client";

import React from "react";
import Image from "next/image";
import { Check, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProviderSignupEditorialPanel() {
  const t = useTranslations("AuthSignupProvider");
  const benefits = [t("benefits.0"), t("benefits.1"), t("benefits.2")];

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 border-r border-gray-800 flex-col overflow-hidden font-sans select-none">
      <Image
        height={800}
        width={800}
        src="/hero_medical_lifestyle.png"
        alt="QuHealthy Provider Sign Up"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
        priority
      />

      {/* Soft Health Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

      <div className="relative z-10 p-12 xl:p-16 mt-auto space-y-8">
        <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-[1.2]">
          {t("area_title")}
        </h2>

        <div className="space-y-3.5">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-gray-200 font-medium text-xs sm:text-sm leading-relaxed"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 max-w-md">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 shadow-xs">
              <Shield className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-1">
              <p className="text-white text-[10px] font-bold uppercase tracking-wider">
                {t("secure_connection")}
              </p>
              <p className="text-gray-300 text-xs font-medium leading-relaxed">
                {t("secure_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}