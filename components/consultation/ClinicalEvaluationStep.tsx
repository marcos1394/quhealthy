import React from 'react';
import { useTranslations } from "next-intl";
import { Mic, Square, Sparkles, Video, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { SoapNotes } from '@/types/ehr';

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
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* 🤖 COLUMNA IZQUIERDA: COPILOTO IA Y/O VIDEO */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          
          {/* Escriba IA */}
          <Card className="border-teal-100 dark:border-teal-900/50 shadow-sm bg-teal-50/50 dark:bg-teal-950/20 flex-1 flex flex-col justify-center">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-teal-100 dark:border-teal-900">
                <Sparkles className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('clinical_copilot')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-xs mx-auto">
                {t('copilot_desc')}
              </p>
              
              <Button 
                size="lg" 
                onClick={handleToggleRecording}
                disabled={isTranscribing}
                className={`w-full rounded-full h-14 text-base font-medium shadow-md transition-all ${
                  isRecording 
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' 
                    : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white'
                }`}
                variant={isRecording ? 'outline' : 'default'}
              >
                {isTranscribing ? (
                  <><QhSpinner size="sm" className="mr-3 text-teal-600 dark:text-teal-400"/> {t('processing_audio')}</>
                ) : isRecording ? (
                  <><Square className="w-5 h-5 mr-3 fill-current" /> {t('stop_listening')}</>
                ) : (
                  <><Mic className="w-5 h-5 mr-3" /> {t('start_ai_scribe')}</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Video Placeholder (Solo si es online) */}
          {appointmentType === 'video_call' && (
            <div className="h-48 bg-slate-900 dark:bg-black rounded-xl border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
              <div className="text-center text-slate-400 z-20">
                <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">{t('patient_camera')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 📝 COLUMNA DERECHA: NOTAS SOAP MANUALES */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 py-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                {t('soap_documentation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">S</span>
                    {t('soap_subjective')}
                  </label>
                  <Textarea 
                    value={soapNotes.subjective} onChange={(e) => updateSoapNote('subjective', e.target.value)} 
                    placeholder={t('soap_subjective_placeholder')} 
                    className="h-32 resize-none bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">O</span>
                    {t('soap_objective')}
                  </label>
                  <Textarea 
                    value={soapNotes.objective} onChange={(e) => updateSoapNote('objective', e.target.value)} 
                    placeholder={t('soap_objective_placeholder')} 
                    className="h-32 resize-none bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">A</span>
                  {t('soap_assessment')}
                </label>
                <Textarea 
                  value={soapNotes.assessment} onChange={(e) => updateSoapNote('assessment', e.target.value)} 
                  placeholder={t('soap_assessment_placeholder')} 
                  className="h-24 resize-none bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">P</span>
                  {t('soap_plan')}
                </label>
                <Textarea 
                  value={soapNotes.plan} onChange={(e) => updateSoapNote('plan', e.target.value)} 
                  placeholder={t('soap_plan_placeholder')} 
                  className="h-24 resize-none bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100" 
                />
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🚀 BOTONES DE NAVEGACIÓN */}
      <div className="flex justify-between pt-6 mt-auto">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5 mr-2" /> {t('btn_back')}
        </Button>
        <Button onClick={onNext} className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white h-12 px-8 rounded-xl text-base shadow-lg shadow-teal-600/20">
          {t('btn_continue_treatment')} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};