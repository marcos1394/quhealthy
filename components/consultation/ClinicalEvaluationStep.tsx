"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import { Mic, Square, Sparkles, Video, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { SoapNotes } from '@/types/ehr';
import { cn } from '@/lib/utils';

interface ClinicalEvaluationStepProps {
  soapNotes: SoapNotes;
  updateSoapNote: (field: keyof SoapNotes, value: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  handleToggleRecording: () => void;
  appointmentType: string;
  onBack: () => void;
  onNext: () => void;
}

export const ClinicalEvaluationStep: React.FC<ClinicalEvaluationStepProps> = ({
  soapNotes,
  updateSoapNote,
  isRecording,
  isTranscribing,
  handleToggleRecording,
  appointmentType,
  onBack,
  onNext
}) => {
  const t = useTranslations('EHR');

  return (
    <div className="h-full flex flex-col gap-8 transition-colors duration-300">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        
        {/* 🤖 COLUMNA IZQUIERDA: COPILOTO IA Y/O VIDEO */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          
          {/* Módulo Escriba IA */}
          <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col justify-center transition-colors">
            <div className="p-8 md:p-10 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-8 shrink-0">
                <Sparkles className="w-6 h-6" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-lg font-bold text-black dark:text-white uppercase tracking-widest mb-4">
                {t('clinical_copilot', { defaultValue: 'COPILOTO CLÍNICO' })}
              </h3>
              
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-10 max-w-xs mx-auto leading-relaxed">
                {t('copilot_desc', { defaultValue: 'SISTEMA DE TRANSCRIPCIÓN ACTIVO. EL AUDIO SERÁ PROCESADO PARA ESTRUCTURAR LAS NOTAS AUTOMÁTICAMENTE.' })}
              </p>
              
              <button 
                onClick={handleToggleRecording}
                disabled={isTranscribing}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-6 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border",
                  isRecording 
                    ? "bg-transparent border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                    : "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200"
                )}
              >
                {isTranscribing ? (
                  <><QhSpinner size="sm" className="text-current"/> PROCESANDO AUDIO...</>
                ) : isRecording ? (
                  <><Square className="w-4 h-4 fill-current" strokeWidth={1.5} /> DETENER AUDITORÍA</>
                ) : (
                  <><Mic className="w-4 h-4" strokeWidth={1.5} /> INICIALIZAR ESCUCHA</>
                )}
              </button>
            </div>
          </div>

          {/* Video Placeholder (Solo si es online) */}
          {appointmentType === 'ONLINE' && (
            <div className="h-48 border border-black dark:border-white bg-black shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="text-center text-white z-20">
                <Video className="w-8 h-8 mx-auto mb-4 opacity-80" strokeWidth={1.5} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {t('patient_camera', { defaultValue: 'SEÑAL DE VIDEO ENTRANTED' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 📝 COLUMNA DERECHA: NOTAS SOAP MANUALES */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col overflow-hidden transition-colors">
            
            {/* Header del Expediente */}
            <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-black dark:border-white shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                <FileText className="w-4 h-4" strokeWidth={1.5} />
                {t('soap_documentation', { defaultValue: 'DOCUMENTACIÓN CLÍNICA (S.O.A.P.)' })}
              </h2>
            </div>
            
            {/* Grid de Inputs */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* S - Subjetivo */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                    <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505] shrink-0">S</span>
                    {t('soap_subjective', { defaultValue: 'SUBJETIVO' })}
                  </label>
                  <Textarea 
                    value={soapNotes.subjective} 
                    onChange={(e) => updateSoapNote('subjective', e.target.value)} 
                    placeholder={t('soap_subjective_placeholder', { defaultValue: 'Motivo de consulta y síntomas referidos por el paciente...' })} 
                    className="h-40 resize-none rounded-none border border-black dark:border-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>
                
                {/* O - Objetivo */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                    <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505] shrink-0">O</span>
                    {t('soap_objective', { defaultValue: 'OBJETIVO' })}
                  </label>
                  <Textarea 
                    value={soapNotes.objective} 
                    onChange={(e) => updateSoapNote('objective', e.target.value)} 
                    placeholder={t('soap_objective_placeholder', { defaultValue: 'Signos vitales, hallazgos físicos y resultados de laboratorio...' })} 
                    className="h-40 resize-none rounded-none border border-black dark:border-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800" />

              {/* A - Apreciación / Assessment */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                  <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505] shrink-0">A</span>
                  {t('soap_assessment', { defaultValue: 'ANÁLISIS' })}
                </label>
                <Textarea 
                  value={soapNotes.assessment} 
                  onChange={(e) => updateSoapNote('assessment', e.target.value)} 
                  placeholder={t('soap_assessment_placeholder', { defaultValue: 'Diagnóstico diferencial, razonamiento clínico y estado actual...' })} 
                  className="h-32 resize-none rounded-none border border-black dark:border-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800" />

              {/* P - Plan */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                  <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505] shrink-0">P</span>
                  {t('soap_plan', { defaultValue: 'PLAN' })}
                </label>
                <Textarea 
                  value={soapNotes.plan} 
                  onChange={(e) => updateSoapNote('plan', e.target.value)} 
                  placeholder={t('soap_plan_placeholder', { defaultValue: 'Tratamiento, medicamentos, estudios solicitados y seguimiento...' })} 
                  className="h-32 resize-none rounded-none border border-black dark:border-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DE COMANDOS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-auto border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={onBack} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-transparent border border-black dark:border-white h-14 px-8 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> {t('btn_back', { defaultValue: 'RETORNAR AL EXPEDIENTE' })}
        </button>
        <button 
          onClick={onNext} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-10 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] rounded-none"
        >
          {t('btn_continue_treatment', { defaultValue: 'CONTINUAR A RECETA Y PLAN' })} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};