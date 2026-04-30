import React from 'react';
import { useTranslations } from "next-intl";
import { FileText, Sparkles, Mic, Square, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { SoapNotes } from '@/types/ehr';

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
  handleToggleRecording
}) => {
  const t = useTranslations('EHR');

  return (
    <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-slate-900 p-4 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none z-0">
      <Tabs defaultValue="soap" className="h-full flex flex-col">
        
        {/* 📝 Pestañas */}
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="soap" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <FileText className="w-4 h-4 mr-2"/> Notas SOAP
          </TabsTrigger>
          <TabsTrigger value="copilot" className="data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4 mr-2"/> Copiloto IA
          </TabsTrigger>
        </TabsList>

        {/* ✍️ TAB: NOTAS SOAP MANUALES */}
        <TabsContent value="soap" className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar m-0 pb-4 outline-none">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">S - {t('soap_subjective')}</label>
            <Textarea 
              value={soapNotes.subjective} 
              onChange={(e) => updateSoapNote('subjective', e.target.value)} 
              placeholder="Motivo de consulta y síntomas narrados por el paciente..." 
              className="text-sm h-24 resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-medical-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">O - {t('soap_objective')}</label>
            <Textarea 
              value={soapNotes.objective} 
              onChange={(e) => updateSoapNote('objective', e.target.value)} 
              placeholder="Signos vitales, exploración física y resultados..." 
              className="text-sm h-24 resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-medical-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">A - {t('soap_assessment')}</label>
            <Textarea 
              value={soapNotes.assessment} 
              onChange={(e) => updateSoapNote('assessment', e.target.value)} 
              placeholder="Análisis clínico y diagnósticos probables..." 
              className="text-sm h-20 resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-medical-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">P - {t('soap_plan')}</label>
            <Textarea 
              value={soapNotes.plan} 
              onChange={(e) => updateSoapNote('plan', e.target.value)} 
              placeholder="Plan de tratamiento, próximos pasos e indicaciones..." 
              className="text-sm h-24 resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-medical-500" 
            />
          </div>
        </TabsContent>

        {/* 🤖 TAB: COPILOTO IA */}
        <TabsContent value="copilot" className="flex-1 flex flex-col justify-center items-center m-0 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 outline-none">
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Escriba Médico Inteligente</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Graba la conversación con tu paciente. La Inteligencia Artificial estructurará automáticamente la nota SOAP y extraerá el diagnóstico probable.
            </p>
            
            <Button 
              size="lg" 
              onClick={handleToggleRecording}
              disabled={isTranscribing}
              className={`w-full rounded-full mt-4 h-12 shadow-md transition-all ${
                isRecording 
                  ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/40' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              variant={isRecording ? 'outline' : 'default'}
            >
              {isTranscribing ? (
                 <><QhSpinner size="sm" className="mr-2 text-indigo-600 dark:text-indigo-400"/> Procesando audio...</>
              ) : isRecording ? (
                <><Square className="w-5 h-5 mr-2 fill-current" /> Detener Grabación</>
              ) : (
                <><Mic className="w-5 h-5 mr-2" /> Iniciar Escucha</>
              )}
            </Button>
          </div>
        </TabsContent>

      </Tabs>
    </aside>
  );
};