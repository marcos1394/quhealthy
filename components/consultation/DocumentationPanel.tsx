"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { FileText, Sparkles, Mic, Square, Cpu } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { SoapNotes } from "@/types/ehr";
import { cn } from "@/lib/utils";

interface DocumentationPanelProps {
  soapNotes: SoapNotes;
  updateSoapNote: (field: keyof SoapNotes, value: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  handleToggleRecording: () => void;
}

export const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
  soapNotes,
  updateSoapNote,
  isRecording,
  isTranscribing,
  handleToggleRecording,
}) => {
  const t = useTranslations("EHR");

  return (
    <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-[#0a0a0a] p-6 flex flex-col border-l border-gray-100 dark:border-gray-800 font-sans shadow-sm z-0 transition-colors">
      <Tabs defaultValue="soap" className="h-full flex flex-col">
        {/* ── PESTAÑAS DE NAVEGACIÓN ─────────────────────────────────────── */}
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50/80 dark:bg-[#050505] p-1.5 h-auto rounded-2xl border border-gray-100 dark:border-gray-800 gap-1">
          <TabsTrigger
            value="soap"
            className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
            <span>{t("tab_soap_notes")}</span>
          </TabsTrigger>

          <TabsTrigger
            value="copilot"
            className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs py-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2} />
            <span>{t("tab_ai_copilot")}</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: NOTAS S.O.A.P. MANUALES ───────────────────────────── */}
        <TabsContent
          value="soap"
          className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar m-0 outline-none"
        >
          {/* S - Subjetivo */}
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                S
              </span>
              <span>{t("soap_subjective")}</span>
            </label>
            <Textarea
              value={soapNotes.subjective}
              onChange={(e) => updateSoapNote("subjective", e.target.value)}
              placeholder={t("soap_subjective_placeholder")}
              className="text-xs font-medium h-28 resize-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus-visible:ring-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 p-3 transition-all shadow-xs"
            />
          </div>

          {/* O - Objetivo */}
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                O
              </span>
              <span>{t("soap_objective")}</span>
            </label>
            <Textarea
              value={soapNotes.objective}
              onChange={(e) => updateSoapNote("objective", e.target.value)}
              placeholder={t("soap_objective_placeholder")}
              className="text-xs font-medium h-28 resize-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus-visible:ring-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 p-3 transition-all shadow-xs"
            />
          </div>

          {/* A - Análisis */}
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                A
              </span>
              <span>{t("soap_assessment")}</span>
            </label>
            <Textarea
              value={soapNotes.assessment}
              onChange={(e) => updateSoapNote("assessment", e.target.value)}
              placeholder={t("soap_assessment_placeholder")}
              className="text-xs font-medium h-28 resize-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus-visible:ring-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 p-3 transition-all shadow-xs"
            />
          </div>

          {/* P - Plan */}
          <div className="space-y-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                P
              </span>
              <span>{t("soap_plan")}</span>
            </label>
            <Textarea
              value={soapNotes.plan}
              onChange={(e) => updateSoapNote("plan", e.target.value)}
              placeholder={t("soap_plan_placeholder")}
              className="text-xs font-medium h-28 resize-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus-visible:ring-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 p-3 transition-all shadow-xs"
            />
          </div>
        </TabsContent>

        {/* ── TAB 2: COPILOTO IA ───────────────────────────────────────── */}
        <TabsContent
          value="copilot"
          className="flex-1 flex flex-col justify-center items-center m-0 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 outline-none p-6 shadow-sm"
        >
          <div className="text-center p-4 flex flex-col items-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Cpu className="w-8 h-8" strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                {t("ai_scribe_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("ai_scribe_desc")}
              </p>
            </div>

            <div className="pt-4 w-full">
              <button
                type="button"
                onClick={handleToggleRecording}
                disabled={isTranscribing}
                className={cn(
                  "w-full h-12 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                {isTranscribing ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("btn_processing_audio")}</span>
                  </>
                ) : isRecording ? (
                  <>
                    <Square className="w-4 h-4 fill-current" strokeWidth={2} />
                    <span>{t("btn_stop_recording")}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" strokeWidth={2} />
                    <span>{t("btn_start_listening")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};