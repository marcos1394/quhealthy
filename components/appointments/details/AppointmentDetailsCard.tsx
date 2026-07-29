"use client";

import React from "react";
import { User, Stethoscope, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppointmentDetailsCard({
  providerNameSnapshot,
  serviceNameSnapshot,
  serviceName,
  consumerSymptoms,
}: {
  providerNameSnapshot?: string;
  serviceNameSnapshot?: string;
  serviceName?: string;
  consumerSymptoms?: string;
}) {
  const t = useTranslations("AppointmentDetails.clinical");

  const providerName = providerNameSnapshot || t("default_specialist");
  const procedureName = serviceNameSnapshot || serviceName || t("default_procedure");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 font-sans">
      {/* Header Card */}
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <User className="w-5 h-5" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Especialista Asignado */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl shrink-0 shadow-sm">
            {providerName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t("specialist_assigned")}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {providerName}
            </p>
          </div>
        </div>

        {/* Procedimiento a Realizar */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("procedure")}</span>
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white pl-6">
            {procedureName}
          </p>
        </div>

        {/* Observaciones del Paciente */}
        {consumerSymptoms && (
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("patient_notes")}</span>
            </p>
            <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{consumerSymptoms}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}