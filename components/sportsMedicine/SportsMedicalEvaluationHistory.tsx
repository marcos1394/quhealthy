"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, FileText } from "lucide-react";
import { toast } from "react-toastify";

import { sportsMedicineService } from "@/services/sportsMedicine.service";
import { SportsMedicalEvaluationResponse } from "@/types/sportsMedicine";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SportsMedicalEvaluationHistoryProps {
  patientId: number;
}

export function SportsMedicalEvaluationHistory({
  patientId,
}: SportsMedicalEvaluationHistoryProps) {
  const t = useTranslations("SportsMedicalEvaluationHistory");

  const [evaluations, setEvaluations] = useState<
    SportsMedicalEvaluationResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!patientId) return;
      setIsLoading(true);
      try {
        const data = await sportsMedicineService.getPatientHistory(patientId);
        // Filtrar solo dictámenes definitivos (FINAL)
        setEvaluations((data || []).filter((e) => e.status === "FINAL"));
      } catch (error) {
        console.error("Error al obtener historial deportivo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      await sportsMedicineService.downloadPdf(id);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error(t("toast_download_error"));
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xs flex items-center justify-center min-h-[180px] font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] p-8 text-center font-sans space-y-2 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 mx-auto shadow-2xs">
          <Activity className="w-6 h-6" strokeWidth={2} />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
          {t("empty_title")}
        </h4>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          {t("empty_desc")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Activity className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── TABLA DE HISTORIAL DE EVALUACIONES ───────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">{t("col_date")}</th>
                <th className="px-5 py-3.5">{t("col_type")}</th>
                <th className="px-5 py-3.5">{t("col_result")}</th>
                <th className="px-5 py-3.5 text-right">{t("col_document")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {evaluations.map((evalItem) => (
                <tr
                  key={evalItem.id}
                  className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                >
                  <td className="px-5 py-4 font-mono font-bold text-gray-900 dark:text-white">
                    {new Date(evalItem.createdAt).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </td>

                  <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    {evalItem.injuryType
                      ? t("injury_prefix", { type: evalItem.injuryType })
                      : t("fitness_check")}
                  </td>

                  <td className="px-5 py-4">
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                      {evalItem.evaluationResult?.replace(/_/g, " ")}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDownload(evalItem.id)}
                      disabled={downloadingId === evalItem.id}
                      className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-8 px-3 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {downloadingId === evalItem.id ? (
                        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      )}
                      <span>{t("btn_pdf")}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}