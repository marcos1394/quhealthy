"use client"
/* eslint-disable react-doctor/button-has-type */;

import React from 'react';
import { useTranslations } from "next-intl";
import { Mic, Square, Sparkles, Video, ArrowRight, ArrowLeft, FileText, Cpu } from "lucide-react";
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
          <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col justify-center transition-colors rounded-none">
            <div className="p-8 md:p-10 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-8 shrink-0">
                <Cpu className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-semibold text-black dark:text-white uppercase tracking-tight mb-3">
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
                    ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-900/20" 
                    : "bg-black text-white dark:bg-white dark:text-black border-transparent hover:bg-gray-800 dark:hover:bg-gray-200"
                )}
              >
                {isTranscribing ? (
                  <><QhSpinner size="sm" className="text-current"/> PROCESANDO TELEMETRÍA...</>
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
            <div className="h-48 border border-black dark:border-white bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden rounded-none">
              <div className="text-center text-white z-20">
                <Video className="w-8 h-8 mx-auto mb-4 text-gray-500" strokeWidth={1.5} />
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {t('patient_camera', { defaultValue: 'SEÑAL DE VIDEO ENTRANTE' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 📝 COLUMNA DERECHA: NOTAS SOAP MANUALES */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col overflow-hidden transition-colors rounded-none">
            
            {/* Header del Expediente */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-black dark:border-white shrink-0 flex items-center gap-4">
              <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                <FileText className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Estructura de Valoración
                </p>
                <h2 className="text-lg md:text-xl font-semibold tracking-tight text-black dark:text-white uppercase leading-none">
                  {t('soap_documentation', { defaultValue: 'DOCUMENTACIÓN CLÍNICA (S.O.A.P.)' })}
                </h2>
              </div>
            </div>
            
            {/* Grid Blueprint SOAP */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 h-full">
                
                {/* S - Subjetivo */}
                <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                      S
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('soap_subjective', { defaultValue: 'SUBJETIVO' })}
                    </h4>
                  </div>
                  <Textarea 
                    value={soapNotes.subjective} 
                    onChange={(e) => updateSoapNote('subjective', e.target.value)} 
                    placeholder={t('soap_subjective_placeholder', { defaultValue: 'Motivo de consulta y síntomas referidos por el paciente...' })} 
                    className="flex-1 min-h-[120px] resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>
                
                {/* O - Objetivo */}
                <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                      O
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('soap_objective', { defaultValue: 'OBJETIVO' })}
                    </h4>
                  </div>
                  <Textarea 
                    value={soapNotes.objective} 
                    onChange={(e) => updateSoapNote('objective', e.target.value)} 
                    placeholder={t('soap_objective_placeholder', { defaultValue: 'Signos vitales, hallazgos físicos y resultados de laboratorio...' })} 
                    className="flex-1 min-h-[120px] resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>

                {/* A - Análisis / Assessment */}
                <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                      A
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('soap_assessment', { defaultValue: 'ANÁLISIS' })}
                    </h4>
                  </div>
                  <Textarea 
                    value={soapNotes.assessment} 
                    onChange={(e) => updateSoapNote('assessment', e.target.value)} 
                    placeholder={t('soap_assessment_placeholder', { defaultValue: 'Diagnóstico diferencial, razonamiento clínico y estado actual...' })} 
                    className="flex-1 min-h-[120px] resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>

                {/* P - Plan */}
                <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505] text-xs font-bold text-black dark:text-white">
                      P
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('soap_plan', { defaultValue: 'PLAN' })}
                    </h4>
                  </div>
                  <Textarea 
                    value={soapNotes.plan} 
                    onChange={(e) => updateSoapNote('plan', e.target.value)} 
                    placeholder={t('soap_plan_placeholder', { defaultValue: 'Tratamiento, medicamentos, estudios solicitados y seguimiento...' })} 
                    className="flex-1 min-h-[120px] resize-none rounded-none border border-black/10 dark:border-white/10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white bg-gray-50 dark:bg-[#050505] p-4 text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 shadow-none transition-colors" 
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DE COMANDOS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 mt-auto shrink-0">
        <button 
          onClick={onBack} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-transparent border border-black dark:border-white h-16 px-10 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> {t('btn_back', { defaultValue: 'RETORNAR AL EXPEDIENTE' })}
        </button>
        <button 
          onClick={onNext} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-16 px-12 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
        >
          {t('btn_continue_treatment', { defaultValue: 'CONTINUAR A RECETA Y PLAN' })} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};