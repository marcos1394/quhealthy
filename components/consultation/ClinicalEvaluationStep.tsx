"use client";
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import {
  Mic,
  Square,
  Sparkles,
  Video,
  ArrowRight,
  ArrowLeft,
  FileText,
  Cpu,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { catalogService } from "@/services/catalog.service";
import { clinicalTemplateService, ClinicalTemplateResponse } from "@/services/clinicalTemplates.service";
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
  serviceId
}) => {
  const t = useTranslations("EHR");

  const [isCopilotOpen, setIsCopilotOpen] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [isSyncingAi, setIsSyncingAi] = React.useState(false);
  const [targetField, setTargetField] = React.useState<
    "subjective" | "objective" | "assessment" | "plan" | null
  >(null);

  const [linkedTemplate, setLinkedTemplate] = React.useState<ClinicalTemplateResponse | null>(null);
  const [templateData, setTemplateData] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const fetchLinkedTemplate = async () => {
      if (!serviceId) return;
      try {
        const item = await catalogService.getItemDetail(serviceId);
        if (item.metadata?.clinicalTemplateId) {
          const tmpl = await clinicalTemplateService.getTemplate(item.metadata.clinicalTemplateId);
          setLinkedTemplate(tmpl);
        }
      } catch (err) {
        console.error("Error fetching linked template:", err);
      }
    };
    fetchLinkedTemplate();
  }, [serviceId]);

  const updateTemplateData = (fieldId: string, value: any) => {
    setTemplateData(prev => ({ ...prev, [fieldId]: value }));
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (syncAiSoapNote && appointmentType === 'ONLINE') {
      // Intento inicial
      syncAiSoapNote().then(success => {
        if (!success) {
          // Si aún no está listo, hacemos polling cada 5 segundos
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
        currentContent ? `${currentContent}\n\n${content}` : content,
      );
    }
  };

  return (
    <div className="flex flex-col gap-8 transition-colors duration-300">
      {/* 📝 DOCUMENTACIÓN SOAP MANUALES (Full Width) */}
      <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-none">
        {/* Header del Expediente */}
        <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 border-b border-black dark:border-white shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
              <FileText
                className="w-4 h-4 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Estructura de Valoración
              </p>
              <h2 className="text-base md:text-lg font-semibold tracking-tight text-black dark:text-white uppercase leading-none">
                {t("soap_documentation", {
                  defaultValue: "DOCUMENTACIÓN CLÍNICA (S.O.A.P.)",
                })}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={cn(
                "flex items-center gap-2 h-10 px-4 border text-[9px] font-bold uppercase tracking-widest transition-colors rounded-none",
                isCopilotOpen || isRecording || isTranscribing
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-transparent text-black dark:text-white border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white",
              )}
            >
              <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">AI SCRIBE</span>
            </button>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="h-10 px-4 flex items-center justify-center gap-2 border border-black dark:border-white text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <span>✨ Cargar Plantilla</span>
            </button>
          </div>
        </div>

        {/* === CAMPOS DE PLANTILLA VINCULADA === */}
        {linkedTemplate && linkedTemplate.schema?.fields && linkedTemplate.schema.fields.length > 0 && (
          <div className="border-b border-black/10 dark:border-white/10 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                <FileText className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-none">
                  DATOS ESPECÍFICOS DEL SERVICIO
                </h4>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">
                  PLANTILLA: {linkedTemplate.name}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedTemplate.schema.fields.map(field => (
                <div key={field.id} className="border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-[#050505]">
                  <label className="text-[10px] uppercase tracking-widest text-black dark:text-white mb-2 block font-bold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                     <Textarea 
                       value={templateData[field.id] || ""}
                       onChange={e => updateTemplateData(field.id, e.target.value)}
                       className="w-full min-h-[60px] bg-white dark:bg-black border-black/20 dark:border-white/20 p-2 text-xs rounded-none" 
                     />
                  ) : field.type === 'select' ? (
                     <Select value={templateData[field.id]} onValueChange={v => updateTemplateData(field.id, v)}>
                        <SelectTrigger className="rounded-none h-8 text-xs bg-white dark:bg-black border-black/20 dark:border-white/20">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                           {field.options?.map(opt => (
                             <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  ) : (
                     <Input 
                       type={field.type} 
                       value={templateData[field.id] || ""}
                       onChange={e => updateTemplateData(field.id, e.target.value)}
                       className="rounded-none h-8 text-xs bg-white dark:bg-black border-black/20 dark:border-white/20" 
                     />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid Blueprint SOAP */}
        <div className="bg-gray-50 dark:bg-[#050505] p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
            {/* S - Subjetivo */}
            <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                  S
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t("soap_subjective", { defaultValue: "SUBJETIVO" })}
                </h4>
              </div>
              <Textarea
                value={soapNotes.subjective}
                onChange={(e) => updateSoapNote("subjective", e.target.value)}
                onFocus={() => setTargetField("subjective")}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder={t("soap_subjective_placeholder", {
                  defaultValue:
                    "Motivo de consulta y síntomas referidos por el paciente...",
                })}
                className="w-full min-h-[100px] overflow-hidden resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors"
              />
            </div>

            {/* O - Objetivo */}
            <div className="border-b md:border-r-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                  O
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t("soap_objective", { defaultValue: "OBJETIVO" })}
                </h4>
              </div>
              <Textarea
                value={soapNotes.objective}
                onChange={(e) => updateSoapNote("objective", e.target.value)}
                onFocus={() => setTargetField("objective")}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder={t("soap_objective_placeholder", {
                  defaultValue:
                    "Signos vitales, hallazgos físicos y resultados de laboratorio...",
                })}
                className="w-full min-h-[100px] overflow-hidden resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors"
              />
            </div>

            {/* A - Análisis / Assessment */}
            <div className="border-b md:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                  A
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t("soap_assessment", { defaultValue: "ANÁLISIS" })}
                </h4>
              </div>
              <Textarea
                value={soapNotes.assessment}
                onChange={(e) => updateSoapNote("assessment", e.target.value)}
                onFocus={() => setTargetField("assessment")}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder={t("soap_assessment_placeholder", {
                  defaultValue:
                    "Diagnóstico diferencial, razonamiento clínico y estado actual...",
                })}
                className="w-full min-h-[100px] overflow-hidden resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors"
              />
            </div>

            {/* P - Plan */}
            <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                  P
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t("soap_plan", { defaultValue: "PLAN" })}
                </h4>
              </div>
              <Textarea
                value={soapNotes.plan}
                onChange={(e) => updateSoapNote("plan", e.target.value)}
                onFocus={() => setTargetField("plan")}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder={t("soap_plan_placeholder", {
                  defaultValue:
                    "Tratamiento, medicamentos, estudios solicitados y seguimiento...",
                })}
                className="w-full min-h-[100px] overflow-hidden resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 🩺 DIAGNÓSTICOS (CIE-10) */}
        <div className="border-t border-black/10 dark:border-white/10 p-4 md:p-6 bg-white dark:bg-[#0a0a0a] relative z-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
              CIE
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-none">
                DIAGNÓSTICOS (CIE-10)
              </h4>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">
                SE AGREGARÁN AUTOMÁTICAMENTE A LOS PROBLEMAS ACTIVOS DEL
                PACIENTE
              </p>
            </div>
          </div>

          <Icd10Autocomplete
            diagnoses={diagnoses}
            addDiagnosis={addDiagnosis}
            removeDiagnosis={removeDiagnosis}
          />
        </div>

        {/* 💓 SIGNOS VITALES */}
        <div className="border-t border-black/10 dark:border-white/10 p-4 md:p-6 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
              SV
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-none flex items-center gap-2">
                SIGNOS VITALES
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-sm text-[8px] tracking-widest">
                  NOM-004 OBLIGATORIO
                </span>
              </h4>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">
                REGISTRO ESTRUCTURADO OBLIGATORIO PARA CUMPLIMIENTO NORMATIVO Y
                GRÁFICAS DE EVOLUCIÓN
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

      {/* 🤖 BOTTOM BAR: COPILOTO IA */}
      {(isCopilotOpen || isRecording || isTranscribing) && (
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] transition-colors rounded-none p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <Cpu
                className="w-5 h-5 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">
                {t("clinical_copilot", { defaultValue: "COPILOTO CLÍNICO" })}
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
                {t("copilot_desc_short", {
                  defaultValue: "TRANSCRIPCIÓN EN TIEMPO REAL",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {syncAiSoapNote && (
              <button
                onClick={handleSyncAi}
                disabled={isSyncingAi}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                {isSyncingAi ? (
                  <>
                    <QhSpinner size="sm" className="text-current" /> SINCRONIZANDO...
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} /> SINCRONIZAR IA
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleToggleRecording}
              disabled={isTranscribing}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border",
                isRecording
                  ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-900/20"
                  : "bg-black text-white dark:bg-white dark:text-black border-transparent hover:bg-gray-800 dark:hover:bg-gray-200",
              )}
            >
              {isTranscribing ? (
                <>
                  <QhSpinner size="sm" className="text-current" /> PROCESANDO...
                </>
              ) : isRecording ? (
                <>
                  <Square
                    className="w-3.5 h-3.5 fill-current"
                    strokeWidth={1.5}
                  />{" "}
                  DETENER AUDITORÍA
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" strokeWidth={1.5} /> INICIALIZAR
                  ESCUCHA
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* FOOTER DE COMANDOS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 shrink-0">
        <button
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-black dark:border-white h-12 px-8 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />{" "}
          {t("btn_back", { defaultValue: "RETORNAR" })}
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
        >
          {t("btn_continue_treatment", { defaultValue: "CONTINUAR" })}{" "}
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};
