"use client";

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
        // Si solo hay un servicio, mandamos directo al booking con el serviceId
        router.push(
          `/${locale}/patient/booking/${provider.slug}?serviceId=${validCredits[0].serviceId}`,
        );
      } else {
        // Multi-item package, vamos a la tienda a que seleccione
        router.push(`/${locale}/store/${provider.slug}`);
      }
    } else {
      router.push(
        `/${locale}/search?provider=${encodeURIComponent(provider.name)}`,
      );
    }
  };

  return (
    <div className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all group h-full hover:-translate-y-1 hover:shadow-xl hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 relative hover:z-10 rounded-3xl shadow-sm">
      {/* Cabecera Técnica */}
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex flex-col gap-4 rounded-t-3xl">
        <div className="flex items-start justify-between gap-4">
          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit shadow-sm border border-emerald-100 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {pkg.type === "SERVICE"
              ? "Servicio Prepagado"
              : t("status_active", { defaultValue: "Paquete Activo" })}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
            <ShieldCheck
              className="w-5 h-5 text-quhealthy-green"
              strokeWidth={2}
            />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1 mb-1.5">
            {pkg.servicePackage.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
            <User className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span className="truncate">{pkg.provider.name}</span>
            <span>•</span>
            <span className="truncate text-gray-700 dark:text-gray-300 font-bold">
              {pkg.provider.specialty}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido y Progreso (Barras Arquitectónicas) */}
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10 font-medium leading-relaxed text-left">
          {pkg.servicePackage.description}
        </p>

        <div className="space-y-5">
          <p className="text-xs font-bold text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
            {t("available_credits", { defaultValue: "Sesiones disponibles" })}
          </p>

          {pkg.creditsRemaining.map((credit, idx) => {
            const percent = (credit.quantity / credit.totalQuantity) * 100;
            const isExhausted = credit.quantity === 0;

            return (
              <div
                key={`${pkg.id}-${credit.serviceId}-${idx}`}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-bold ${isExhausted ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}
                  >
                    {credit.serviceName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Tag
                      className={`w-3.5 h-3.5 ${isExhausted ? "text-gray-400" : "text-quhealthy-green"}`}
                      strokeWidth={2}
                    />
                    <span
                      className={`text-xs font-bold ${isExhausted ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {credit.quantity} / {credit.totalQuantity}
                    </span>
                  </div>
                </div>
                {/* Barra Soft Health */}
                <div
                  className={`w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden ${isExhausted ? "opacity-50" : ""}`}
                >
                  <div
                    className="h-full bg-quhealthy-green rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer con CTA */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 mt-auto bg-gray-50/50 dark:bg-[#0a0a0a]">
        <Button
          onClick={handleUseCredits}
          className="w-full rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-quhealthy-green dark:hover:bg-emerald-700 h-12 text-sm font-bold transition-all shadow-sm border-0 flex items-center justify-between px-6"
        >
          {t("btn_use_credits", { defaultValue: "Usar mis sesiones" })}
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
