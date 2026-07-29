"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuthEditorialPanelProps {
  userType: "consumer" | "provider";
}

export default function AuthEditorialPanel({
  userType,
}: AuthEditorialPanelProps) {
  const t = useTranslations("Auth");

  const benefits =
    userType === "consumer"
      ? [t("consumer_benefits.0"), t("consumer_benefits.1"), t("consumer_benefits.2")]
      : [t("provider_benefits.0"), t("provider_benefits.1"), t("provider_benefits.2")];

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 border-r border-gray-800 flex-col overflow-hidden font-sans select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        key={userType} // Re-anima al cambiar entre usuario paciente y profesional
        initial={{ opacity: 0.4, scale: 1.05 }}
        animate={{ opacity: 0.85, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        src={
          userType === "consumer"
            ? "/suite_patient_app.png"
            : "/hero_medical_lifestyle.png"
        }
        alt="QuHealthy Authentication"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Gradient Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

      {/* Contenido Editorial */}
      <div className="relative z-10 p-12 xl:p-16 mt-auto space-y-8">
        <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-[1.2]">
          {t(userType === "consumer" ? "consumer_area" : "provider_area")}
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

        {/* Bloque de Información Segura */}
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