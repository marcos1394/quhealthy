"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Cpu,
  Activity,
  Stethoscope,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { catalogService } from "@/services/catalog.service";
import {
  clinicalTemplateService,
  ClinicalTemplateResponse,
} from "@/services/clinicalTemplates.service";
import { TemplateSelectorModal } from "./TemplateSelectorModal";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { SoapNotes, AppointmentDiagnosis, VitalSignRequest } from "@/types/ehr";
import { cn } from "@/lib/utils";
import { Icd10Autocomplete } from "./Icd10Autocomplete";
import { VitalSignsCapture } from "./VitalSignsCapture";

interface ClinicalEvaluationStepProps {
  soapNotes: SoapNotes;
  updateSoapNote: (field: keyof SoapNotes, value: string) => void;
  diagnoses: AppointmentDiagnosis[];
  addDiagnosis: (diagnosis: Omit<AppointmentDiagnosis, "id">) => void;
  removeDiagnosis: (id: string) => void;
  vitalSigns: VitalSignRequest[];
  addVitalSign: (vs: VitalSignRequest) => void;
  removeVitalSign: (index: number) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  handleToggleRecording: () => void;
  appointmentType: string;
  onBack: () => void;
  onNext: () => void;
  syncAiSoapNote?: () => Promise<boolean>;
  serviceId?: number | null;
}

