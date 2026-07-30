"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { Clock, ChevronDown, Check, FileCheck2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { VaccinationStatusDto } from "@/types/vaccination";

interface VaccinesListProps {
  groupedVaccines: { ageGroup: string; vaccines: VaccinationStatusDto[] }[];
  simulatingAction: number | null;
  onToggleVaccine: (vaccine: VaccinationStatusDto) => void;
}

export function VaccinesList({
  groupedVaccines,
  simulatingAction,
  onToggleVaccine,
}: VaccinesListProps) {
  const t = useTranslations("VaccinesList");

  return (
    <Accordion type="multiple" className="space-y-4 font-sans transition-colors">
      {groupedVaccines.map((stage) => (
        <AccordionItem
          value={stage.ageGroup}
          key={stage.ageGroup}
          className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xs transition-all duration-200"
        >
          {/* Cabecera del Grupo */}
          <AccordionTrigger className="bg-gray-50/60 dark:bg-[#050505] px-6 py-4.5 hover:no-underline hover:bg-gray-100/60 dark:hover:bg-[#111] transition-colors border-b border-transparent data-[state=open]:border-gray-100 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180 select-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" strokeWidth={2} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("phase_label", { ageGroup: stage.ageGroup })}
              </h2>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-400" strokeWidth={2} />
          </AccordionTrigger>

          {/* Filas de Vacunas */}
          <AccordionContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {stage.vaccines.map((vaccine) => {
                const isApplied = vaccine.isApplied;
                const isSimulating =
                  simulatingAction === vaccine.vaccineCatalogId;

                return (
                  <div
                    key={vaccine.vaccineCatalogId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-gray-50/40 dark:hover:bg-[#050505] transition-colors group select-none"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Checkbox Semántico */}
                      <button
                        type="button"
                        onClick={() => onToggleVaccine(vaccine)}
                        disabled={isSimulating}
                        className={cn(
                          "mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs",
                          isApplied
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50"
                        )}
                      >
                        {isSimulating ? (
                          <QhSpinner size="sm" className="text-current" />
                        ) : isApplied ? (
                          <Check className="w-4 h-4 stroke-[3]" strokeWidth={3} />
                        ) : null}
                      </button>

                      <div className="space-y-0.5 min-w-0">
                        <h4
                          className={cn(
                            "text-xs sm:text-sm font-bold tracking-tight transition-colors leading-snug",
                            isApplied
                              ? "text-gray-400 dark:text-gray-500 line-through"
                              : "text-gray-900 dark:text-white"
                          )}
                        >
                          {vaccine.name}
                        </h4>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {vaccine.diseasePrevented} •{" "}
                          <span className="font-mono text-[11px]">
                            {t("dose_number", { doseNumber: vaccine.doseNumber })}
                          </span>
                        </p>

                        {isApplied && vaccine.appliedDate && (
                          <div className="pt-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-lg shadow-2xs">
                              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                              <span>
                                {t("applied_date", { date: vaccine.appliedDate })}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isApplied && (
                      <Button
                        type="button"
                        disabled={isSimulating}
                        onClick={() => onToggleVaccine(vaccine)}
                        className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all border-0 cursor-pointer shrink-0 self-start sm:self-center"
                      >
                        {isSimulating ? (
                          <QhSpinner size="sm" className="text-white" />
                        ) : (
                          <span>{t("register_dose")}</span>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}