"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
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
  const [delayedCount, setDelayedCount] = useState(0);

  useEffect(() => {
    if (!memberId) return;
    vaccinationService
      .getVaccinations(memberId)
      .then((data) => {
        const delayed = data.filter((v) => v.isDelayed).length;
        setDelayedCount(delayed);
      })
      .catch((err) => console.error("Error fetching vaccines for alert", err));
  }, [memberId]);

  if (delayedCount === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/patient/dashboard/family/${memberId}/vaccinations`}
            className="absolute left-4 top-4 z-20 flex h-8 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-3 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors group shadow-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" strokeWidth={2} />
            <span className="text-xs font-bold">
              {delayedCount} Atraso{delayedCount > 1 ? "s" : ""}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          className="z-50 max-w-xs rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 shadow-lg"
          sideOffset={5}
        >
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
            Atención Requerida
          </p>
          <p className="text-xs font-medium text-gray-500">
            El expediente indica {delayedCount} vacuna
            {delayedCount > 1 ? "s" : ""} con retraso. Haga clic para registrar
            la aplicación o programar una cita.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
