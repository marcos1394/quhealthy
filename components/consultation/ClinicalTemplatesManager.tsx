"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileEdit,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import { useSessionStore } from "@/stores/SessionStore";
import {
  clinicalTemplateService,
  ClinicalTemplateResponse,
} from "@/services/clinicalTemplates.service";
import {
  clinicalSubmissionService,
  ClinicalSubmissionResponse,
  ClinicalSubmissionRequest,
} from "@/services/clinicalSubmissions.service";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";

interface ClinicalTemplatesManagerProps {
  appointmentId: number;
  consumerId: number;
  onBack: () => void;
  onNext: () => void;
}

export function ClinicalTemplatesManager({
  appointmentId,
  consumerId,
  onBack,
  onNext,
}: ClinicalTemplatesManagerProps) {
  const t = useTranslations("ClinicalTemplatesManager");
  const { user } = useSessionStore();

  const [templates, setTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [submissions, setSubmissions] = useState<ClinicalSubmissionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTemplate, setActiveTemplate] =
    useState<ClinicalTemplateResponse | null>(null);
  const [activeSubmission, setActiveSubmission] =
    useState<ClinicalSubmissionResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tmpls, subs] = await Promise.all([
        clinicalTemplateService.getTemplates(user?.id),
        clinicalSubmissionService.getAppointmentSubmissions(appointmentId),
      ]);
      setTemplates(tmpls);
      setSubmissions(subs);
    } catch (error) {
      handleApiError(error, t("error_load"));
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, user?.id, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectTemplate = (template: ClinicalTemplateResponse) => {
    setActiveTemplate(template);
    const existing = submissions.find((s) => s.template.id === template.id);
    setActiveSubmission(existing || null);
  };

  const handleSave = async (data: any, isFinal: boolean) => {
    if (!activeTemplate || !user?.id) return;

    try {
      setIsSaving(true);
      const request: ClinicalSubmissionRequest = {
        appointmentId,
        consumerId,
        providerId: user.id,
        templateId: activeTemplate.id,
        data,
        status: isFinal ? "FINALIZED" : "DRAFT",
      };

      const saved = await clinicalSubmissionService.saveSubmission(request);
      setActiveSubmission(saved);
      toast.success(isFinal ? t("toast_finalized") : t("toast_draft"));
      loadData();

      if (isFinal) {
        setActiveTemplate(null);
      }
    } catch (error) {
      handleApiError(error, t("error_save"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center space-y-3 font-sans shadow-sm transition-colors min-h-[300px]">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400">{t("error_load")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col relative font-sans transition-colors min-h-[600px]">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <FileText className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("subtitle")}
            </p>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
          </div>
        </div>

        {activeTemplate && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTemplate(null)}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-9 px-4 shadow-xs transition-all cursor-pointer"
          >
            {t("btn_catalog")}
          </Button>
        )}
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTemplate ? (
          <DynamicFormRenderer
            template={activeTemplate}
            initialData={activeSubmission?.data}
            onSave={handleSave}
            isSaving={isSaving}
            isFinalized={activeSubmission?.status === "FINALIZED"}
          />
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {t("select_instruction")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((tmpl) => {
                const submission = submissions.find(
                  (s) => s.template.id === tmpl.id
                );
                const isFinalized = submission?.status === "FINALIZED";
                const isDraft = submission?.status === "DRAFT";

                return (
                  <div
                    key={tmpl.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectTemplate(tmpl)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSelectTemplate(tmpl)
                    }
                    className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between min-h-[190px] bg-white dark:bg-[#050505] shadow-xs group select-none space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                          {tmpl.category || t("category_default")}
                        </span>
                        {isFinalized && (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                            strokeWidth={2}
                          />
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tmpl.name}
                      </h3>

                      {tmpl.description && (
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      {isFinalized ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{t("status_finalized")}</span>
                        </span>
                      ) : isDraft ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <FileEdit className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{t("status_draft")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{t("status_new")}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {templates.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <FileText className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("empty_title")}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 max-w-sm leading-relaxed">
                      {t("empty_desc")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── NAVEGACIÓN PIE ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-11 px-5 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_back")}</span>
        </Button>

        <Button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-11 px-6 shadow-sm transition-all border-0 flex items-center gap-2 cursor-pointer"
        >
          <span>{t("btn_next")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}