export const ClinicalEvaluationStep: React.FC<ClinicalEvaluationStepProps> = ({
  soapNotes,
  updateSoapNote,
  diagnoses,
  addDiagnosis,
  removeDiagnosis,
  vitalSigns,
  addVitalSign,
  removeVitalSign,
  isRecording,
  isTranscribing,
  handleToggleRecording,
  appointmentType,
  onBack,
  onNext,
  syncAiSoapNote,
  serviceId,
}) => {
  const t = useTranslations("EHR");

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSyncingAi, setIsSyncingAi] = useState(false);
  const [targetField, setTargetField] = useState<
    "subjective" | "objective" | "assessment" | "plan" | null
  >(null);

  const [linkedTemplate, setLinkedTemplate] =
    useState<ClinicalTemplateResponse | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchLinkedTemplate = async () => {
      if (!serviceId) return;
      try {
        const item = await catalogService.getItemDetail(serviceId);
        if (item.metadata?.clinicalTemplateId) {
          const tmpl = await clinicalTemplateService.getTemplate(
            item.metadata.clinicalTemplateId
          );
          setLinkedTemplate(tmpl);
        }
      } catch (err) {
        console.error("Error fetching linked template:", err);
      }
    };
    fetchLinkedTemplate();
  }, [serviceId]);

  const updateTemplateData = (fieldId: string, value: any) => {
    setTemplateData((prev) => ({ ...prev, [fieldId]: value }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (syncAiSoapNote && appointmentType === "ONLINE") {
      syncAiSoapNote().then((success) => {
        if (!success) {
          interval = setInterval(async () => {
            const found = await syncAiSoapNote();
            if (found) clearInterval(interval);
          }, 5000);
        }
      });
    }
    return () => clearInterval(interval);
  }, [syncAiSoapNote, appointmentType]);

  const handleSyncAi = async () => {
    if (!syncAiSoapNote) return;
    setIsSyncingAi(true);
    await syncAiSoapNote();
    setTimeout(() => setIsSyncingAi(false), 1000);
  };

  const handleTemplateSelect = (content: string) => {
    if (targetField) {
      const currentContent = soapNotes[targetField] || "";
      updateSoapNote(
        targetField,
        currentContent ? `${currentContent}\n\n${content}` : content
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans transition-colors">
      {/* ── CONTENEDOR PRINCIPAL S.O.A.P. ───────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        {/* Header del Expediente */}
        <div className="p-5 sm:p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <FileText className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("valuation_structure")}
              </p>
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {t("soap_documentation")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copiloto AI Button */}
            <button
              type="button"
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={cn(
                "flex-1 sm:flex-none h-10 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer",
                isCopilotOpen || isRecording || isTranscribing
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-emerald-500/40"
              )}
            >
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("ai_scribe")}</span>
            </button>

            {/* Plantillas Button */}
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("load_template")}</span>
            </button>
          </div>
        </div>

        {/* ── PLANTILLA VINCULADA AL SERVICIO (SI EXISTE) ──────────────── */}
        {linkedTemplate &&
          linkedTemplate.schema?.fields &&
          linkedTemplate.schema.fields.length > 0 && (
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Stethoscope className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("service_specific_data")}
                  </h4>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {t("template_prefix", { name: linkedTemplate.name })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedTemplate.schema.fields.map((field) => (
                  <div
                    key={field.id}
                    className="border border-gray-100 dark:border-gray-800 p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-xs space-y-2"
                  >
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "textarea" ? (
                      <Textarea
                        value={templateData[field.id] || ""}
                        onChange={(e) =>
                          updateTemplateData(field.id, e.target.value)
                        }
                        className="w-full min-h-[60px] bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 p-3 text-xs rounded-xl focus-visible:ring-emerald-500/20"
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={templateData[field.id]}
                        onValueChange={(v) => updateTemplateData(field.id, v)}
                      >
                        <SelectTrigger className="rounded-xl h-10 text-xs bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus:ring-emerald-500/20">
                          <SelectValue placeholder={t("select_placeholder")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl font-sans">
                          {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        value={templateData[field.id] || ""}
                        onChange={(e) =>
                          updateTemplateData(field.id, e.target.value)
                        }
                        className="rounded-xl h-10 text-xs bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* ── GRID S.O.A.P. ESTRUCTURADO ─────────────────────────────────── */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#0a0a0a]">
          {/* S - Subjetivo */}
          <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                S
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("soap_subjective")}
              </h4>
            </div>
            <Textarea
              value={soapNotes.subjective}
              onChange={(e) => updateSoapNote("subjective", e.target.value)}
              onFocus={() => setTargetField("subjective")}
              placeholder={t("soap_subjective_placeholder")}
              className="w-full min-h-[110px] rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 transition-all resize-none shadow-xs"
            />
          </div>

          {/* O - Objetivo */}
          <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                O
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("soap_objective")}
              </h4>
            </div>
            <Textarea
              value={soapNotes.objective}
              onChange={(e) => updateSoapNote("objective", e.target.value)}
              onFocus={() => setTargetField("objective")}
              placeholder={t("soap_objective_placeholder")}
              className="w-full min-h-[110px] rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 transition-all resize-none shadow-xs"
            />
          </div>

          {/* A - Análisis */}
          <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                A
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("soap_assessment")}
              </h4>
            </div>
            <Textarea
              value={soapNotes.assessment}
              onChange={(e) => updateSoapNote("assessment", e.target.value)}
              onFocus={() => setTargetField("assessment")}
              placeholder={t("soap_assessment_placeholder")}
              className="w-full min-h-[110px] rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 transition-all resize-none shadow-xs"
            />
          </div>

          {/* P - Plan */}
          <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                P
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("soap_plan")}
              </h4>
            </div>
            <Textarea
              value={soapNotes.plan}
              onChange={(e) => updateSoapNote("plan", e.target.value)}
              onFocus={() => setTargetField("plan")}
              placeholder={t("soap_plan_placeholder")}
              className="w-full min-h-[110px] rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 transition-all resize-none shadow-xs"
            />
          </div>
        </div>

        {/* ── DIAGNÓSTICOS (CIE-10) ─────────────────────────────────────── */}
        <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 shadow-xs">
              CIE
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("icd10_title")}
              </h4>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {t("icd10_desc")}
              </p>
            </div>
          </div>

          <Icd10Autocomplete
            diagnoses={diagnoses}
            addDiagnosis={addDiagnosis}
            removeDiagnosis={removeDiagnosis}
          />
        </div>

        {/* ── SIGNOS VITALES ────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Activity className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{t("vitals_title")}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-[9px] font-bold">
                  {t("vitals_nom_badge")}
                </span>
              </h4>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {t("vitals_desc")}
              </p>
            </div>
          </div>

          <VitalSignsCapture
            vitalSigns={vitalSigns}
            addVitalSign={addVitalSign}
            removeVitalSign={removeVitalSign}
          />
        </div>
      </div>

      {/* ── BANNER COPILOTO IA ─────────────────────────────────────────── */}
      {(isCopilotOpen || isRecording || isTranscribing) && (
        <div className="p-5 rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cpu className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                {t("clinical_copilot")}
              </h3>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {t("copilot_desc_short")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {syncAiSoapNote && (
              <button
                type="button"
                onClick={handleSyncAi}
                disabled={isSyncingAi}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 h-10 rounded-xl text-xs font-bold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all cursor-pointer shadow-xs"
              >
                {isSyncingAi ? (
                  <>
                    <QhSpinner size="sm" className="text-emerald-600" />
                    <span>{t("syncing_ai")}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    <span>{t("sync_ai")}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleRecording}
              disabled={isTranscribing}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border-0",
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              {isTranscribing ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("processing_ai")}</span>
                </>
              ) : isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" strokeWidth={2} />
                  <span>{t("stop_listening")}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" strokeWidth={2} />
                  <span>{t("start_listening")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── BOTONES DE NAVEGACIÓN Y ACCIÓN ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_back")}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto h-12 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm border-0 cursor-pointer"
        >
          <span>{t("btn_continue_treatment")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Modal Selección Plantilla */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};