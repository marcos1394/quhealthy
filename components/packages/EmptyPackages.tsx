"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageSearch } from "lucide-react";

export function EmptyPackages() {
  const t = useTranslations("PatientPackages");

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 bg-gray-50/50 dark:bg-[#0a0a0a] text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-800">
        <PackageSearch
          className="w-6 h-6 text-gray-400 dark:text-gray-500"
          strokeWidth={2}
        />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
        {t("empty_title", { defaultValue: "Directorio Vacío" })}
      </h3>
      <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
        {t("empty_desc", {
          defaultValue:
            "Los paquetes clínicos y suscripciones de servicio aparecerán aquí para su gestión y redención de créditos.",
        })}
      </p>
    </div>
  );
}
