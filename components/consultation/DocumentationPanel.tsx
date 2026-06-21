import React from 'react';
import { useTranslations } from "next-intl";
import { FileText, Sparkles, Mic, Square } from "lucide-react";
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
    <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-[#0a0a0a] p-6 flex flex-col border-l border-black dark:border-white shadow-[-8px_0_0_0_#000] dark:shadow-[-8px_0_0_0_#fff] z-0">
      <Tabs defaultValue="soap" className="h-full flex flex-col">
        
        {/* 📝 Pestañas */}
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border border-black dark:border-white p-0 h-12 rounded-none">
          <TabsTrigger 
            value="soap" 
            className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none text-[10px] font-bold uppercase tracking-widest h-full transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} /> NOTAS SOAP
          </TabsTrigger>
          <TabsTrigger 
            value="copilot" 
            className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none text-[10px] font-bold uppercase tracking-widest h-full transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} /> COPILOTO IA
          </TabsTrigger>
        </TabsList>

        {/* ✍️ TAB: NOTAS SOAP MANUALES */}
        <TabsContent value="soap" className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar m-0 outline-none">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505]">S</span>
              {t('soap_subjective')}
            </label>
            <Textarea 
              value={soapNotes.subjective} 
              onChange={(e) => updateSoapNote('subjective', e.target.value)} 
              placeholder="MOTIVO DE CONSULTA Y SÍNTOMAS NARRADOS POR EL PACIENTE..." 
              className="text-xs font-light h-28 resize-none rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black shadow-none" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505]">O</span>
              {t('soap_objective')}
            </label>
            <Textarea 
              value={soapNotes.objective} 
              onChange={(e) => updateSoapNote('objective', e.target.value)} 
              placeholder="SIGNOS VITALES, EXPLORACIÓN FÍSICA Y RESULTADOS..." 
              className="text-xs font-light h-28 resize-none rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black shadow-none" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505]">A</span>
              {t('soap_assessment')}
            </label>
            <Textarea 
              value={soapNotes.assessment} 
              onChange={(e) => updateSoapNote('assessment', e.target.value)} 
              placeholder="ANÁLISIS CLÍNICO Y DIAGNÓSTICOS PROBABLES..." 
              className="text-xs font-light h-24 resize-none rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black shadow-none" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <span className="border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505]">P</span>
              {t('soap_plan')}
            </label>
            <Textarea 
              value={soapNotes.plan} 
              onChange={(e) => updateSoapNote('plan', e.target.value)} 
              placeholder="PLAN DE TRATAMIENTO, PRÓXIMOS PASOS E INDICACIONES..." 
              className="text-xs font-light h-28 resize-none rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black shadow-none" 
            />
          </div>
        </TabsContent>

        {/* 🤖 TAB: COPILOTO IA */}
        <TabsContent value="copilot" className="flex-1 flex flex-col justify-center items-center m-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white outline-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <div className="text-center p-8 flex flex-col items-center">
            <div className="w-16 h-16 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            </div>
            
            <h3 className="font-serif italic font-bold text-2xl text-black dark:text-white uppercase mb-4">
              Escriba Médico Inteligente
            </h3>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-xs mb-8">
              GRABA LA CONVERSACIÓN CON TU PACIENTE. LA INTELIGENCIA ARTIFICIAL ESTRUCTURARÁ AUTOMÁTICAMENTE LA NOTA SOAP Y EXTRAERÁ EL DIAGNÓSTICO PROBABLE.
            </p>
            
            <button 
              onClick={handleToggleRecording}
              disabled={isTranscribing}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                isRecording 
                  ? 'bg-transparent border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-[4px_4px_0_0_#dc2626]' 
                  : 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]'
              } disabled:opacity-50`}
            >
              {isTranscribing ? (
                 <><QhSpinner size="sm" className="text-current"/> PROCESANDO AUDIO...</>
              ) : isRecording ? (
                <><Square className="w-4 h-4 fill-current" strokeWidth={1.5} /> DETENER GRABACIÓN</>
              ) : (
                <><Mic className="w-4 h-4" strokeWidth={1.5} /> INICIAR ESCUCHA</>
              )}
            </button>
          </div>
        </TabsContent>

      </Tabs>
    </aside>
  );
};