"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ShieldCheck, User, Tag, ChevronRight } from "lucide-react";

import { ConsumerPackage } from "@/types/packages";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
  pkg: ConsumerPackage;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const t = useTranslations("PatientPackages");
  const router = useRouter();
  const locale = useLocale();

  const handleUseCredits = () => {
    const { provider, creditsRemaining } = pkg;
    const validCredits = creditsRemaining?.filter((c) => c.quantity > 0) || [];

    if (provider.slug) {
      if (validCredits.length === 1) {
        // Si solo hay un servicio, enviamos directo al booking con el serviceId
        router.push(
          `/${locale}/patient/booking/${provider.slug}?serviceId=${validCredits[0].serviceId}`
        );
      } else {
        // Paquete multi-ítem, dirigimos a la tienda para seleccionar
        router.push(`/${locale}/store/${provider.slug}`);
      }
    } else {
      router.push(
        `/${locale}/search?provider=${encodeURIComponent(provider.name)}`
      );
    }
  };

  return (
    <div className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all hover:border-emerald-500/30 hover:shadow-md rounded-3xl shadow-2xs font-sans transition-all select-none overflow-hidden h-full">
      {/* ── CABECERA DE LA TARJETA ──────────────────────────────────── */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>
              {pkg.type === "SERVICE"
                ? t("status_prepaid")
                : t("status_active")}
            </span>
          </span>

          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1">
            {pkg.servicePackage.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <span className="truncate">{pkg.provider.name}</span>
            <span>•</span>
            <span className="truncate text-gray-800 dark:text-gray-200 font-bold">
              {pkg.provider.specialty}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO Y PROGRESO DE CRÉDITOS ───────────────────────── */}
      <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {pkg.servicePackage.description}
        </p>

        <div className="space-y-4 pt-2">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 tracking-tight">
            {t("available_credits")}
          </p>

          <div className="space-y-3.5">
            {pkg.creditsRemaining.map((credit, idx) => {
              const percent = (credit.quantity / credit.totalQuantity) * 100;
              const isExhausted = credit.quantity === 0;

              return (
                <div
                  key={`${pkg.id}-${credit.serviceId}-${idx}`}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`font-bold transition-colors ${
                        isExhausted
                          ? "text-gray-400 line-through"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {credit.serviceName}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <Tag
                        className={`w-3.5 h-3.5 ${
                          isExhausted
                            ? "text-gray-300 dark:text-gray-600"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                        strokeWidth={2}
                      />
                      <span
                        className={
                          isExhausted
                            ? "text-gray-400"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      >
                        {t("credits_count", {
                          quantity: credit.quantity,
                          totalQuantity: credit.totalQuantity,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso Soft Health */}
                  <div
                    className={`w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xs ${
                      isExhausted ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BOTÓN DE ACCIÓN (FOOTER) ────────────────────────────────── */}
      <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
        <Button
          type="button"
          onClick={handleUseCredits}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-between px-5"
        >
          <span>{t("btn_use_credits")}</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}