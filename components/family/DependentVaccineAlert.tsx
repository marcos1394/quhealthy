"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";

import { vaccinationService } from "@/services/vaccination.service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DependentVaccineAlertProps {
  memberId: number;
}

export function DependentVaccineAlert({
  memberId,
}: DependentVaccineAlertProps) {
  const t = useTranslations("DependentVaccineAlert");
  const [delayedCount, setDelayedCount] = useState(0);

  useEffect(() => {
    if (!memberId) return;
    vaccinationService
      .getVaccinations(memberId)
      .then((data) => {
        const delayed = data.filter((v) => v.isDelayed).length;
        setDelayedCount(delayed);
      })
      .catch((err) =>
        console.error("Error al obtener vacunas pendientes para la alerta", err)
      );
  }, [memberId]);

  if (delayedCount === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/patient/dashboard/family/${memberId}/vaccinations`}
            className="absolute left-4 top-4 z-20 flex h-8 items-center justify-center rounded-full bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 px-3 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all font-sans shadow-2xs group backdrop-blur-md"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" strokeWidth={2} />
            <span className="text-xs font-bold tracking-tight">
              {t("delayed_count", { count: delayedCount })}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="z-50 max-w-xs rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 shadow-xl font-sans"
        >
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
            {t("tooltip_title")}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("tooltip_desc", { count: delayedCount })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}