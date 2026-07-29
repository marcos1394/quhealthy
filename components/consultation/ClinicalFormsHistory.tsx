"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FileText, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  clinicalSubmissionService,
  ClinicalSubmissionResponse,
} from "@/services/clinicalSubmissions.service";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";
import { useSessionStore } from "@/stores/SessionStore";

interface ClinicalFormsHistoryProps {
  patientId: number;
}

export function ClinicalFormsHistory({ patientId }: ClinicalFormsHistoryProps) {
  const t = useTranslations("ClinicalFormsHistory");
  const { token, user } = useSessionStore();
  const [history, setHistory] = useState<ClinicalSubmissionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clinicalSubmissionService.getPatientHistory(patientId);
      setHistory(data);
    } catch (error) {
      handleApiError(error, t("error_load_history"));
    } finally {
      setIsLoading(false);
    }
  }, [patientId, t]);

  useEffect(() => {
    if (patientId) {
      loadHistory();
    }
  }, [patientId, loadHistory]);

  const downloadPdf = async (id: number, templateName: string) => {
    try {
      setDownloadingId(id);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const url = `${baseUrl}/api/appointments/clinical-submissions/${id}/pdf`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Id": String(user?.id),
        },
      });

      if (!response.ok) {
        throw new Error(t("pdf_download_failed"));
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const sanitizedName = templateName.replace(/\s+/g, "_");
      a.download = `${sanitizedName}_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      handleApiError(error, t("error_download_pdf"));
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 font-sans">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-3 font-sans transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <FileText className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {t("empty_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("empty_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((sub) => {
          const isDownloadingThis = downloadingId === sub.id;
          const formName = sub.template?.name || t("default_form_name");
          const category = sub.template?.category || t("category_default");
          const dateFormatted = sub.updatedAt
            ? format(new Date(sub.updatedAt), "dd MMM yyyy", { locale: es })
            : t("date_na");

          // Preview de los datos capturados
          const previewContent = Object.entries(sub.data || {})
            .filter(([_, v]) => Boolean(v))
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" • ");

          return (
            <div
              key={sub.id}
              className="rounded-3xl border border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all shadow-xs space-y-4"
            >
              <div className="space-y-3">
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
                    {category}
                  </span>

                  <div className="flex items-center text-xs font-semibold text-gray-400 font-mono gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                    <span>{dateFormatted}</span>
                  </div>
                </div>

                {/* Título de la Ficha */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                  {formName}
                </h3>

                {/* Preview de Datos */}
                {previewContent && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed bg-gray-50/60 dark:bg-[#050505] p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {previewContent}
                  </p>
                )}
              </div>

              {/* Botón Descargar PDF */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button
                  type="button"
                  onClick={() => downloadPdf(sub.id, formName)}
                  disabled={isDownloadingThis}
                  variant="outline"
                  className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all h-10 px-4 shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingThis ? (
                    <>
                      <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                      <span>{t("downloading_pdf")}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>{t("btn_download_pdf")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}